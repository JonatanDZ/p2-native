// Waits for the DOM to fully load before executing the script to ensure all elements are available
document.addEventListener("DOMContentLoaded", function () {

    // Selects the necessary DOM elements by getting each element from the HTML page using its id
    const basketItemsContainer = document.getElementById("basket-items"); // Container for displaying items in the basket
    const totalText = document.getElementById("basket-total-text"); // display total price of items in the basket
    const checkoutForm = document.getElementById("checkout-form"); // Customer information form
    const removeAllButton = document.getElementById("remove-all"); // Button to remove all items from the basket
    const clickAndCollectElement = document.getElementById("click-and-collect"); // Displays the webshops in the buttom

    // loading the saved products in the local storage into the basket
    let basket = JSON.parse(localStorage.getItem("basket")) || [];

    // Total price always initilized to 0
    let total = 0;

    // Removes all items from basket
    if (removeAllButton) {
        removeAllButton.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("basket");
            location.reload();
        });
    }
    
    // Displays items in basket
    // If the basket is empty, it shows a message indicating that the basket is empty
    if (basket.length === 0) {
        basketItemsContainer.innerHTML = "<p>Kurven er tom</p>";
        totalText.textContent = "Total (0 varer) DKK 0";
        clickAndCollectElement.innerHTML = "";
        
    } else {
        basket.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item-details");
            const priceNumber = parseInt(item.price.replace(/[^\d]/g, ''), 10);
            const quantity = item.quantity || 1;
            const itemTotal = priceNumber * quantity;
            total += itemTotal;
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.info || ''}</p>
                <p>Pris: DKK ${priceNumber}</p><br>
                <p>Antal:
                    <input type="number" class="quantity-input" data-index="${index}" value="${quantity}" min="1" max="99">
                </label><br>
                <p>Subtotal: DKK ${itemTotal}</p><br>
                <a href="#" class="remove-item" data-index="${index}">Fjern</a>
                <hr>
            `;
            basketItemsContainer.appendChild(itemDiv);
        });
        
        const totalQuantity = basket.reduce((sum, item) => sum + (item.quantity || 1), 0);
        totalText.textContent = `Total (${totalQuantity} vare${totalQuantity > 1 ? "r" : ""}) DKK ${total}`;

        // Displays click and collect information
        const shopNames = [...new Set(basket.map(item => item.info).filter(Boolean))];
        if (shopNames.length > 0) {
            const shopLines = shopNames.map(shop => `<p><strong>Afhent i butik:</strong> ${shop}</p>`).join("");
            clickAndCollectElement.innerHTML = shopLines;
        } else {
            clickAndCollectElement.innerHTML = "";
        }
        
    }
    // Removes the individual items from basket
    basketItemsContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-item")) {
            e.preventDefault();
            const index = parseInt(e.target.getAttribute("data-index"), 10);
            basket.splice(index, 1);
            localStorage.setItem("basket", JSON.stringify(basket));
            location.reload();
        }
    });
    // Handles quantity changes
    basketItemsContainer.addEventListener("input", function (e) {
        if (e.target.classList.contains("quantity-input")) {
            const index = parseInt(e.target.getAttribute("data-index"), 10);
            let newQty = parseInt(e.target.value, 10);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
            if (newQty > 99) newQty = 99;
            basket[index].quantity = newQty;
            localStorage.setItem("basket", JSON.stringify(basket));
            location.reload(); 
        }
    });
    
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        if (emailInput && emailInput.value) {
            localStorage.setItem("userEmail", emailInput.value);
        }

        if (basket.length === 0) {
            alert("Din kurv er tom. Tilføj en vare før du fortsætter.");
            return;
        }
        const totalPrice = basket.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ''), 10);
            const quantity = item.quantity || 1;
            return sum + price * quantity;
        }, 0);
        
        window.location.href = `paymentselection.html`;
        
        try {
            const response = await fetch("http://localhost:3000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    totalPrice,
                    basket,
                    email: localStorage.getItem("userEmail")
                 })
            });
            const session = await response.json();
            if (session.url) {
                window.location.href = session.url;
            } else {
                alert("Fejl: Kunne ikke oprette betalingssession.");
            }
        } catch (error) {
            console.error("Fejl under checkout:", error);
            alert("Noget gik galt!");
        }
    });
});
