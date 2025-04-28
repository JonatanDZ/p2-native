const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export async function getUserFiltersDB(userId) {
    try {
        const [userResults] = await pool.query(
            'SELECT * FROM user_filters WHERE userID = ?', 
            [userId]
        );

        return userResults.map(row => Object.values(row));
    } catch (err) {
        console.error("Database error in getUserFilters:", err);
        throw err;
    }
}

export async function getSpecificItemFiltersDB(itemId) {
    try {
        const [itemResults] = await pool.query(
            'SELECT * FROM products_filters WHERE productID = ?', 
            [itemId]
        );

        return itemResults.map(row => Object.values(row));
    } catch (err) {
        console.error("Database error in getSpecificItemFilters:", err);
        throw err;
    }
}

export async function getAllItemFiltersDB() {
    try {
        const [itemsResults] = await pool.query(
            'SELECT * FROM products_filters'
        );

        return itemsResults.map(row => Object.values(row));
    } catch (err) {
        console.error("Database error in getAllItemFilters:", err);
        throw err;
    }
}

export async function updateUserFiltersDB(userId, dataForDB) {
    try {
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
            polyester
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
            WHERE userId = ?
            `;
        
        const [result] = await connection.execute(sql, [black,white,gray,brown,blue,pants,t_shirt,sweatshirt,hoodie,shoes,shorts,cotton,linnen,polyester, userId]);
        console.log("Rows updated:", result.affectedRows);

    } catch (err) {
        console.error("Database error in updateUserFilters:", err);
        throw err;
    }
}
