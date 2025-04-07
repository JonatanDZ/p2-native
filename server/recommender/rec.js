const mysql = require("mysql2/promise");

async function fetchData() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "StrongP@ssw0rd!",
            database: "myDB",
            port: 3306
        });

        console.log("Connected to MySQL");

        // Fetch clothing items
        const [items_results] = await connection.execute('SELECT * FROM clothing_items');
        const items_data = items_results.map(row => Object.values(row));

        // Fetch user items
        const [user_results] = await connection.execute('SELECT * FROM user_items');
        const user_data = user_results.map(row => Object.values(row));

        // Test data
        //console.log("Items:", items_data);
        //console.log("User:", user_data);

        return {items: items_data, user: user_data};

    } catch (err) {
        console.error("Database error:", err);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

// Multiply the two vectors
function dotProduct(user, item) {
    let result = 0;
    for (let i in user) {
        result += user[i] * item[i];
    }
    return result;
}

// Prints the recommmended result
function resultsComparedPrinted(resultsCompared) {
    for (let list of resultsCompared){
        console.log(list);
    }
}

// Sort the recommended list, goes from highest to lowest score
// https://www.w3schools.com/js/js_array_sort.asp#mark_sort
function compareLists(results) {
    return results.sort(function(a, b){return b.score - a.score});
}

// Main function that calls the other functions to recommend an item
function recommendedItem(user, numberOfLists) {
    let resultsOfDotProduct = numberOfLists.map(list => ({
        id: list[0], 
        score: dotProduct(user, list.slice(1))
    }));
    
    let resultsCompared = compareLists(resultsOfDotProduct);
    
    console.log("Detter er nummer 1 recommended: ", resultsCompared[0]); // Prints the number one
    console.log() // New line

    resultsComparedPrinted(resultsCompared); // prints all recommended items sorted 
}

//Test user
//let user = [0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0];

// Code starts here where data is fetched and main function is called
fetchData().then(data => {
    if (data) {
        let { items, user } = data;
        user = user[0]; 
        recommendedItem(user, items)
    }
});