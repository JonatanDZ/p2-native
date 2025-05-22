export { displayProduct, addToBasket };

// bliver brugt af admin og ikke produkt page levn fra fortiden
document.addEventListener("DOMContentLoaded", async () => {
    // udvidet den lidt så den kan tage flere kald på en side
    const apiContainers = document.querySelectorAll(".api-call");
    apiContainers.forEach((container) => {
        const endpoint = container.dataset.endpoint;
        if (endpoint) readFromDB(endpoint);
    });
});

async function readFromDB(endpoint) {
    //endpointet bliver defineret på den givne html side fx: <div class="api-call" data-endpoint="/get-products"></div>
    fetch(endpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json()) //json conversion
        .then((data) => {
            displayFromDB(data);
        })
        .catch((error) => {
            console.error("Error receiving data from /get-products:", error);
        });
}

function displayFromDB(data) {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    data.forEach((product) => {
        productsContainer.appendChild(displayProduct(product));
    });

    productsContainer.addEventListener("click", function (e) {
        if (e.target && e.target.classList.contains("add-to-basket")) {
            e.preventDefault();
            const productId = parseInt(e.target.getAttribute("data-id"));
            const product = data.find((p) => p.ID === productId);
            if (product) {
                addToBasket(product);
            }
        }
    });
}

function addToBasket(product) {
    let basket = JSON.parse(localStorage.getItem("basket")) || [];
    const existingProduct = basket.find((item) => item.id === product.ID);
    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        const productToAdd = {
            id: product.ID,
            name: product.name,
            price: product.price,
            info: product.info || "",
            quantity: 1
        };
        basket.push(productToAdd);
    }
    localStorage.setItem("basket", JSON.stringify(basket));
    alert("Produktet er tilføjet til kurven!");
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
                const res = await fetch(
                    `/search-product?query=${encodeURIComponent(query)}`
                );
                const products = await res.json();
                displayFromDB(products);
            } catch (err) {
                console.error("Error searching products:", err);
            }
        });
    }
});

//path is for when you're not in the product folder
function displayProduct(product, path = "") {
    const card = document.createElement("div");
    card.className = "card";

    const productLink = document.createElement("a");
    productLink.href = `${path}productdetail.html?id=${product.ID}`;
    productLink.target = "_blank";

    const img = document.createElement("img");
    img.src = product.picture;
    img.alt = product.name || "Product image";
    img.style.width = "200px";
    img.style.height = "250px";
    img.style.objectFit = "cover";
    img.style.objectPosition = "center";

    productLink.appendChild(img);

    const title = document.createElement("h4");
    title.textContent = product.name || "Untitled";

    const price = document.createElement("p");
    price.textContent = `${product.price},-` || "Price not available";

    const button = document.createElement("button");
    button.className = "add-to-basket";
    button.dataset.id = product.ID;
    button.textContent = "Tilføj til kurv";

    card.appendChild(productLink);
    card.appendChild(price);
    card.appendChild(title);
    card.appendChild(button);
    return card;
}
