document.addEventListener("DOMContentLoaded", function () {
    // Get total price from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const totalPrice = urlParams.get("totalPrice");

    // Ensure price exists and is valid
    const totalPriceElement = document.getElementById("total-price");
    const payButton = document.getElementById("checkout-button");

    if (!totalPrice || isNaN(totalPrice)) {
        totalPriceElement.textContent = "0"; // Default to 0 if missing
        payButton.textContent = "Godkend og betal DKK 0";
    } else {
        totalPriceElement.textContent = totalPrice;
        payButton.textContent = `Godkend og betal DKK ${totalPrice}`;
    }

    // Handle payment submission
    const paymentForm = document.querySelector("#payment-form");

    paymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
            alert("Vælg en betalingsmetode først.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalPrice: totalPrice, paymentMethod: selectedPaymentMethod.value }) // Send total price and method to Stripe
            });

            const session = await response.json();

            if (session.url) {
                window.location.href = session.url;  // Redirect to Stripe Checkout
            } else {
                alert("Fejl: Kunne ikke oprette en betalingssession.");
            }
        } catch (error) {
            console.error("Fejl under checkout:", error);
            alert("Noget gik galt! Prøv igen.");
        }
    });
});
