export { processReq };
import { startServer, fileResponse } from "./server.js";

//Process the request
function processReq(req, res) {
  //Print method and path (for checking errors)
  console.log("GOT: " + req.method + " " + req.url);

  let baseURL = "http://" + req.headers.host + "/";
  let url = new URL(req.url, baseURL);
  //let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname);

  //Check for the request method:
  switch (req.method) {
    case "POST":
      break;
    case "GET":
      {
        //If the request is a get, split the path and print
        let pathElements = queryPath.split("/");
        console.log(req.url);
        console.log(pathElements);
        //Replace the first "/" with nothing (ex. /index.html becomes index.html)
        let betterURL = req.url.replace(req.url[0], "");

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
