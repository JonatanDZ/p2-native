import { getUserId } from "../frontpage.js";

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

async function displayFromDB(data) {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    // getting the userId in order to display the admins published items
    const userId = await getUserId();

    data.forEach(product => {
        //checking if the logged in user is the product owner
        if (userId === product.shopID) {
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

            const deleteButton = document.createElement('button');
            deleteButton.textContent = `Delete product` || 'Deletion is not available';

            card.appendChild(productLink);
            card.appendChild(price);
            card.appendChild(title);
            card.appendChild(deleteButton);
            productsContainer.appendChild(card);

            // logic for pressing the delete button:
            deleteButton.addEventListener("click", function (e) {
                // making a POST request to the API to delete item.
                //  passing the product id
                // small issue: the user has to update the page to see the change
                deleteReq(product.ID);
                alert(`Du har nu slettet produkt: ${product.name}. 
                    Opdater siden for at se ændringen!
                `);
            })
        }

    });
}

async function deleteReq(ID) {
    fetch("/delete-product", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId: ID })
    })
        .then(res => res.json())
        .then(data => {
            if (data.productDeleted) {
                console.log("Product deleted!", data);
            } else {
                console.log("Product not found.");
            }
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");

    if (searchInput) {
        searchInput.addEventListener("input", async (e) => {
            const query = e.target.value.trim();

            if (query.length === 0) {
                readFromDB("/get-products"); // fallback to all products
                return;
            }

            try {
                const res = await fetch(`/search-product?query=${encodeURIComponent(query)}`);
                const products = await res.json();
                displayFromDB(products); // your existing function to render
            } catch (err) {
                console.error("Error searching products:", err);
            }
        });
    }
});
