async function loadDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = window.location.pathname.includes('product') ? 'product' : 'event';

    if (!id) {
        document.getElementById("detail-container").innerHTML = `
            <p>${type.charAt(0).toUpperCase() + type.slice(1)} not found</p>
            <a href="/public/pages/${type}s/${type}s.html">Return to ${type}s</a>
        `;
        return;
    }

    try {
        const response = await fetch(`/get-${type}?id=${id}`);
        const data = await response.json();
        
        if (!data) throw new Error("Not found");
        
        renderDetailPage(data, type);
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
    console.log("Image URL:", data.image || data.picture);
    
    if (type === 'product') {
        container.innerHTML = `
            <div class="detail-image">
                <img src="${data.picture}" alt="${data.name}">
            </div>
            <div class="detail-info">
                <h1>${data.name}</h1>
                <p>${data.description || ''}</p>
                <p class="price">${data.price},-</p>
                <button class="add-to-cart" data-id="${data.id}">Add to Cart</button>
            </div>
        `;
    } else { // Event
        container.innerHTML = `
            <div class="detail-image">
                <img src="${data.image}" alt="${data.name}">
            </div>
            <div class="detail-info">
                <h1>${data.name}</h1>
                <p>${data.info || ''}</p>
                <p>Date: ${new Date(data.time).toLocaleDateString()}</p>
                <p>Location: ${data.place}</p>
                <button class="register" data-id="${data.id}">Register</button>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadDetailPage);