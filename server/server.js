//Import and export functions:
import { /*ValidationError, NoResourceError,*/ processReq } from "./router.js";
export { startServer, fileResponse, authenticateToken };

import http from "http"; //Import http protocol
import fs from "fs"; //Import file reader
import db from './database.js'; //database access thingiemagic

import path from 'path'; //file handling for creating json file
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); //getting the right directory
const __dirname = path.dirname(__filename);
const hostname = "localhost";
const port = 3001; //Run on port 3000 - If Uni server then 3330
const query = 'SELECT * FROM p2_database.products_table;';
const server = http.createServer(requestHandler); //Create a server with a request handler

const rootDir = path.resolve(__dirname, '..'); // more directory scenanigans
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

db.query(query, (err, results) => {
  if (err) {
    console.error('Query error:', err);
    process.exit(1);
  }

  if (results.length > 0) {
    console.log('Raw event data:', results);

    const jsonPath = path.join(publicDir, 'data.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ products: results }, null, 2));
    console.log(`data.json created with ${results.length} event(s)`);
  } else {
    console.log('No events found in the database.');
  }

  db.end();
});

//Create function for standard error response
function errorResponse(res, code, reason) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/txt");
  res.write(reason);
  res.end("\n");
}

//jwt authenticator to check if the user is logged in
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
      console.log("No token provided");

      const isFetch = req.headers["accept"]?.includes("application/json");
      if (isFetch) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "No token provided" }));
      } else {
          res.writeHead(302, { Location: "/public/pages/login/login.html" });
          return res.end();
      }
  }

  jwt.verify(token, SECRET_KEY_JWT, (err, user) => {
      if (err) {
          const isFetch = req.headers["accept"]?.includes("application/json");
          if (isFetch) {
              res.writeHead(403, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Invalid or expired token" }));
          } else {
              res.writeHead(302, { Location: "/public/pages/login/login.html" });
              return res.end();
          }
      }

      req.user = user;
      next();
  });
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
