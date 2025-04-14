document.addEventListener("DOMContentLoaded", async function () {
    readFromDB();


});

async function readFromDB() {
    fetch('/get-products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayFromDB(data);
    })
    .catch(error => {
        console.error("Error receiving data from /get-products:", error);
    });
}

function displayFromDB(data){
    const productsContainer = document.getElementById("products-container");
    data.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        
        productCard.innerHTML = `
        <div class="card" style="width: 18rem;">
            <img class="card-img-top" src="${product.image}" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">Info: ${product.info}</p>
                <p class="product-shop">Butik: ${product.shop}</p>
                <p class="product-price">Pris: ${product.price},-</p>
                <p class="product-amount">Mængde: ${product.amount}</p>
            </div>
        </div>
        `;
        productsContainer.appendChild(productCard);
    }); 
}