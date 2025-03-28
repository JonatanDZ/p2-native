import { ValidationError, NoResourceError, processReq } from "./router.js";
export { startServer, fileResponse };

import http from "http";
import fs from "fs";

const hostname = "localhost";
const port = 3000;

const server = http.createServer(requestHandler);

function errorResponse(res, code, reason) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/txt");
  res.write(reason);
  res.end("\n");
}

function requestHandler(req, res) {
  try {
    processReq(req, res);
  } catch (e) {
    console.log("Error!!: " + e);
    //errorResponse(res, 500, "");
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/txt");
    res.write("");
    res.end("\n");
  }
}

function startServer() {
  /* start the server */
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    fs.writeFileSync(
      "message.txt",
      `Server running at http://${hostname}:${port}/`
    );
  });
}

function fileResponse(res, filename) {
  //const sPath=securePath(filename);
  //console.log("Reading:"+sPath);
  fs.readFile(filename, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res, 404, String(err));
    } else {
      let filetype = filename.split(".");
      res.statusCode = 200;
      if (filetype[1] == "html") {
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end("\n"); //SET HEADER DEPENDING ON TYPE. CURRENTLY ONLY WORKS FOR HTML FILES
      } else if (filetype[1] == "js") {
        res.setHeader("Content-Type", "text/js");
        res.write(data);
        res.end("\n");
      } else if (filetype[1] == "jpg") {
        res.setHeader("Content-Type", "image/jpg");
        //res.send(data);
      }
    }
  });
}
