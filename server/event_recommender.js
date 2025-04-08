import { createConnection } from "mysql2";

let db = createConnection({
  host: "localhost",
  user: "root",
  password: "TESTtest123",
  database: "test",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

db.query("SELECT * FROM user_events", (err, results, fields) => {
  if (err) {
    console.error("Error fetching data:", err);
    return;
  }
  //const data = results.map((row) => Object.values(row));
  console.log(results);
  const rows = results.map((row) => Object.values(row));
  rec(rows);
});
db.end((err) => {
  if (err) {
    console.error("Error closing the database connection:", err);
  } else {
    console.log("Database connection closed.");
  }
});

function rec(data) {
  let count = [0, 0, 0, 0, 0];
  let user = [0, 1, 0, 1, 0];
  for (let j = 0; j < user.length; j++) {
    for (let i = 0; i < data.length; i++) {
      if (data[i][j] == user[j]) {
        for (let n = 0; n < user.length; n++) {
          if (user[n] == 0) {
            if (data[i][n] == 1) {
              count[n] += 1;
            }
          } else count[n] = "a";
        }
      }
    }
  }
  console.log(count);
}
