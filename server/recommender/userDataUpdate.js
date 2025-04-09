const mysql = require("mysql2/promise");

async function fetchData(userId, itemId, dataForDB, alterDataYes) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "StrongP@ssw0rd!",
            database: "myDB",
            port: 3306
        });

        console.log("Connected to MySQL");

        // Hent data fra clothing_items
        const [itemDataRaw] = await connection.execute('SELECT * FROM clothing_items WHERE id = ?', [itemId]);
        const itemData = itemDataRaw.map(row => Object.values(row));

        // Hent data fra user_items
        const [userDataRaw] = await connection.execute('SELECT * FROM user_items');
        const userData = userDataRaw.map(row => Object.values(row));

        // Hvis vi skal opdatere brugerens data
        if (alterDataYes) {
            const [red,blue,green,cotton, polyester, wool, size_s, size_m, size_l, style_casual, style_formal, style_sporty, brand_nike, brand_adidas, price_range_1, price_range_2, price_range_3, season_summer, season_winter,gender_male,gender_female,gender_unisex
                ] = dataForDB;

            const sql = `
                UPDATE user_items SET 
                    red = ?, blue = ?, green = ?,
                    cotton = ?, polyester = ?, wool = ?,
                    size_s = ?, size_m = ?, size_l = ?,
                    style_casual = ?, style_formal = ?, style_sporty = ?,
                    brand_nike = ?, brand_adidas = ?,
                    price_range_1 = ?, price_range_2 = ?, price_range_3 = ?,
                    season_summer = ?, season_winter = ?,
                    gender_male = ?, gender_female = ?, gender_unisex = ?
                `;
            
            const [result] = await connection.execute(sql, [red,blue,green,cotton, polyester, wool, size_s, size_m, size_l, style_casual, style_formal, style_sporty, brand_nike, brand_adidas, price_range_1, price_range_2, price_range_3, season_summer, season_winter,gender_male,gender_female,gender_unisex]);

            console.log("Rows updated:", result.affectedRows);
        }

        return {userData, itemData};

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
    //fjerner id
    itemData.shift();
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
    console.log("Tidliger userid: ", data.userData[0]);
    
    dataForDB = await alterDataToList(data);

    alterDataYes = 1;
    await fetchData(userId, itemId, dataForDB, alterDataYes);

    alterDataYes = 0;
    let alteredData = await fetchData(userId, itemId, dataForDB, alterDataYes);
    console.log(alteredData.userData[0]);
};

// er ikke lavet endnu, så derfor gør userid ikke noget. 
let userId = 0;
let itemId = 4;
main (userId, itemId);
