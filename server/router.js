export { processReq };
import { fileResponse, authenticateToken  } from "./server.js";

//Import stripe and dotenv
import Stripe from "stripe";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2";

//Use dotenv to access keys in .env file
dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const SECRET_KEY_JWT = (process.env.SECRET_KEY_JWT);

// Create database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "niko",
    password: "1234",
    database: "databas",
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

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
      if (req.url === "/create-checkout-session") {
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
        //for POST on signup page
      } else if (req.url === "/signup") {
            let body = "";
    
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
    
            req.on("end", async () => {
                try {
                    const { email, password } = JSON.parse(body);
    
                    if (!email || !password) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Email and password are required" }));
                    }
    
                    // Hash the password
                    const hashedPassword = await bcrypt.hash(password, 10);
    
                    // Insert user into database
                    db.query(
                        "INSERT INTO User (email, password) VALUES (?, ?)",
                        [email, hashedPassword],
                        (err, result) => {
                            if (err) {
                                console.error("Der eksisterer allerede en bruger med denne mail", err);
                                res.writeHead(500, { "Content-Type": "application/json" });
                                return res.end(JSON.stringify({ error: "Der eksisterer allerede en bruger med denne mail" }));
                            }
    
                            res.writeHead(201, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "User registered successfully" }));
                        }
                    );
                } catch (error) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Internal server error 1234" }));
                }
            });
        //for POST on login page
      } else if (req.url === "/login") {
         let body = "";
      
          req.on("data", (chunk) => {
              body += chunk.toString();
          });
      
          req.on("end", async () => {
              try {
                  const { email, password } = JSON.parse(body);
      
                  if (!email || !password) {
                      res.writeHead(400, { "Content-Type": "application/json" });
                      return res.end(JSON.stringify({ error: "Email og password skal udfyldes" }));
                  }
      
                  db.query("SELECT * FROM User WHERE email = ?", [email], async (err, results) => {
                      if (err) {
                          console.error("Database error:", err);
                          res.writeHead(500, { "Content-Type": "application/json" });
                          return res.end(JSON.stringify({ error: "Internal server error" }));
                      }
      
                      if (results.length === 0) {
                          res.writeHead(401, { "Content-Type": "application/json" });
                          return res.end(JSON.stringify({ error: "Forkert email eller password" }));
                      }
      
                      const user = results[0];
                      const isMatch = await bcrypt.compare(password, user.password);
      
                      if (isMatch) {
                          //create token for successfully logged in
                          const token = jwt.sign({ email: user.email }, SECRET_KEY_JWT, { expiresIn: "30m" });
  
                          res.writeHead(200, { "Content-Type": "application/json" });
                          res.end(JSON.stringify({ message: "Du er nu logget ind", token }));
                      } else {
                          res.writeHead(401, { "Content-Type": "application/json" });
                          res.end(JSON.stringify({ error: "Forkert email eller password" }));
                      }
                  });
              } catch (error) {
                  console.error("Login error:", error);
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Internal server error" }));
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

        if (req.url === "public/pages/userdashboard/userdashboard.html") {
          authenticateToken(req, res, () => {
            fileResponse(res, "public/pages/userdashboard/userdashboard.html");
          });
          break;
        }

        if (req.url === "verifyToken") {
          authenticateToken(req, res, () => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ valid: true }));
          });
          break;
        }
        

        //Look at the first path element (ex. for localhost:3000/index.html look at index.html)
        switch (pathElements[1]) {
          //For no path go to landing page.
          case "":
            fileResponse(res, "public/pages/landing/landing.html");
            break;
            //else: route to login 
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
