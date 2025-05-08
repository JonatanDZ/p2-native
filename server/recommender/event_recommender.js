//import mysql from "mysql2/promise";
import {
  getAllEventsDB,
  getAllUserEventsDB,
} from "./recommenderAlgorithmsServer.js";

export async function recommenderAlgorithmForEvents() {
  let events = await getAllEventsDB();
  let userEvents = await getAllUserEventsDB();
  return reccomendEvents(userEvents, events);
}

//The event recommender algorithm. Currently only looks at events people are singed up for
function reccomendEvents(data, events) {
  let currentUser = 1; //Get currentUser from database (somehow?) SHOULD BE CHANGED
  let user = []; //User holds the event id's of the events the user attends
  let result = []; //Holds the score and id of the events
  
  //Initialize score to [0,eventID]
  for (let i = 0; i < events.length; i++) {
    result[i] = [];
    result[i][0] = 0;
    result[i][1] = events[i].ID; //SHOUL BE EVENT_ID INSTEAD?
  }

  //Finds and creates user:
  for (let i = 0; i < data.length; i++) {
    if (data[i].userID == currentUser) {
      user.push(data[i].eventID);
    }
  }

  user.sort();
  console.log("USER", user);

  //Reccomender
  for (let n = 0; n < user.length; n++) {
    for (let i = 0; i < data.length; i++) {
      //If a user is at event, find other user i at event
      console.log("user[n]", user[n], "data[i][1]", data[i].eventID);
      if (user[n] == data[i].eventID && data[i].userID != currentUser) {
        //If other person is at event, look at what other person is otherwise at
        for (let k = 0; k < data.length; k++) {
          if (data[k].userID == data[i].userID) {
            result[data[k].eventID - 1][0] += 1;
          }
        }
      }
    }
  }
  //Sort it by amount
  result.sort(sortFunction);
  console.log("LIST", result);
  //Print top 3 reccomended
  console.log(
    `We reccomend event ${result[0][1]}, event ${result[1][1]} and event ${result[2][1]}`
  );
  return result;
}

//https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? -1 : 1;
  }
}

recommenderAlgorithmForEvents();
