import mysql from 'mysql2'

//  Pool is a collection of connections to the database
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    database: 'p2_database'
    //  Making it a promise so we can use async await functions !!
}).promise()

export async function getProducts() {
    const result = await pool.query("SELECT * FROM products");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows. 
    const rows = result[0];
    console.log(rows);
    return rows;
}

export async function getProduct(id) {
    //  This function retrieves one product based on id. Syntax is a bit different in order to prevent sql injection attacks
    const result = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    const rows = result[0];
    return rows[0];
}

export async function createProduct(name, price, amount, filters) {
    const result = await pool.query(
        "INSERT INTO products (name, price, amount, filters) VALUES (?,?,?,?)", [name, price, amount, filters])
    const id = result.insertId;
    return getProduct(id);
}

