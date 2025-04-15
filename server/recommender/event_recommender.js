import mysql from "mysql2/promise";

//Should be called somewhere on front page?

let currentUser = 1; //Get currentUser from database (somehow?)

//let events = 6; //Get the amount of events from database

async function fetchData() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "TESTtest123",
      database: "p2_database",
      port: 3306,
    });

    console.log("Connected to MySQL");

    // Fetch
    const [test] = await connection.query(
      "SELECT * FROM user_events ORDER BY userID"
    );
    const users_events_rows = test.map((row) => Object.values(row));
    console.log(users_events_rows);

    const [events_length] = await connection.query(
      "SELECT * FROM events_table"
    );

    const events_rows = events_length.map((row) => Object.values(row));
    console.log(events_rows);
    let events_rows_length = events_rows.length;
    console.log(events_rows_length);

    return [users_events_rows, events_rows_length];
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
}

/*db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

db.query(`SELECT * FROM user_event ORDER BY userID`, (err, results, fields) => {
  if (err) {
    console.error("Error fetching data:", err);
    return;
  }
  //const data = results.map((row) => Object.values(row));
});

db.end((err) => {
  if (err) {
    console.error("Error closing the database connection:", err);
  } else {
    console.log("Database connection closed.");
  }
});*/

//The event recommender algorithm. Currently only looks at events people are singed op for
function reccomender(data, events_length) {
  let user = []; //Users gonna be something like [2,5,3,1] which is eventID 2,5,3 and 1
  //let others = [];
  let count = [];
  //Initialize count
  for (let i = 0; i < events_length; i++) {
    count[i] = [];
    count[i][0] = 0;
    count[i][1] = i;
  }

  //Finds and creates user:
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == currentUser) {
      user.push(data[i][1]);
    }
  }
  user.sort();
  console.log(user);

  //Reccomender
  for (let n = 0; n < user.length; n++) {
    for (let i = 0; i < data.length; i++) {
      //If a user is at event, find other user i at event
      if (user[n] == data[i][1] && data[i][0] == currentUser) {
        //Compare eventID: Are two users at same event?
        for (let l = 0; l < data.length; l++) {
          if (data[l][1] == data[i][1] && l != i) {
            //If yes, look at what the other user is otherwise to, and add to count.
            for (let k = 0; k < data.length; k++) {
              if (data[k][0] == data[l][0]) {
                count[data[k][1] - 1][0] += 1;
              }
            }
          }
        }
      }
    } /*else { //add other users data to reccomender (user who are in data but registered for other events)
      let j = 0;
      for (let l = 0; l < events_length; l++) {
        if (user[j] != l) {//if user is not at event
          for(let k = 0; k<data.length;k++){
          }
        } else {
          j++;
        }
      }
      
    }*/
  }
  count.sort(sortFunction);
  console.log(count);
  console.log(
    `We reccomend event ${count[0][1] + 1}, event ${
      count[1][1] + 1
    } and event ${count[2][1] + 1}`
  );
}

//https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? -1 : 1;
  }
}

//Old algorithm
/*function rec(data) {
  let count = [0, 0, 0, 0, 0];
  let user = [1, 0, 1, 1, 0];
  for (let j = 0; j < user.length; j++) {
    for (let i = 0; i < data.length; i++) {
      //one cuz user_id
      if (data[i][j + 1] == user[j]) {
        for (let n = 0; n < user.length; n++) {
          if (user[n] == 0) {
            //plus one cuz user_id
            if (data[i][n + 1] == 1) {
              count[n] += 1;
            }
          } else count[n] = "a";
        }
      }
    }
  }
  console.log(count);
}*/

fetchData().then((data) => {
  if (data) {
    console.log();
    reccomender(data[0], data[1]);
  }
});
