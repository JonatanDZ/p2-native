// paymentselection.js
document.addEventListener("DOMContentLoaded", function () {
    const paymentForm = document.getElementById("payment-form");
    const checkoutButton = document.getElementById("checkout-button");
    const urlParams = new URLSearchParams(window.location.search);
    const totalPrice = urlParams.get("totalPrice") || 0;

    // Update button text with total price
    checkoutButton.textContent = `Godkend og betal DKK ${totalPrice}`;

    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');

        if (!selectedPayment) {
            alert("Vælg en betalingsmetode først.");
            return;
        }

        // Redirect to payment success (In a real-world scenario, this would go to a payment gateway)
        window.location.href = `paymentsuccess.html?totalPrice=${totalPrice}`;
    });
});
