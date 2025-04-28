import { createConnection } from "mysql2/promise";
export { exportRecommend };

async function fetchData(userId) {
  let connection;
  try {
    // Create connection
    connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("Connected to MySQL");

    // Fetch clothing items
    const [items_results] = await connection.execute(
      "SELECT * FROM products_filters"
    );
    const items_data = items_results.map((row) => Object.values(row));
    // Fetch clothing items

    // Fetch user items
    const [user_results] = await connection.execute(
      "SELECT * FROM user_filters WHERE userID = ?",
      [userId]
    );
    const user_data = user_results.map((row) => Object.values(row));

    // Test data
    //console.log("Items:", items_data);
    //console.log("User:", user_data);
    // Test data
    //console.log("Items:", items_data);
    //console.log("User:", user_data);

    return { items: items_data, user: user_data };
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
  for (let list of resultsCompared) {
    console.log(list);
  }
}

// Sort the recommended list, goes from highest to lowest score
// https://www.w3schools.com/js/js_array_sort.asp#mark_sort
function compareLists(results) {
  return results.sort(function (a, b) {
    return b.score - a.score;
  });
}

// Main function that calls the other functions to recommend an item
function recommendedItem(user, numberOfLists) {
  let resultsOfDotProduct = numberOfLists.map((list) => ({
    id: list[0],
    score: dotProduct(user.slice(1), list.slice(1)),
  }));

  let resultsCompared = compareLists(resultsOfDotProduct);

  console.log("Dette er nummer 1 recommended: ", resultsCompared[0]); // Prints the number one
  console.log(); // New line

  return resultsComparedPrinted(resultsCompared); // prints all recommended items sorted. ex. {id: 2, score: 7} {id: 5, score: 5} osv.
}

//Test user
//let user = [0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0];

// Code starts here where data is fetched and main function is called
async function exportRecommend() {
  let userId = 1;
  fetchData(userId).then((data) => {
    if (data) {
      let { items, user } = data;
      user = user[0];
      console.log(items);
      console.log(user);
      return recommendedItem(user, items);
    }
  });
}
