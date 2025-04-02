document.addEventListener("DOMContentLoaded", function () {
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    let total = 0;

    basket.forEach(item => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        const quantity = item.quantity || 1;
        total += price * quantity;
    });

    document.getElementById("total-price").textContent = total;
});
