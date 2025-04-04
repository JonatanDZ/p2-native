const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "StrongP@ssw0rd!",
    database: "myDB",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

function fetchData(callback) {
    db.query('SELECT * FROM clothing_items', (err, results, fields) => {
      if (err) {
        console.error('Error fetching data:', err);
        return;
      }
      const data = results.map(row => Object.values(row));
      callback(data);
    });
}

function dotProduct(user, item) {
    let result = 0;
    for (let i in user) {
        result += user[i] * item[i];
    }
    return result;
}

function resultsComparedPrinted(resultsCompared) {
    for (let list of resultsCompared){
        console.log(list);
    }
}

//https://www.w3schools.com/js/js_array_sort.asp#mark_sort Se hvordan det virker her.
function compareLists(results) {
    return results.sort(function(a, b){return b - a});
}

function recommendedItem(user, numberOfLists) {
    let resultsOfDotProduct = [];
    for (let list of numberOfLists) { 
        resultsOfDotProduct.push(dotProduct(user, list)); 
    }    
    
    let resultsCompared = compareLists(resultsOfDotProduct);
    resultsComparedPrinted(resultsCompared);
}

let user = [0, 0, 0];

fetchData((data) => {
    recommendedItem(user, data);    
});