document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const totalPrice = urlParams.get("totalPrice") || 0;
    document.getElementById("total-price").textContent = totalPrice;
});
