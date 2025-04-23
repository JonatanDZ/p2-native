import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from './database.js';
import jwt from 'jsonwebtoken'; // required for token-based login
import { processReq } from "./router.js"; // keep your router usage
export { startServer, fileResponse, authenticateToken };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hostname = "localhost";
const port = 3001;

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const server = http.createServer(async (req, res) => {
    try {
      processReq(req, res);
    } catch (e) {
      console.error("Error!!:", e);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error\n");
    }
  });

function startServer() {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

function guessMimeType(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  const ext2Mime = {
    txt: "text/txt",
    html: "text/html",
    ico: "image/x-icon",
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
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return ext2Mime[fileExtension] || "text/plain";
}

function fileResponse(res, filename) {
  fs.readFile(filename, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
    } else {
      res.writeHead(200, { "Content-Type": guessMimeType(filename) });
      res.end(data);
    }
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "No token provided" }));
  }

  jwt.verify(token, SECRET_KEY_JWT, (err, user) => {
    if (err) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid or expired token" }));
    }

    req.user = user;
    next();
  });
}

startServer();
