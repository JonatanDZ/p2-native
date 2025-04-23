// database.js
import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'P2_database'
});

db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

export default db;