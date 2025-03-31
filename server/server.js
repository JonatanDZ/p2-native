
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.use(express.json());
app.use(cors());
// Create a Stripe Checkout session
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { totalPrice } = req.body;
        // Validate the totalPrice
        if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
            return res.status(400).json({ error: "Invalid total price" });
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "dkk",
                    product_data: { name: "BLS Oversize T-shirt" },
                    unit_amount: totalPrice * 100, // Convert DKK to cents/øre
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: "http://localhost:5500/public/pages/paymentsystem/paymentsuccess.html?totalPrice=" + totalPrice,
            cancel_url: "http://localhost:5500/public/pages/paymentsystem/paymentfail.html",
        });
        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe API Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
