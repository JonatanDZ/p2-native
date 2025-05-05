// Waits for the DOM to fully load before executing the script to ensure all elements are available
document.addEventListener("DOMContentLoaded", async function () {

    // Gets basket, email, and the total price from local storage
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    const email = localStorage.getItem("userEmail");
    const totalPrice = localStorage.getItem("lastTotalPrice") || 0;

    // Shows total price in the HTML element with id "total-price"
    const priceElement = document.getElementById("total-price");
    if (priceElement) {
        priceElement.textContent = `${totalPrice}`;
    }

    // Checks if the basket is not empty and the email is available
    if (basket.length > 0 && email) {
        
        // Sends a POST request to the backend server with basket and email data for sending the order confirmation email.
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

    // Clears the basket and last total price from local storage / basket
    localStorage.removeItem("basket");
    localStorage.removeItem("lastTotalPrice");
});
