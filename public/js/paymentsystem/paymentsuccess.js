document.addEventListener("DOMContentLoaded", function () {
    
    const totalPrice = localStorage.getItem("lastTotalPrice") || 0;

    const priceElement = document.getElementById("total-price");
    if (priceElement) {
        priceElement.textContent = `${totalPrice}`;
    }

    localStorage.removeItem("basket");
    localStorage.removeItem("lastTotalPrice");
});
