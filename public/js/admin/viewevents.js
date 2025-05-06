document.addEventListener("DOMContentLoaded", async function () {
    readFromDB();
});

async function readFromDB() {
    fetch('/get-events', {
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
        console.error("Error receiving data from /get-events:", error);
    });
}

function displayFromDB(data){
    const eventsContainer = document.getElementById("events-container");
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    
    
    data.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';

        const eventLink = document.createElement('a');
        eventLink.href = `eventdetail.html?id=${event.ID || event.id}`;
        eventLink.target = "_blank";

        const img = document.createElement('img');
        img.src = event.image || event.picture;
        img.alt = event.name || 'Event image';
        img.style.width = '200px';
        img.style.height = 'auto';

        eventLink.appendChild(img);

        const title = document.createElement('h4');
        title.textContent = event.name || 'Untitled';

        const info = document.createElement('h5');
        info.textContent = `${event.info},-` || 'Info not available';

        const price = document.createElement('p');
        price.textContent = `${event.price},-` || 'Price not available';

        card.appendChild(eventLink); 
        card.appendChild(price);
        card.appendChild(info)
        card.appendChild(title);
        
        eventsContainer.appendChild(card);
    }); 
}