//Import and export functions:
import { processReq } from "./router.js";
export { startServer, fileResponse, sendConfirmationEmail, extractJSON };
import dotenv from "dotenv";
dotenv.config();

// Nodemailer is used to send emails
import nodemailer from "nodemailer";

import http from "http"; //Import http protocol
import fs from "fs"; //Import file reader

const hostname = "localhost";
const port = 3000; //Run on port 3000
const server = http.createServer(requestHandler); //Create a server with a request handler

//Create function for standard error response
function errorResponse(res, code, reason) {
    res.statusCode = code;
    res.setHeader("Content-Type", "text/txt");
    res.write(reason);
    res.end("\n");
}

export function requestHandler(req, res) {
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

//Helper functions for the router

//Finds the MIME type of the file - Function is taken from the BMI server
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

//Reads and writes the found file - Function is a simplified version of the BMI one
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

// Function to send a confirmation email
async function sendConfirmationEmail(
    recipientEmail,
    basket,
    shopName,
    fornavn,
    efternavn,
    totalPrice
) {
    // Check if the required environment variables are set
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const itemList = basket
        .map((item) => {
            const quantity = item.quantity || 1;
            return `<li>${item.name} x ${quantity} – ${item.price}</li>`;
        })
        .join("");

    const shopList = shopName.map((shop) => `<li>${shop}</li>`).join("");

    const mailOptions = {
        from: `"Din Butik" <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: "Din ordrebekræftelse",
        html: `
            <h2>Hej ${fornavn} ${efternavn},</h2>
            <p>Tak for din ordre!</p>
            <p>Her er dine varer:</p>
            <ul>${itemList}</ul>
            <p><strong>Afhentes i butik:</strong></p>
            <ul>${shopList}</ul>
            <p>Vi glæder os til at se dig!</p>
            <p><strong>Total pris:</strong> DKK ${totalPrice}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent!");
    console.log("Message ID:", info.messageId);
}

//Taken from BMI server (Nicolai?)
function extractJSON(req) {
    console.log("Content-Type:", req.headers["content-type"]);

    if (isJsonEncoded(req.headers["content-type"]))
        return collectPostBody(req).then((body) => {
            // laver string om fra collectPostBody om til json, et js object
            let x = JSON.parse(body);
            return x;
        });
    else {
        console.warn("Invalid Content-Type — expected application/json");
        return Promise.reject(new Error("Invalid Content-Type"));
    }
}

function isJsonEncoded(contentType) {
    // contentType = "application/json; charset=utf-8", vi split og tager element 0. altså: application/json, så trimmer vi, fjerner forkerte mellemrum foran eller bag. så tjekker vi om det er
    // ctType === application/json. og returner true eller false. 
    let ctType = contentType.split(";")[0];
    ctType = ctType.trim();
    return ctType === "application/json";
    //would be more robust to use the content-type module and  contentType.parse(..)
}

function collectPostBody(req) {
    //the "executor" function
    function collectPostBodyExecutor(resolve, reject) {
        // Liste af chunks: fx: Chunk 1: { "userId": 1, Chunk 2:  "itemId": 4 }, det kommer som binary: bodyData = [ <Buffer 7b 20 22 75 73 65 72 49 44 22 3a 20 31 2c>,   // '{ "userID": 1,'<Buffer 20 22 69 74 65 6d 49 44 22 3a 20 34 20 7d>    // ' "itemID": 4 }']
        let bodyData = [];
        // holder styr på hvor mange bytes vi har
        let length = 0;
        req
            .on("data", (chunk) => {
                bodyData.push(chunk);
                length += chunk.length;

                if (length > 10000000) {
                    //10 MB limit!
                    req.connection.destroy(); //we would need the response object to send an error code
                    reject(new Error(MessageTooLongError));
                }
            })
            .on("end", () => {
                // buffer sætter de to chunks sammen, de kommer i binær, derefter bliver de lavet til tekst med to string
                bodyData = Buffer.concat(bodyData).toString(); //By default, Buffers use UTF8
                //  Bit annoying but comments can be removed
                console.log(bodyData);
                resolve(bodyData);
            });
        //Exceptions raised will reject the promise
    }
    return new Promise(collectPostBodyExecutor);
}

startServer();
