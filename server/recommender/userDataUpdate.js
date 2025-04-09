const mysql = require("mysql2/promise");

async function fetchData(id) {
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
        let itemId = id;
        const [itemIdData] = await connection.execute('SELECT * FROM clothing_items WHERE id = ?', [itemId]);
        const itemIdDataFixed = itemIdData.map(row => Object.values(row));


        return itemIdDataFixed;

    } catch (err) {
        console.error("Database error:", err);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

item_id = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];
user_id = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];

function insertData(item_id, user_id) {
    for (let i = 0; i < item_id.length; i++) {
        if (item_id[i] === 1) {
            user_id[i]++;
        } 
    }
    return user_id;
}

//mangler funktion der henter user ned, og manglr en funktion der får item. 

// Forside skal laves først
/* 
document.getElementById().addEventListener("click", function() {
    let insertData(item_id, user_id);
    //skal ind og rette db efter opdatering. 
    alt table db.userUpdate(insertData);

}); */

let id = 5;
fetchData(id).then(result => {
    console.log("Result:", result);
});