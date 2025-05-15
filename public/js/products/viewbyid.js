async function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");          //extracts id from url
  const type = window.location.pathname.includes("product")
    ? "product"
    : "event";                          //determines if its a single event or products thats to be rendered

  if (!id) {                            //error handling
    document.getElementById("detail-container").innerHTML = `
            <p>${type.charAt(0).toUpperCase() + type.slice(1)} not found</p>
            <a href="/public/pages/${type}s/${type}s.html">Return to ${type}s</a>
        `;
    return;
  }

  try {
    const response = await fetch(`/get-${type}?id=${id}`);
    const data = await response.json();  //api call to get data by id

    if (!data) throw new Error("Not found");

    renderDetailPage(data, type);
    setupEventListeners(data, type);
  } catch (error) {
    console.error(`Error loading ${type}:`, error);
    document.getElementById("detail-container").innerHTML = `
            <p>${type.charAt(0).toUpperCase() + type.slice(1)} not found</p>
            <a href="/public/pages/${type}s/${type}s.html">Return to ${type}s</a>
        `;
  }
}

function renderDetailPage(data, type) {
  const container = document.getElementById("detail-container");
  if (type === "product") {
    //for products
    container.innerHTML = `
            <div class="detail-image">
                <img src="${data.picture}" alt="${data.name}">
            </div>
            <div class="detail-info">
                <h1>${data.name}</h1>
                <p>${data.description || ""}</p>
                <p class="price">${data.price},-</p>
                <button class="add-to-cart" data-id="${
                  data.ID
                }">Add to Cart</button>
            </div>
        `;
  } else {
    //for events
    container.innerHTML = `
            <div class="detail-image">
                <img src="${data.image}" alt="${data.name}">
            </div>
            <div class="detail-info">
                <h1>${data.name}</h1>
                <p>${data.info || ""}</p>
                <p>Date: ${new Date(data.time).toLocaleDateString()}</p>
                <p>Location: ${data.place}</p>
                <button class="register" data-id="${data.ID}">Register</button>
            </div>
        `;
  }
}

function setupEventListeners(data, type) {
  const container = document.getElementById("detail-container");

  if (type === "product") {
    container.addEventListener("click", function (e) {
      if (e.target && e.target.classList.contains("add-to-cart")) {
        e.preventDefault();
        addToBasket(data);
      }
    });
  } else {
    // Event registration logic would go here
  }
}

async function addToBasket(productId) {
  try {
    const response = await fetch(`/get-product?id=${productId}`);
    const product = await response.json();

    if (!product) throw new Error("Product not found");

    let basket = JSON.parse(localStorage.getItem("basket")) || [];
    const existingProduct = basket.find((item) => item.id == productId);

    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
      product.quantity = 1;
      basket.push(product);
    }

    localStorage.setItem("basket", JSON.stringify(basket));
    alert("Product added to basket!");
  } catch (error) {
    console.error("Error adding to basket:", error);
    alert("Could not add product to basket");
  }
}

document.addEventListener("DOMContentLoaded", loadDetailPage);
