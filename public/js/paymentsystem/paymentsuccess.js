document.addEventListener("DOMContentLoaded", async function () {
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    const email = localStorage.getItem("userEmail");
    const totalPrice = localStorage.getItem("lastTotalPrice") || 0;

    
    const priceElement = document.getElementById("total-price");
    if (priceElement) {
        priceElement.textContent = `${totalPrice}`;
    }

    if (basket.length > 0 && email) {
        try {
            await fetch("http://localhost:3000/send-confirmation-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ basket, email })
            });
        } catch (err) {
            console.error("Could not send confirmation email:", err);
        }
    }

    localStorage.removeItem("basket");
    localStorage.removeItem("lastTotalPrice");
});
