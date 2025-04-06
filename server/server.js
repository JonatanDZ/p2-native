const http = require("http");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Creates a HTTP server
// Listens for POST requests to create a checkout session
const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end();
        return;
    }

    if (req.url === "/create-checkout-session" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => (body += chunk.toString()));
        req.on("end", async () => {
            try {
                const { totalPrice, email, basket } = JSON.parse(body);

                if (!totalPrice || !email || !basket) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Missing data" }));
                    return;
                }

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [{
                        price_data: {
                            currency: "dkk",
                            product_data: { name: "Din kurv" },
                            unit_amount: Math.round(Number(totalPrice) * 100),
                        },
                        quantity: 1,
                    }],
                    mode: "payment",
                    customer_email: email,
                    success_url: "http://localhost:5500/public/pages/paymentsystem/paymentsuccess.html",
                    cancel_url: "http://localhost:5500/public/pages/paymentsystem/paymentfail.html",
                    metadata: {
                        basket: JSON.stringify(basket),
                    }
                });

                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({ url: session.url }));

            } catch (err) {
                console.error("Stripe error:", err.message);
                res.writeHead(500, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;

    }

    // Stripe Webhook (Stripe tells server if payment is successful)
    if (req.url === "/webhook" && req.method === "POST") {
        let rawData = [];
        req.on("data", chunk => rawData.push(chunk));
        req.on("end", async () => {
            try {
                const sig = req.headers["stripe-signature"];
                const buffer = Buffer.concat(rawData);

                const event = stripe.webhooks.constructEvent(
                    buffer,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET
                );

                if (event.type === "checkout.session.completed") {
                    const session = event.data.object;
                    const email = session.customer_email;
                    const basket = JSON.parse(session.metadata.basket);

                    const shopNames = [...new Set(basket.map(item => item.info))];
                    const productLines = basket.map(item => `• ${item.name} (${item.info})`).join("\n");

                    // Sender email
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS
                        }
                    });

                    await transporter.sendMail({
                        from: `"LokalLivet Aalborg" <${process.env.GMAIL_USER}>`,
                        to: email,
                        subject: "Tak for din ordre!",
                        text: `Hej!\n\nDu har købt:\n${productLines}\n\nAfhent i butik:\n${shopNames.join("\n")}\n\nTak for dit køb!`
                    });

                    console.log("Email sent to:", email);
                }

                res.writeHead(200);
                res.end();
            } catch (err) {
                console.error("Webhook error:", err.message);
                res.writeHead(400);
                res.end(`Webhook Error: ${err.message}`);
            }
        });
        return;
    }
                res.writeHead(404, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({ error: "Not found" }));
            });

            server.listen(3000, () => {
                console.log("Server running at http://localhost:3000");
            });