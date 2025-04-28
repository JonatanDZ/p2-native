import { createConnection } from "mysql2/promise";

async function fetchData(userId, itemId, dataForDB, alterDataYes) {
    let connection;
    try {
        connection = await createConnection({
            host: "localhost",
            user: "root",
            password: "StrongP@ssw0rd!",
            database: "p2_database",
            port: 3307
        });

    console.log("Connected to MySQL");

    // Forbinder til product id
    const [itemDataRaw] = await connection.execute(
      "SELECT * FROM products_filters WHERE productID = ?",
      [itemId]
    );
    const itemData = itemDataRaw.map((row) => Object.values(row));

    // Forbinder til user id
    const [userDataRaw] = await connection.execute(
      "SELECT * FROM user_filters WHERE userID = ?",
      [userId]
    );
    const userData = userDataRaw.map((row) => Object.values(row));

    // Hvis vi skal opdatere brugerens data
    if (alterDataYes) {
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
                `;

      // Indsætter dataen i DB
      const [result] = await connection.execute(sql, [
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
      ]);
      console.log("Rows updated:", result.affectedRows);
    }

    return { userData, itemData };
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
}

async function alterDataToList(data) {
  let userData = data.userData[0]; // Første række
  let itemData = data.itemData[0]; // Første række

  //fjerner id og er fejlkode for om id'sne eksistere.
  try {
    itemData.shift();
  } catch (error) {
    console.log("The item id does not exist");
    process.exit(1);
  }
  try {
    userData.shift();
  } catch (error) {
    console.log("The user id does not exist");
    process.exit(1);
  }

  // lægger 1 til i user hvis der er 1 i item der er trykket på.
  for (let i = 0; i < itemData.length; i++) {
    if (itemData[i] === 1) {
      userData[i]++;
    }
  }

  return userData;
}

async function main(userId, itemId) {
  let dataForDB = [];
  let alterDataYes = 0;

  let data = await fetchData(userId, itemId, dataForDB, alterDataYes);
  console.log("Tidliger user: ", data.userData[0]);
  console.log("Tidligere item", data.itemData[0]);

  // her sker magien med at listen bliver opdateret med de rigtige tal
  dataForDB = await alterDataToList(data);
  console.log(data);

  alterDataYes = 1;
  // Ændre det oprindelige liste med den nye liste af tal i dben.
  await fetchData(userId, itemId, dataForDB, alterDataYes);

  // Går ind og henter den nye liste i db.
  alterDataYes = 0;
  let alteredData = await fetchData(userId, itemId, dataForDB, alterDataYes);
  console.log(alteredData.userData[0]);
}

// // forberedelse til forsiden
// document.getElementById("placerholder").addEventListener("click", async () => {
//     //let itemId = placeholder;
//     let itemId = 7;
//     //let userId = placeholder;
//     let userId = 0;
//     await main(userId, itemId);
// });

let itemId = 5;
let userId = 1;
main(userId, itemId);
