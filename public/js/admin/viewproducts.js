document.addEventListener("DOMContentLoaded", async () => {              // udvidet den lidt så den kan tage flere kald på en side
    const apiContainers = document.querySelectorAll('.api-call');
    apiContainers.forEach(container => {
        const endpoint = container.dataset.endpoint;
        if (endpoint) readFromDB(endpoint);
    });
});

async function readFromDB(endpoint) {   //endpointet bliver defineret på den givne html side fx: <div class="api-call" data-endpoint="/get-products"></div>
    fetch(endpoint, {
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

function displayFromDB(data) {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';

    data.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';

        const productLink = document.createElement('a');
        productLink.href = `productdetail.html?id=${product.ID || product.id}`;
        productLink.target = "_blank";

        const img = document.createElement('img');
        img.src = product.image || product.picture;
        img.alt = product.name || 'Product image';
        
        img.style.width = '200px';
        img.style.height = '250px';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center'; 

        productLink.appendChild(img);

        const title = document.createElement('h4');
        title.textContent = product.name || 'Untitled';

        const price = document.createElement('p');
        price.textContent = `${product.price},-` || 'Price not available';

        card.appendChild(productLink);
        card.appendChild(price);
        card.appendChild(title);
        
        productsContainer.appendChild(card);
    });
}
