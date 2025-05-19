import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export async function getUserFiltersDB(userId) {
  try {
    // Destructuring([]) removes meta data from db, db code gets specific user, with id.
    const [userResults] = await pool.query(
      "SELECT * FROM user_filters WHERE userID = ?",
      [userId]
    );

    // input controll, checks if list is empty
    if (userResults.length === 0) {
      console.log("User filters are empty");
      return null;
    }

    console.log("UserFilter is updated");
    // Object.values ensures that we only get the values (such as 1 and 0), meaning we do not get the field names (labels).
    // The result is delivered inside another array, so we need to access the first element with [0]
    return Object.values(userResults[0]);
  } catch (err) {
    console.error("Database error in getUserFilters:", err);
    throw err;
  }
}

export async function getSpecificItemFiltersDB(itemId) {
  try {
    // Destructuring([]) removes meta data from db, db code gets specific item, with id.
    const [itemResults] = await pool.query(
      "SELECT * FROM products_filters WHERE productID = ?",
      [itemId]
    );

    // input controll, checks if list is empty
    if (itemResults.length === 0) {
      console.log("Item filters are empty");
      return null;
    }

    // Object.values ensures that we only get the values (such as 1 and 0), meaning we do not get the field names (labels).
    // The result is delivered inside another array, so we need to access the first element with [0]
    return Object.values(itemResults[0]);
  } catch (err) {
    console.error("Database error in getSpecificItemFilters:", err);
    throw err;
  }
}

export async function getAllItemFiltersDB() {
  try {
    // Destructuring([]) removes meta data from db, db code gets all items.
    const [itemResults] = await pool.query("SELECT * FROM products_filters");

    // input controll, checks if list is empty
    if (itemResults.length === 0) {
      console.log("Item filters are empty");
      return null;
    }

    // We use .map() to go through the database rows and create an array of only the values, without the field names (labels).
    return itemResults.map((row) => Object.values(row));
  } catch (err) {
    console.error("Database error in getAllItemFilters:", err);
    throw err;
  }
}

export async function getAllUserEventsDB() {
  try {
    // Destructuring([]) removes meta data from db, db code gets specific user, with id.
    const [userEventsResults] = await pool.query("SELECT * FROM user_events");

    // input controll, checks if list is empty
    if (userEventsResults.length === 0) {
      console.log("user_events is empty");
      return null;
    }
    console.log("USER_EVENTS:", userEventsResults);
    return userEventsResults;
  } catch (err) {
    console.error("Database error in getAllUserEventsDB:", err);
    throw err;
  }
}

export async function updateUserFiltersDB(userId, dataForDB) {
  try {
    // inserts the dataForDB into these variabels.
    const [
      black,
      white,
      gray,
      brown,
      blue,
      pants,
      t_shirt,
      sweatshirt,
      hoodie,
      shoes,
      shorts,
      cotton,
      linnen,
      polyester,
    ] = dataForDB;

    // sql code so we can update the db
    const sql = `
            UPDATE user_filters SET 
                black = ?,
                white = ?,
                gray = ?,
                brown = ?,
                blue = ?,
                pants = ?,
                t_shirt = ?,
                sweatshirt = ?,
                hoodie = ?,
                shoes = ?,
                shorts = ?,
                cotton = ?,
                linnen = ?,
                polyester = ?
            WHERE userId = ?`;

    // We combine the sql with the dataForDB and execute it in the db so it will be updated to the new dataForDB values
    const [result] = await pool.execute(sql, [
      black,
      white,
      gray,
      brown,
      blue,
      pants,
      t_shirt,
      sweatshirt,
      hoodie,
      shoes,
      shorts,
      cotton,
      linnen,
      polyester,
      userId,
    ]);
    console.log("Rows updated:", result.affectedRows);
  } catch (err) {
    console.error("Database error in updateUserFilters:", err);
    throw err;
  }
}
