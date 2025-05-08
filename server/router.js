//Import from other files:
import { createProduct, getProducts, createEvent, getEvents } from "./dbserver.js";
import { fileResponse } from "./server.js";
import { recommenderAlgorithmForUser } from "./recommender/recommenderAlgorithms.js";

//Import libraries
import Stripe from "stripe";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Finding .evn file in root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2";

let db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

//Use dotenv to access stripe key
dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

//Process the server request
async function processReq(req, res) {
  //Print method and path (for checking errors)
  console.log("GOT: " + req.method + " " + req.url);

  let baseURL = "http://" + req.headers.host + "/";
  let url = new URL(req.url, baseURL);
  //let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname);

  //Check for the request method:
  //  POST logic is from BMI app

    switch (req.method) {
        case "POST": {
            let pathElements = queryPath.split("/");
            switch (pathElements[1]) {
                case "save-products": //just to be nice. So, given that the url after "/" is save-products, it does the following:
                    extractJSON(req)
                        //  When converted to JSON it loops through every object and saves it to DB via the createProduct helper function.
                        .then(productData => {
                            productData.forEach(product => {
                                createProduct(product);
                                /* Denne bør have sit eget endpoint (switch case) da der ikke kan være flere end én .then pr endpoint
                            .then((productData) => {
                              productData.forEach((product) => {
                                createProduct(
                                  product.name,
                                  product.price,
                                  product.amount,
                                  product.filters
                                );
                                */
                            });
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(
                                JSON.stringify({ message: "Products saved successfully." })
                            );
                        })
                        .catch((err) => console.error(err));
                    break;

                case "save-events": //just to be nice. So, given that the url after "/" is save-products, it does the following:
          extractJSON(req)
            //  When converted to JSON it loops through every object and saves it to DB via the createProduct helper function.
            .then(productEvent => {
              productEvent.forEach(event => {
                //createProduct(product);
                createEvent(event);
              });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Events saved successfully." })
              );
            })
            .catch((err) => reportError(res, err));
          break;
        case "create-checkout-session":
                    let body = "";
                    req.on("data", (chunk) => (body += chunk.toString()));
                    req.on("end", async () => {
                        try {
                            const { totalPrice, email, basket } = JSON.parse(body);

              if (!totalPrice || !email || !basket) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Missing data" }));
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
                customer_email: email,
                success_url:
                  "http://localhost:3000/public/pages/paymentsystem/paymentsuccess.html",
                cancel_url:
                  "http://localhost:3000/public/pages/paymentsystem/paymentfail.html",
              });

              res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ url: session.url }));
            } catch (err) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;

        case "send-confirmation-email":
          let body2 = "";
          req.on("data", (chunk) => (body2 += chunk.toString()));
          req.on("end", async () => {
            try {
              const { email, basket } = JSON.parse(body2);
              const shopNames = [...new Set(basket.map((item) => item.info))];

              await sendConfirmationEmail(email, basket, shopNames);

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          break;
        case "event-detail":
          let body3 = "";
          //Get given data (userID & eventID)
          req.on("data", (chunk) => {
            body3 += chunk.toString();
          });

          req.on("end", async () => {
            try {
              const { userID, eventID } = JSON.parse(body3);
              //Insert the given data into user_events
              db.query(
                "INSERT INTO user_events (userID,eventID) VALUES (?,?)",
                [userID, eventID]
              );
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
          break;
        case "verify-token":
          let bodyVerify = "";
          req.on("data", (chunk) => {
            bodyVerify += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const { token } = JSON.parse(bodyVerify);

              if (!token) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ isAuthenticated: false }));
              }

              let decoded;
              try {
                decoded = jwt.verify(token, SECRET_KEY_JWT);
              } catch (error) {
                console.error("JWT verification error:", error.message);
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ isAuthenticated: false }));
              }

              const userId = decoded.id;

              db.query(
                "SELECT admin FROM users_table WHERE ID = ?",
                [userId],
                (err, results) => {
                  if (err) {
                    console.error("Database error:", err.message);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ isAuthenticated: false }));
                  }

                  if (results.length === 0) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ isAuthenticated: false }));
                  }

                  const user = results[0];
                  const isAdmin = user.admin === 1;

                  res.writeHead(200, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({ isAuthenticated: true, isAdmin })
                  );
                }
              );
            } catch (error) {
              console.error("Unexpected error:", error.message);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ isAuthenticated: false }));
            }
          });
          break;

        default:
          console.error("Resource doesn't exist");
      }

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
        //for POST on signup page
      } else if (req.url === "/signup") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { email, password, name } = JSON.parse(body);

            if (!email || !password || !name) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ error: "All fields are required" })
              );
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into database
            db.query(
              "INSERT INTO users_table (name, email, password) VALUES (?, ?, ?)",
              [name, email, hashedPassword],
              (err, result) => {
                if (err) {
                  console.error(
                    "Der eksisterer allerede en bruger med denne mail",
                    err
                  );
                  res.writeHead(500, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({
                      error: "Der eksisterer allerede en bruger med denne mail",
                    })
                  );
                }

                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ message: "User registered successfully" })
                );
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
              return res.end(
                JSON.stringify({ error: "Email og password skal udfyldes" })
              );
            }

            db.query(
              "SELECT * FROM Users_table WHERE email = ?",
              [email],
              async (err, results) => {
                if (err) {
                  console.error("Database error:", err);
                  res.writeHead(500, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({ error: "Internal server error" })
                  );
                }

                if (results.length === 0) {
                  res.writeHead(401, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({ error: "Forkert email eller password" })
                  );
                }

                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if (isMatch) {
                  //create token for successfully logged in
                  const token = jwt.sign({ id: user.ID }, SECRET_KEY_JWT, {
                    expiresIn: "30m",
                  });

                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({ message: "Du er nu logget ind", token })
                  );
                } else {
                  res.writeHead(401, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({ error: "Forkert email eller password" })
                  );
                }
              }
            );
          } catch (error) {
            console.error("Login error:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        });
      }
      break;
    }

    case "GET":
      {
        //If the request is a GET, split the path and print
        let pathElements = queryPath.split("/");

        //Replace the first "/" with nothing (ex. /index.html becomes index.html)
        let betterURL = queryPath.startsWith("/")
          ? queryPath.slice(1)
          : queryPath;

        //Look at the first path element (ex. for localhost:3000/index.html look at index.html)
        switch (pathElements[1]) {
          //For no path go to landing page.
          case "":
            fileResponse(res, "public/pages/landing/landing.html");
            break;
          case "get-products":
            //  When visiting this endpoint the backend should send back all products from DB
            try {
              const products = await getProducts();
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(products));
            } catch (error) {
              console.error("Error fetching products:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to fetch products" }));
            }
            break;
          case "recommend":
            await recommenderAlgorithmForUser()
              .then((rec) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(rec));
              })
              .catch((err) => {
                console.error("Error with fetching recommended list", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Failed to fetch products list" })
                );
              });
            break;
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

// helper functions for POST part

async function sendConfirmationEmail(recipientEmail, basket, shopNames) {
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

  const shopList = shopNames.map((shop) => `<li>${shop}</li>`).join("");

  const mailOptions = {
    from: `"Din Butik" <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: "Din ordrebekræftelse",
    html: `
          <h2>Tak for din ordre!</h2>
          <p>Her er dine varer:</p>
          <ul>${itemList}</ul>
          <p><strong>Afhentes i butik:</strong></p>
          <ul>${shopList}</ul>
          <p>Vi glæder os til at se dig!</p>
      `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Mail sent!");
  console.log("Message ID:", info.messageId);
}

function extractJSON(req) {
  if (isJsonEncoded(req.headers["content-type"]))
    return collectPostBody(req).then((body) => {
      let x = JSON.parse(body);
      //console.log(x);
      return x;
    });
  else return Promise.reject(new Error(ValidationError)); //create a rejected promise
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

export { processReq };
