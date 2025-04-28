document.addEventListener("DOMContentLoaded", function () {
    readFromDB();
});

function displayFromDB(data){
    const amount_of_products_p = document.getElementById("amount_of_products_p");
    data.forEach(products => {
        //  TODO: Change this to dynamic shop name via user authentication
        if(products.shop === "ByStil"){
            count++;
        }
        amount_of_products_p.textContent = `Antal produkter for ByStil: ${count}`;
    });
}


async function readFromDB() {
    fetch('/get-products', {
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