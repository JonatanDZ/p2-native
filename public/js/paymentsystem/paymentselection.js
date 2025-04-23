
document.addEventListener("DOMContentLoaded", function () {
    const payButton = document.getElementById("checkout-button");
    const paymentForm = document.getElementById("payment-form");
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    let totalPrice = 0;
    basket.forEach(item => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        const quantity = item.quantity || 1;
        totalPrice += price * quantity;
    });
    payButton.textContent = `Godkend og betal DKK ${totalPrice}`;
    paymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
            alert("Vælg en betalingsmetode først.");
            return;

        }
        
        const email = localStorage.getItem("userEmail");
        if (!email) {
        alert("Ingen e-mail fundet. Gå tilbage og udfyld din e-mail.");
        return;

        }
        
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

            const session = await response.json();
            
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
