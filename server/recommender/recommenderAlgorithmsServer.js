import mysql from 'mysql2/promise';
import 'dotenv/config';

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

        if (userResults.length === 0) {
            console.log("User filters are empty")
            return null;
        }

        // Object gør at vi kun for værdierne, hvilket vil sige 1 og 0, så vi får ikke labels i arrayet.
        // Arrayet bliver leveret inde i et andet array derfor bliver vi nødt til at gå ind i det med [0]
        return Object.values(userResults[0]);
    } catch (err) {
        console.error("Database error in getUserFilters:", err);
        throw err;
    }
}

export async function getSpecificItemFiltersDB(itemId) {
    try {
        // array destructuring([]), remvoes meta data
        const [itemResults] = await pool.query(
            'SELECT * FROM products_filters WHERE productID = ?',
            [itemId]
        );

        // 
        if (itemResults.length === 0) {
            console.log("Item filters are empty");
            return null;
        }

        // Object gør at vi kun for værdierne, hvilket vil sige 1 og 0, så vi får ikke labels i arrayet.
        // Arrayet bliver leveret inde i et andet array derfor bliver vi nødt til at gå ind i det med [0]
        return Object.values(itemResults[0]);
    } catch (err) {
        console.error("Database error in getSpecificItemFilters:", err);
        throw err;
    }
}

export async function getAllItemFiltersDB() {
    try {
        //
        const [itemResults] = await pool.query(
            'SELECT * FROM products_filters'
        );

        // 
        if (itemResults.length === 0) {
            console.log("Item filters are empty");
            return null;
        }

        // Object gør at vi kun for værdierne, hvilket vil sige 1 og 0, så vi får ikke labels i arrayet.
        // Arrayet bliver leveret inde i et andet array derfor bliver vi nødt til at gå ind i det med [0]
        return Object.values(itemResults[0]);
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
            WHERE userId = ?`;

        const [result] = await pool.execute(sql, [black, white, gray, brown, blue, pants, t_shirt, sweatshirt, hoodie, shoes, shorts, cotton, linnen, polyester, userId]);
        console.log("Rows updated:", result.affectedRows);

    } catch (err) {
        console.error("Database error in updateUserFilters:", err);
        throw err;
    }
}