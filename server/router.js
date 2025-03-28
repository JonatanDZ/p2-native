export { ValidationError, NoResourceError, processReq };
import { startServer, fileResponse } from "./server.js";

const ValidationError = "Validation Error";
const NoResourceError = "No Such Resource";

startServer();

function processReq(req, res) {
  console.log("GOT: " + req.method + " " + req.url);

  let baseURL = "http://" + req.headers.host + "/";
  let url = new URL(req.url, baseURL);
  let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname);

  switch (req.method) {
    case "POST":
      break;
    case "GET":
      {
        let pathElements = queryPath.split("/");
        console.log(pathElements);
        switch (pathElements[1]) {
          case "":
            fileResponse(res, "public/pages/landing/landing.html");
            break;
          case "/public/pages/index.html":
            fileResponse(res, "public/pages/index.html");
            break;
          case "global.css":
            fileResponse(res, "public/css/global.css");
            break;
          case "landing.css":
            fileResponse(res, "public/css/landing.css");
            break;
          default:
            //console.log("Neither POST or GET");
            fileResponse(res, req.url);
            break;
        }
      }
      break;
    default:
      reportError(res, new Error(NoResourceError));
  }
}
