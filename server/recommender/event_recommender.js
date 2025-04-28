import mysql from "mysql2/promise";

//The event recommender: Should be called somewhere on front page?

let currentUser = 1; //Get currentUser from database (somehow?) SHOULD BE CHANGED

//Creates and async function to get the database data
async function fetchData() {
  let connection;
  //Create a try statement to catch possible errors
  try {
    // Create connection to p2_database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    //If no error, then print succes:
    console.log("Connected to MySQL");

    //Make a query (commad to recive data) on the database to get everything in user_events
    const [test] = await connection.query(
      "SELECT * FROM user_events ORDER BY userID"
    );
    //Map the result to an array (change from json to array)
    const users_events_rows = test.map((row) => Object.values(row));
    console.log(users_events_rows);

    //Get everything from events_table
    const [events_length] = await connection.query(
      "SELECT * FROM events_table"
    );
    const events_rows = events_length.map((row) => Object.values(row));
    console.log(events_rows);
    //Take the length of the events table (how many events are present)
    const events_rows_length = events_rows.length;
    console.log(events_rows_length);

    //Return the data from user_event and the amount of events
    return [users_events_rows, events_rows_length];
  } catch (err) {
    //Catch error
    console.error("Database error:", err);
  } finally {
    if (connection) {
      await connection.end();
      //Write when database closes
      console.log("Database connection closed.");
    }
  }
}

//The event recommender algorithm. Currently only looks at events people are singed up for
function reccomender(data, events_length) {
  let user = []; //Users gonna be something like [2,5,3,1] which is eventID 2,5,3 and 1
  let count = [];
  //Initialize count to 0 and event to 1 - 10
  for (let i = 0; i < events_length; i++) {
    count[i] = [];
    count[i][0] = 0;
    count[i][1] = i; //SHOUL BE EVENT_ID INSTEAD?
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
  //Sort it by amount
  count.sort(sortFunction);
  //Print top 3 reccomended
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

//Calling the fetch function
fetchData().then((data) => {
  if (data) {
    console.log();
    //Call recommender
    reccomender(data[0], data[1]);
  }
});
