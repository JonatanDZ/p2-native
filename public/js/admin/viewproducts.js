
document.addEventListener("DOMContentLoaded", function () {
    fetch('mock_db/products.json')
        .then(response => response.json())
        .then(products => {
            const productsContainer = document.getElementById("products-container");

            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                
                productCard.innerHTML = `
                <div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="${product.image}" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.info}</p>
                        <p class="product-price">${product.price}</p>
                        <a href="#" class="btn btn-primary">View product</a>
                    </div>
                </div>
                `;
                productsContainer.appendChild(productCard);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
});