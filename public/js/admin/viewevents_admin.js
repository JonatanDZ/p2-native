document.addEventListener("DOMContentLoaded", async () => {
    console.log("Stuff loaded!")
    const apiContainers = document.querySelectorAll(".api-call");
    apiContainers.forEach((container) => {
        const endpoint = container.dataset.endpoint;
        if (endpoint) readFromDB(endpoint);
    });
});

async function readFromDB(endpoint) {
    fetch(endpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            displayFromDB(data);
        })
        .catch((error) => {
            console.error(`Error receiving data from ${endpoint}:`, error);
        });
}

function displayFromDB(data) {
    const eventsContainer = document.getElementById("events-container"); // reuse existing container
    if (!eventsContainer) return;

    eventsContainer.innerHTML = "";

    data.forEach((event) => {
        const card = document.createElement("div");
        card.className = "card p-3";
        card.style.width = "18rem";

        const title = document.createElement("h4");
        title.textContent = event.name || "Untitled Event";

        const img = document.createElement("img");
        img.src = event.image || "";
        img.alt = event.name || "Event image";
        img.style.width = "200px";
        img.style.height = "250px";
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";

        card.appendChild(img);

        const place = document.createElement("p");
        place.innerHTML = `<strong>Place:</strong> ${event.place || "Unknown"}`;

        const time = document.createElement("p");
        time.innerHTML = `<strong>Time:</strong> ${event.time || "TBD"}`;

        const price = document.createElement("p");
        price.innerHTML = `<strong>Price:</strong> ${event.price || "N/A"},-`;

        const info = document.createElement("p");
        info.innerHTML = `<strong>Info:</strong> ${event.info || "No info available"
            }`;

        const button = document.createElement("button");
        button.className = "btn btn-primary event-link";
        button.dataset.id = event.ID;
        button.textContent = "View Event";

        card.appendChild(title);
        card.appendChild(place);
        card.appendChild(time);
        card.appendChild(price);
        card.appendChild(info);
        card.appendChild(button);

        eventsContainer.appendChild(card);
    });

    // Add click listeners to each event card button
    eventsContainer.addEventListener("click", function (e) {
        if (e.target && e.target.classList.contains("event-link")) {
            e.preventDefault();
            const eventId = parseInt(e.target.getAttribute("data-id"));
            const event = data.find((ev) => ev.ID === eventId);
            if (event) {
                console.log("CLICKED!");

                const userID = 2; //Insert userID here (somehow)
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
                addToUserEvents(event);
            }
        }
    });
}
