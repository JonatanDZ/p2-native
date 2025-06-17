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
//Den her funktion tager 3 parametre, res (HTTTP respons), code (HTTP statuskode) og reason(en tekst som forklarer fejlen). Funktionen bruges når vi skal sende en fejl
//tilbage til brugeren. Vi giver funktionen en statuskode og en fejlbesked. Det gør det let for os og mere ensartet at håndtere fejl flere steder i vores kode.
function errorResponse(res, code, reason) {
    res.statusCode = code;
    res.setHeader("Content-Type", "text/txt");
    res.write(reason);
    res.end("\n");
}

//funktionen tager 2 parametre, req og res. Forsøger i try at behandle anmodningen ved at kalde på processReq. Sker der en fejl går den så i catch.
//Det er en funktion som tager imod selve HTTP anmodningen. den prøver at sende den videre til processReq som håndterer logikken.
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
//denne funktion finder ud af hvilken MIME-type og har den liste af typer den kan kigge igennem. Er der ingen af dem som matcher filendelsen så returner den text/plain
//Den tager ét parameter, filename, som er fx billede.png.
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
//denne funktion tager 2 parametre res (HTTP respons objektet) og filename(navnet på den fil som skal sendes tilbage til brugeren)
//findes filen og der ikke sker fejl kalder vi på guessMimeType fra ovenover og sender den korrekte mime-type tilbage.
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
//funtionen tager 6 parametre. Den er asynkron da vi senere først vil fortsætte når mailen er sendt. Funktionen bruger nodemailer library.  
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
//en funktion som tjekker om en HTTP request har JSON indhold. Hvis den har, samler og parser den requestens body til et javascript object. Så værdierne kan bruges i koden.
function extractJSON(req) {
    console.log("Content-Type:", req.headers["content-type"]);

    if (isJsonEncoded(req.headers["content-type"]))
        return collectPostBody(req).then((body) => {
            let x = JSON.parse(body);
            return x;
        });
    else {
        console.warn("Invalid Content-Type — expected application/json");
        return Promise.reject(new Error("Invalid Content-Type"));
    }
}

function isJsonEncoded(contentType) {
    //Format
    //Content-Type: application/json; encoding
    let ctType = contentType.split(";")[0];
    ctType = ctType.trim();
    return ctType === "application/json";
    //would be more robust to use the content-type module and  contentType.parse(..)
}

function collectPostBody(req) {
    //the "executor" function
    function collectPostBodyExecutor(resolve, reject) {
        let bodyData = [];
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
