import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

//  Pool is a collection of connections to the database
//  This is done instead of creating a new connection pr. query which is better for scalability. 
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
    //  Making it a promise so we can use async await functions !!
  })
  .promise();

//  Product functions
export async function getProducts() {
    const result = await pool.query("SELECT * FROM products_table");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows. 
    const rows = result[0];
    console.log(rows);
    return rows;
}

export async function getProduct(id) {
    //  This function retrieves one product based on id. Syntax is a bit different in order to prevent sql injection attacks
    const result = await pool.query("SELECT * FROM products_table WHERE id = ?", [id]);
    const rows = result[0];
    return rows[0];
}

export async function createProduct(product) {
    const { 
        name, 
        shopID, 
        picture, 
        info, 
        price, 
        amount
    } = product;
    //  ProductID works as a placeholder it is init further down
    const {
        productID,
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
        polyester } = product;

    const result_table = await pool.query(
        `INSERT INTO products_table (
            name, 
            shopID, 
            picture, 
            info, 
            price, 
            amount
        ) VALUES (
            ?,?,?,?,?,?
        )`, 
        [
            name, 
            shopID, 
            picture, 
            info, 
            price, 
            amount
        ]
    );  

    const id_table = result_table[0].insertId; // <- get the product ID


    const result_filter = await pool.query(
        `INSERT INTO products_filters (
            productID,
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
        ) VALUES (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )`, 
        [
            id_table,  
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
        ]
    );

    //  TODO: revisit this. 
    const id_filters = result_filter.insertId;
    getProduct(id_filters)
    return getProduct(id_table);
}

// event functions


export async function getEvents() {
    const result = await pool.query("SELECT * FROM events_table");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows. 
    const rows = result[0];
    console.log(rows);
    return rows;
}

export async function createEvent(event) {
    const { 
        price, 
        place, 
        picture, 
        info, 
        name, 
        time
    } = event;
    //  ProductID works as a placeholder it is init further down

    const result_table = await pool.query(
        `INSERT INTO events_table (
            price, 
            place, 
            picture, 
            info, 
            name, 
            time
        ) VALUES (
            ?,?,?,?,?,?
        )`, 
        [
            price, 
            place, 
            picture, 
            info, 
            name, 
            time
        ]
    );  

    //  TODO: revisit this. 
    const id_table = result_table.insertId;
    return getEvents(id_table);
}