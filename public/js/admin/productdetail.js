
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
document.addEventListener("DOMContentLoaded", function () {
    const productId = getProductIdFromUrl();
    if (!productId) {
        document.getElementById("product-detail").innerHTML = "<p>Product not found.</p>";
        return;
    }

    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(e => e.id.toString() === productId);

            if (!product) {
                document.getElementById("product-detail").innerHTML = "<p>Product not found.</p>";
                return;
            }

            document.getElementById("product-detail").innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h1>${product.name}</h1>
                <p>${product.info}</p>
                <p>Price: ${product.price}</p>
            `;
        })
        .catch(error => console.error("Error fetching product details:", error));
});