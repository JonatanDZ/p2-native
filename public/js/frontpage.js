export { getUserId, displayRecommendedItems, getRecommendedItemsHTML };
import { displayEvent } from "./events/viewevents.js";
import { displayProduct, addToBasket } from "./products/viewproducts.js";

async function getUserId() {
    // Get token from localStorage
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
        console.warn("No token found");
        return null;
    }

    try {
        // Send POST request to server to verify authentication and admin status
        const response = await fetch("/verify-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
        });

        if (!response.ok) {
            console.error("Failed to verify token:", response.statusText);
            return null;
        }

    const data = await response.json();

    if (data.isAuthenticated) {
      return data.userId;
    } else {
      console.warn("User not authenticated");
      return null;
    }
    } catch (err) {
        // Handle fetch errors or server issues
        console.error("Error verifying token:", err);
        localStorage.removeItem("token");
        window.location.href = "/public/pages/login/login.html";
    }
}

async function getRecommendedItemsHTML() {
    const userId = await getUserId();
    console.log("USER ID", userId);

    await fetch(`/recommendItems?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Recommendations:", data);
            displayRecommendedItems(data, "recommendations");
        })
        .catch((err) => {
            console.error("Failed to load recommendations:", err);
        });
}

async function getRecommendedEventsHTML() {
    const userId = await getUserId();

    await fetch(`/recommendEvents?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Recommendations Events:", data);
            displayRecommendedEvents(data, "events");
        })
        .catch((err) => {
            console.error("Failed to load recommendations:", err);
        });
}

async function displayRecommendedItems(recommendationList, placement) {
    const top10 = recommendationList.slice(0, 10);

    if (top10.length > 0) {
        const allRes = await fetch("/get-products");
        const allProducts = await allRes.json();

        const container = document.getElementById(placement);
        //container.innerHTML = ""; // clear previous content if any
        for (const rec of top10) {
            const product = allProducts.find((p) => p.ID === rec.ID);
            if (!product) continue;
            //Display the given product
            container.appendChild(displayProduct(product, "products/"));
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
    } else {
        const container = document.getElementById(placement);
        container.innerHTML = ""; // clear previous content if any

        const itemHTML = document.createElement("div");
        itemHTML.innerHTML = `
                            <h3>Login for at se dine anbefalede varer</h3>
                        `;
        container.appendChild(itemHTML);
    }
}

async function getNewItems() {
    const allRes = await fetch("/get-products");
    const allProducts = await allRes.json();
    displayRecommendedItems(allProducts, "products");
}

async function getNewEvents() {
    const allRes = await fetch("/get-products");
    const allProducts = await allRes.json();
    displayRecommendedEvents(allProducts, "newevents");
}

async function displayRecommendedEvents(recommendationList, placement) {
    const top10 = recommendationList.slice(0, 5);

    if (top10.length > 0) {
        const allRes = await fetch("/get-events");
        const allEvents = await allRes.json();

        const container = document.getElementById(placement);
        container.innerHTML = ""; // clear previous content if any

        for (const rec of top10) {
            const event = allEvents.find((p) => p.ID === rec.ID);
            if (!event) continue;
            //Display the given events
            container.appendChild(displayEvent(event));
        }
        // Add click listeners to each event card button
        container.addEventListener("click", async function (e) {
            if (e.target && e.target.classList.contains("event-link")) {
                e.preventDefault();
                const eventId = parseInt(e.target.getAttribute("data-id"));
                const event = allEvents.find((ev) => ev.ID === eventId);
                if (event) {
                    const userID = await getUserId(); //Get userID
                    if (userID != null) {
                        console.log(userID);

                        console.log("USER", userID, "EVENT", eventId);
                        //Make a POST with userID and eventID
                        try {
                            const response = fetch("http://localhost:3000/event-detail", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ userID, eventId }),
                            });
                        } catch (err) {
                            console.error("Error:", err);
                            alert("Something went wrong. Try again.");
                        }
                        addToUserEvents(event); //Has no usage right now
                    } else {
                        console.log("log in to add to reccommender");
                    }
                }
            }
        });
    } else {
        const container = document.getElementById(placement);
        container.innerHTML = ""; // clear previous content if any

        const itemHTML = document.createElement("div");
        itemHTML.innerHTML = `
                            <h3>Login for at se dine anbefalede events</h3>
                        `;
        container.appendChild(itemHTML);
    }
}

function loadFrontpage() {
    if (window.location.href.includes("index")) {
        getNewEvents();
        getRecommendedItemsHTML();
        getNewItems();
        getRecommendedEventsHTML();
    }
}

document.addEventListener("DOMContentLoaded", loadFrontpage);
