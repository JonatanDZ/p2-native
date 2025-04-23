// database.js
import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'niko',
  password: '1234',
  database: 'p2_database',
  port: '3307'
});

db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

export default db;