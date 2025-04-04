
document.addEventListener("DOMContentLoaded", function () {
            fetch('mock_db/events.json')
                .then(response => response.json())
                .then(events => {
                    const eventsContainer = document.getElementById("events-container");

                    events.forEach(event => {
                        const eventCard = document.createElement("div");
                        eventCard.classList.add("event-card");

                        eventCard.innerHTML = `
                            <a href="event-detail.html?id=${event.id}" class="event-link">
                                <img src="${event.image}" alt="${event.name}">
                                <h3>${event.name}</h3>
                                <p>${event.info}</p>
                                <p class="event-price">${event.price}</p>
                            </a>
                        `;

                        eventsContainer.appendChild(eventCard);
                    });
                })
                .catch(error => console.error("Error fetching events:", error));
        });