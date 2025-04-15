const http = require("http");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
                    cancel_url: "http://localhost:5500/public/pages/paymentsystem/paymentfail.html"
                });

                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({ url: session.url }));

            } catch (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (req.url === "/send-confirmation-email" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const { email, basket } = JSON.parse(body);
                const shopNames = [...new Set(basket.map(item => item.info))];

                await sendConfirmationEmail(email, basket, shopNames);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message }));
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
