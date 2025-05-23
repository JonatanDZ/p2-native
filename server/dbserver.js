import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

//  Pool is a collection of connections to the database
//  This is done instead of creating a new connection pr. query which is better for scalability.
const pool = mysql
    .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        //  Making it a promise so we can use async await functions !!
    })
    .promise();

/////////////////////////////////////////

//  Product functions
export async function getProducts() {
    const result = await pool.query("SELECT * FROM products_table");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows.
    const rows = result[0];
    //console.log(rows);
    return rows;
}

export async function getRecommendedProducts() {
    const result = await pool.query("SELECT * FROM products_table");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows.
    const rows = result[0];
    //console.log(rows);
    return rows;
}

export async function getLikedProducts() {
    const result = await pool.query("SELECT * FROM products_table");
    //  The query returns a bunch of other data, in an array, which are not just the table rows, therefore we specify
    //  the array index to only recieve the DB rows.
    const rows = result[0];
    //console.log(rows);
    return rows;
}

/////////////////////////////////////////

export async function getProduct(id) {
    //  This function retrieves one product based on id. Syntax is a bit different in order to prevent sql injection attacks
    const result = await pool.query("SELECT * FROM products_table WHERE id = ?", [
        id,
    ]);
    const rows = result[0];
    return rows[0];
}
export async function getEvent(id) {
    //  This function retrieves one product based on id. Syntax is a bit different in order to prevent sql injection attacks
    const result = await pool.query("SELECT * FROM events_table WHERE id = ?", [
        id,
    ]);
    const rows = result[0];
    return rows[0];
}

export async function getProductFilters(id) {
    //  This function retrieves one product based on id. Syntax is a bit different in order to prevent sql injection attacks
    const result = await pool.query(
        "SELECT * FROM products_filters WHERE productID = ?",
        [id]
    );
    const rows = result[0];
    return rows[0];
}

export async function deleteProduct(id) {
    try {
        // each product has a foreign key rooted in product_filters so that has to be deleted first
        const result_filters = await pool.query(
            "DELETE FROM products_filters WHERE productID = ?",
            [id]
        );
        const result_products = await pool.query(
            "DELETE FROM products_table WHERE id = ?",
            [id]
        );
        // .affectedRows says how many rows in the database were changed by the query
        return {
            // we return affected rows for filters since we are dependent upon its deletion but its not the primary intention
            filtersDeleted: result_filters[0].affectedRows,
            // we return if affected rows are larger than 0 since that means that some were actually deleted, else we throw an error
            productDeleted: result_products[0].affectedRows > 0,
        };
    } catch (err) {
        console.error("Error deleting product:", err);
        throw err;
    }
}

export async function createProduct(product) {
    // initializing one object twice since they are passed into two different tables
    const { name, shopID, picture, info, price, amount } = product;
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
        polyester,
    } = product;

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
        [name, shopID, picture, info, price, amount]
    );

    //  getting product id to insert into second table as FK
    const id_table = result_table[0].insertId;

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
            polyester,
        ]
    );

    //  TODO: revisit this.
    //const id_filters = result_filter.insertId;

    const productTableOutput = await getProduct(id_table);

    // querying products_filters instead of products_table
    const productFiltersTableOutput = await getProductFilters(id_table);

    return {
        productTableOutput,
        productFiltersTableOutput,
    };
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
    const { price, place, info, name, image, time } = event;
    //  ProductID works as a placeholder it is init further down

    const result_table = await pool.query(
        `INSERT INTO events_table (
            price, 
            place,  
            info, 
            name,
            image, 
            time
        ) VALUES (
            ?,?,?,?,?,?
        )`,
        [price, place, info, name, image, time]
    );

    //  TODO: revisit this.
    const id_table = result_table.insertId;
    return getEvents(id_table);
}
