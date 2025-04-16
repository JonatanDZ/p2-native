export { processReq };
import { fileResponse } from "./server.js";
import mysql from "mysql2/promise";

//Import stripe and dotenv
import Stripe from "stripe";
import dotenv from "dotenv";

let db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "TESTtest123",
  database: "p2_database",
  port: 3306,
});

//Use dotenv to access stripe key (i think?)
dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
    /*case "OPTIONS":
      //If the request is an OPTIONS
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      break;*/
    case "POST":
      //////////////////////////
      if (req.url === "/event-detail") {
        let body = "";

        //Get given data (userID & eventID)
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { userID, eventID } = JSON.parse(body);
            //Insert the given data into user_events
            db.query("INSERT INTO user_events (userID,eventID) VALUES (?,?)", [
              userID,
              eventID,
            ]);
            /*For testing:
            const [test] = await db.query("SELECT * FROM user_events");
            const rows = test.map((row) => Object.values(row));
            console.log(rows);*/
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        });
        /////////////////////////////////////////////////
      } else if (req.url === "/create-checkout-session") {
        let body = "";

        //Get data and save in "body" (i think?)
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { totalPrice } = JSON.parse(body);

            if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
              res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ error: "Invalid total price" }));
              return;
            }

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              line_items: [
                {
                  price_data: {
                    currency: "dkk",
                    product_data: { name: "Din kurv" },
                    unit_amount: Math.round(Number(totalPrice) * 100),
                  },
                  quantity: 1,
                },
              ],
              mode: "payment",
              success_url:
                "http://localhost:5500/public/pages/paymentsystem/paymentsuccess.html", //CHANGE LOCAL HOST TO ACTUAL NUMBER EX. 3000
              cancel_url:
                "http://localhost:5500/public/pages/paymentsystem/paymentfail.html",
            });

            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(JSON.stringify({ url: session.url }));
          } catch (err) {
            console.error("Stripe error:", err.message);
            res.writeHead(500, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
      break;
    case "GET":
      {
        //If the request is a GET, split the path and print
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
          /*case "public/pages/events/event-detail.html?id=1":
                                    console.log("TEST");
                                    const [test] = connection.query(
                                      "SELECT * FROM user_event ORDER BY userID"
                                    );
                                    const rows = test.map((row) => Object.values(row));
                                    console.log(rows);
                                    break;*/
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
