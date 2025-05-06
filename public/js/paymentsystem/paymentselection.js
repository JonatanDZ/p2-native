// Waits for the DOM to fully load before executing the script to ensure all elements are available
document.addEventListener("DOMContentLoaded", function () {
    const payButton = document.getElementById("checkout-button");
    const paymentForm = document.getElementById("payment-form");

    // Parsing the saved products in the local storage into the basket
    const basket = JSON.parse(localStorage.getItem("basket")) || [];

    // This function gets the total price from the local storage
    const totalPrice = localStorage.getItem("lastTotalPrice") || 0;

    // Change the text on the checkout button to show the total price
    payButton.textContent = `Godkend og betal DKK ${totalPrice}`;

    // Submit event for the payment form 
    paymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
            alert("Vælg en betalingsmetode først.");
            return;

        }
        
        // Gets the email from local storage
        const email = localStorage.getItem("userEmail");
        if (!email) {
        alert("Ingen e-mail fundet. Gå tilbage og udfyld din e-mail.");
        return;

        }
        
        // Makes a POST request to the backend server to create a checkout session
        try {
            const response = await fetch("http://localhost:3000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    totalPrice: totalPrice,
                    basket: basket,
                    email: email,
                    paymentMethod: selectedPaymentMethod.value
                })
            });

            // Awaits for the response from the server
            const session = await response.json();
            
            // If the session URL is available, redirect to it with the total price
            if (session.url) {
                localStorage.setItem("lastTotalPrice", totalPrice);
                window.location.href = session.url;
            } else {
                alert("Fejl: Kunne ikke oprette en betalingssession.");
            }
        } catch (error) {
            console.error("Fejl under checkout:", error);
            alert("Noget gik galt! Prøv igen.");
        }
    });
});
