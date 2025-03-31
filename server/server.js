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
  //incomplete
  return ext2Mime[fileExtension] || "text/plain";
}

function fileResponse(res, filename) {
  //const sPath=securePath(filename);
  //console.log("Reading:"+sPath);
  fs.readFile(filename, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res, 404, String(err));
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", guessMimeType(filename));
      res.write(data);
      res.end("\n");
      /*let filetype = filename.split(".");
      res.statusCode = 200;
      if (filetype[1] == "html") {
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end("\n"); //SET HEADER DEPENDING ON TYPE. CURRENTLY ONLY WORKS FOR HTML FILES
      } else if (filetype[1] == "css") {
        res.setHeader("Content-Type", "text/css");
        res.write(data);
        res.end("\n");
      } /*else if (filetype[1] == "jpg") {
        res.setHeader("Content-Type", "image/jpg");
        //res.send(data);
      }*/
    }
  });
}
