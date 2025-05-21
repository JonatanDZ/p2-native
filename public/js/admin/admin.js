import { getUserId } from "../frontpage.js";

// putting inside if, since testing suite fails because it uses the DOM. Need another testing env for that
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    readFromDB();
  });
}


export async function displayFromDB(data){
    //get userId
    const userId = getUserId();

    const amount_of_products_p = document.getElementById("amount_of_products_p");
    console.log(userId);
    let count = 0;
    data.forEach(products => {
        //  TODO: Change this to dynamic shop name via user authentication
        //  We have to check if its the correct user accessing the page
        // check if the userID is the same as the shopID
        if(userId === products.shopID){
            count++;
        }
    });
    amount_of_products_p.textContent = `Antal produkter for ${userId}: ${count}`;
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