import mysql from "mysql";

//const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  database: "cs_25_sw_2_03",
  user: "cs-25-sw-2-03@student.aau.dk",
  password: "ydqQa3.Xm/j53MyP",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Server!");
});
