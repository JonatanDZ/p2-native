//import DB functions;
import { getAllUserEventsDB } from "./recommenderAlgorithmsServer.js";

import { getEvents } from "../dbserver.js";
export async function recommenderAlgorithmForEvents(userID) {
  //Get data from database
  let events = await getEvents();
  let userEvents = await getAllUserEventsDB();
  //Call recommender with the data
  return recommendEvents(userEvents, events, userID);
}

//The event recommender algorithm. Currently only looks at events people are singed up for
export async function recommendEvents(data, events, userId) {
  //If either data is NULL then stop
  if (!data || !events) return events;

  let currentUser = userId; //Get currentUser

  let result = []; //Holds the score and id of the events

  //Initialize score to [0,eventID]
  for (let i = 0; i < events.length; i++) {
    result[i] = [];
    result[i][0] = 0;
    result[i][1] = events[i].ID;
  }

  //Finds and creates user, which hold id of events current user attends ex. [4,9,1,7]
  let user = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].userID == currentUser) {
      user.push(data[i].eventID);
    }
  }

  //Reccomender
  for (let n = 0; n < user.length; n++) {
    for (let i = 0; i < data.length; i++) {
      //If a user is at event [n], find other user [i] at event
      if (user[n] == data[i].eventID && data[i].userID != currentUser) {
        //If other person is at event, look at what other person is otherwise at
        for (let k = 0; k < data.length; k++) {
          //If other user is at other event add other event score.
          if (data[k].userID == data[i].userID) {
            result[data[k].eventID - 1][0] += 1;
          }
        }
      }
    }
  }
  //Sort it by amount
  result.sort(sortFunction);

  //Print top 3 reccomended
  console.log(
    `We reccomend event ${result[0][1]}, event ${result[1][1]} and event ${result[2][1]}`
  );
  let resultsEvents = result.map((event) => ({
    // Saves id on every item in the list
    ID: event[1],
    // Saves scores on every item in the list with dotProduct(), slice(1) to remove id's, slice(1) makes it start at index 1 instead of zero.
    score: event[0],
  }));
  console.log(resultsEvents);
  return resultsEvents;
}

//Sorts array by first column
function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? -1 : 1;
  }
}
