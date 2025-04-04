
function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener("DOMContentLoaded", function () {
    const eventId = getEventIdFromUrl();
    if (!eventId) {
        document.getElementById("event-detail").innerHTML = "<p>Event not found.</p>";
        return;
    }

    fetch('events.json')
        .then(response => response.json())
        .then(events => {
            const event = events.find(e => e.id.toString() === eventId);

            if (!event) {
                document.getElementById("event-detail").innerHTML = "<p>Event not found.</p>";
                return;
            }

            document.getElementById("event-detail").innerHTML = `
                <img src="${event.image}" alt="${event.name}">
                <h1>${event.name}</h1>
                <p>${event.info}</p>
                <p>Price: ${event.price}</p>
            `;
        })
        .catch(error => console.error("Error fetching event details:", error));
});