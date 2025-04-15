export { processReq };
import { fileResponse } from "./server.js";

//Process the server request
function processReq(req, res) {
  //Print method and path (for checking errors)
  console.log("GOT: " + req.method + " " + req.url);

  //CHECK WHAT THIS DOES
  let baseURL = "http://" + req.headers.host + "/";
  let url = new URL(req.url, baseURL);
  //let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname);

  //Check for the request method:
  switch (req.method) {
  
    case "GET":
      {
        //If the request is a GET, split the path and print
        let pathElements = queryPath.split("/");
        console.log(req.url);
        console.log(pathElements);
        //Replace the first "/" with nothing (ex. /index.html becomes index.html)
        let betterURL = queryPath.startsWith("/") ? queryPath.slice(1) : queryPath;

        //Look at the first path element (ex. for localhost:3000/index.html look at index.html)
        switch (pathElements[1]) {
          //For no path go to landing page.
          case "":
            fileResponse(res, "public/pages/landing/landing.html");
            break;
          //Otherwise respond with the given path
          default:
            fileResponse(res, betterURL);
            break;
        }
      }
      break;
    default:
      reportError(res, new Error("No Such Resource"));
  }
}
