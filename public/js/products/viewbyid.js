import { getUserId, getRecommendedItemsHTML } from "../frontpage.js";
import { displayProduct, addToBasket } from "./viewproducts.js";
document.addEventListener("DOMContentLoaded", loadDetailPage);

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Update User filters.
async function updateUserFiltersHTML() {
  const userId = await getUserId();
  const itemId = getProductIdFromUrl();

  if (!userId || !itemId) {
    console.warn("Missing userId or itemId");
    return;
  }

  try {
    const res = await fetch("/update-user-filters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, itemId }),
    });
  } catch (err) {
    console.log("Something went wrong", err);
  }
}

/*async function getRecommendedItemsHTML() {
  const userId = await getUserId();

  await fetch(`/recommendItems?userId=${userId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Recommendations:", data);
      displayRecommendedItems(data, "recommendation-list");
    })
    .catch((err) => {
      console.error("Failed to load recommendations:", err);
    });
}*/

async function displaySimilarItems(similarItems) {
  // starter fra 1 i stedet for 0, så den ikke viser det samme item som man er trykket ind på.
  const top10 = similarItems.slice(1, 10);

  const allRes = await fetch("/get-products");
  const allProducts = await allRes.json();

  const container = document.getElementById("similarItems-list");
  container.innerHTML = ""; // clear previous content if any
  for (const rec of top10) {
    const product = allProducts.find((p) => p.ID === rec.ID);
    if (!product) continue;

    /*const itemHTML = document.createElement("div");
    itemHTML.innerHTML = `
                        <img src="${product.picture}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.info}</p>
                        <p>Price: ${product.price} DKK</p>
                        <p>Match Score: ${rec.score}</p>
                        <button onclick='addToBasket(${JSON.stringify(
                          product
                        )})'>Tilføj til kurv</button>
                    `;*/
    container.appendChild(displayProduct(product));
  }
  container.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("add-to-basket")) {
      e.preventDefault();
      const productId = parseInt(e.target.getAttribute("data-id"));
      const product = allProducts.find((p) => p.ID === productId);
      if (product) {
        addToBasket(product);
      }
    }
  });
}

async function getSimilarItems() {
  const itemId = await getProductIdFromUrl();

  await fetch(`/similarItems?itemId=${itemId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("similar:", data);
      displaySimilarItems(data);
    })
    .catch((err) => {
      console.error("Failed to load similar items:", err);
    });
}

async function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id"); //extracts id from url
  const type = window.location.pathname.includes("product")
    ? "product"
    : "event"; //determines if its a single event or products thats to be rendered

  if (!id) {
    //error handling
    document.getElementById("detail-container").innerHTML = `
            <p>${type.charAt(0).toUpperCase() + type.slice(1)} not found</p>
            <a href="/public/pages/${type}s/${type}s.html">Return to ${type}s</a>
        `;
    return;
  }

  try {
    const response = await fetch(`/get-${type}?id=${id}`);
    const data = await response.json(); //api call to get data by id

    if (!data) throw new Error("Not found");
    console.log(data);

    renderDetailPage(data, type);
    setupEventListeners(data, type);
    updateUserFiltersHTML();
    getRecommendedItemsHTML();
    getSimilarItems();
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

document.addEventListener("DOMContentLoaded", loadDetailPage);
