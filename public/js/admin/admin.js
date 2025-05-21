import { getUserId } from "../frontpage.js";

// putting inside if, since testing suite fails because it uses the DOM. If we were to remove the if statement the testing environment would have to be "JSdom"
// In other words the current environment "node" cannot handle the document. method since it requires access to the DOM, which node (the backend) does not have.
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        readFromDB();
    });
}

export async function fetchUserIdFromToken(token) {
  try {
    const response = await fetch("http://localhost:3000/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
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
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

export async function displayFromDB(data) {
    //get userId
    const userId = getUserId();

    const amount_of_products_p = document.getElementById("amount_of_products_p");
    console.log(userId);
    let count = 0;
    data.forEach(products => {
        //  TODO: Change this to dynamic shop name via user authentication
        //  We have to check if its the correct user accessing the page
        // check if the userID is the same as the shopID
        if (userId === products.shopID) {
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