
document.addEventListener("DOMContentLoaded", function () {
    const quantityInput = document.getElementById("quantity-input");
    const totalPriceElement = document.getElementById("total-price");
    const removeItemButton = document.getElementById("remove-item");
    const checkoutForm = document.getElementById("checkout-form");
    const basketTotalText = document.getElementById("basket-total-text");
    let pricePerItem = 600;

    // Load saved quantity from localStorage
    let savedQuantity = localStorage.getItem("basketQuantity");
    if (savedQuantity) {
        quantityInput.value = savedQuantity;
        updateTotalPrice(savedQuantity);
    } else {
        updateTotalPrice(1); // Default to 1
    }

    // Function to update total price and basket summary
    function updateTotalPrice(quantity) {
        const totalPrice = quantity * pricePerItem;
        totalPriceElement.textContent = totalPrice;
        basketTotalText.textContent = `Total (${quantity} Vare) DKK ${totalPrice}`;
        localStorage.setItem("basketQuantity", quantity);
    }

    // Update price dynamically when quantity changes
    quantityInput.addEventListener("input", function () {
        let newQuantity = parseInt(quantityInput.value, 10);
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
        } else if (newQuantity > 99) {
            newQuantity = 99;
        }
        quantityInput.value = newQuantity;
        updateTotalPrice(newQuantity);
    });

    // Remove item from basket
    removeItemButton.addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".basket-overview").innerHTML = "<p>Kurven er tom</p>";
        totalPriceElement.textContent = "0";
        basketTotalText.textContent = "Total (0 Vare) DKK 0";
        localStorage.removeItem("basketQuantity");
    });

    // Handle checkout form submission
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        let totalPrice = totalPriceElement.textContent;
        
        if (totalPrice === "0" || !totalPrice) {
            alert("Din kurv er tom. Tilføj en vare før du fortsætter.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalPrice: totalPrice })
            });

            const session = await response.json();

            if (session.url) {
                window.location.href = session.url;  // Redirect to Stripe Checkout
            } else {
                alert("Error: Kunne ikke oprette en betalingssession.");
            }
        } catch (error) {
            console.error("Fejl under checkout:", error);
            alert("Noget gik galt!");
        }
    });
});
