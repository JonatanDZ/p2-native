const http = require("http");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Send confirmation email using Gmail softwaregruppe3@gmail.com
async function sendConfirmationEmail(recipientEmail, basket, shopNames) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const itemList = basket.map(item => {
        const quantity = item.quantity || 1;
        return `<li>${item.name} x ${quantity} – ${item.price}</li>`;
    }).join("");

    const shopList = shopNames.map(shop => `<li>${shop}</li>`).join("");

    const mailOptions = {
        from: `"Din Butik" <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: "Din ordrebekræftelse",
        html: `
            <h2>Tak for din ordre!</h2>
            <p>Her er dine varer:</p>
            <ul>${itemList}</ul>
            <p><strong>Afhentes i butik:</strong></p>
            <ul>${shopList}</ul>
            <p>Vi glæder os til at se dig!</p>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent!");
    console.log("Message ID:", info.messageId);
}

const server = http.createServer(async (req, res) => {
    console.log("Incoming request:", req.method, req.url);


    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end();
        return;
    }

    // Creates checkout session
    if (req.url === "/create-checkout-session" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
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
                        basket: JSON.stringify(basket)
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

    // Stripe webhook
    if (req.url === "/webhook" && req.method === "POST") {
        console.log("Webhook endpoint hit");
    
        const chunks = [];
        req.on("data", chunk => chunks.push(chunk));
        req.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            const sig = req.headers["stripe-signature"];
    
            let event;
            try {
                event = stripe.webhooks.constructEvent(
                    buffer,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } catch (err) {
                console.error("Webhook constructEvent failed:", err.message);
                res.writeHead(400);
                res.end(`Webhook Error: ${err.message}`);
                return;
            }
    
            console.log("Valid webhook event:", event.type);
    
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                const email = session.customer_email;
            
                let basket = [];
                try {
                    if (session.metadata && session.metadata.basket) {
                        basket = JSON.parse(session.metadata.basket);
                    } else {
                        console.warn("No basket data found in metadata");
                    }
                } catch (error) {
                    console.error("Failed to parse basket JSON:", error.message);
                    basket = [];
                }
            
                const shopNames = [...new Set(basket.map(item => item.info).filter(Boolean))];
            
                if (email && basket.length) {
                    console.log("Sending confirmation email to:", email);
                    await sendConfirmationEmail(email, basket, shopNames);
                } else {
                    console.warn("Missing email or basket for sending confirmation");
                }
            }
    
            res.writeHead(200);
            res.end();
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
