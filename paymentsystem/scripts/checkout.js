document.addEventListener("DOMContentLoaded", function () {
    const basketItemsContainer = document.getElementById("basket-items");
    const totalText = document.getElementById("basket-total-text");
    const checkoutForm = document.getElementById("checkout-form");
    let basket = JSON.parse(localStorage.getItem("basket")) || [];

    let total = 0;

   
    if (basket.length === 0) {
        basketItemsContainer.innerHTML = "<p>Kurven er tom</p>";
        totalText.textContent = "Total (0 varer) DKK 0";
    } else {
        basket.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item-details");

            const priceNumber = parseInt(item.price.replace(/[^\d]/g, ''), 10);
            total += priceNumber;

            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.info}</p>
                <strong>DKK ${priceNumber}</strong>
                <br>
                <a href="#" class="remove-item" data-index="${index}">Fjern</a>
                <hr>
            `;

            basketItemsContainer.appendChild(itemDiv);
        });

        totalText.textContent = `Total (${basket.length} vare${basket.length > 1 ? "r" : ""}) DKK ${total}`;
    }

   
    basketItemsContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-item")) {
            e.preventDefault();
            const index = parseInt(e.target.getAttribute("data-index"), 10);
            basket.splice(index, 1);
            localStorage.setItem("basket", JSON.stringify(basket));
            location.reload(); 
        }
    });

    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (basket.length === 0) {
            alert("Din kurv er tom. Tilføj en vare før du fortsætter.");
            return;
        }

        const totalPrice = total;

        
        window.location.href = `paymentselection.html?totalPrice=${totalPrice}`;

        try {
            const response = await fetch("http://localhost:3000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalPrice })
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
