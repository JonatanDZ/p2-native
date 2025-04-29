//Import and export functions:
import { /*ValidationError, NoResourceError,*/ processReq } from "./router.js";
export { startServer, fileResponse };
import dotenv from 'dotenv';
dotenv.config();

import http from "http"; //Import http protocol
import fs from "fs"; //Import file reader

const hostname = "localhost";
const port = 3000; //Run on port 3000 - If Uni server then 3330
const server = http.createServer(requestHandler); //Create a server with a request handler

//Create function for standard error response
function errorResponse(res, code, reason) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/txt");
  res.write(reason);
  res.end("\n");
}

function requestHandler(req, res) {
  try {
    //Try to proceess the request
    processReq(req, res);
  } catch (e) {
    //If an exeption is thrown, print an error
    console.log("Error!!: " + e);
    errorResponse(res, 500, "");
  }
}

//Start the server
function startServer() {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

//Try to guess the type of the file to respond with (ex. html, css...) (TAKEN FROM BMI)
function guessMimeType(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  console.log(fileExtension);
  const ext2Mime = {
    //Aught to check with IANA spec
    txt: "text/txt",
    html: "text/html",
    ico: "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
    js: "text/javascript",
    json: "application/json",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpeg",
    wav: "audio/wav",
    mp3: "audio/mpeg",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/msword",
  };
  return ext2Mime[fileExtension] || "text/plain";
}

//Write the given file
function fileResponse(res, filename) {
  //const sPath=securePath(filename);
  //console.log("Reading:"+sPath);

  //Read the file. If error then throw it
  fs.readFile(filename, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res, 404, String(err));
    } else {
      //If no error then write the file with the given type
      res.statusCode = 200;
      res.setHeader("Content-Type", guessMimeType(filename));
      res.write(data);
      res.end("\n");
    }
  });
}

//Start the server:
startServer();
