//Import from other files:
import { createProduct, getProducts, createEvent, getEvents } from "./dbserver.js";
import { fileResponse } from "./server.js";
import { recommenderAlgorithmForUser } from "./recommender/recommenderAlgorithms.js";
import { recommenderAlgorithmForEvents } from "./recommender/event_recommender.js";

//Import libraries
// Stripe library to interact with Stripe's API
import Stripe from "stripe";

// dotenv library to load environment variables from .env file
import dotenv from "dotenv";

// path library to handle and manipulate file paths
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Finding .evn file in root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mysql from "mysql2";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

//Use dotenv to access stripe secret key
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

  switch (req.method) {
    case "POST":
      {
        let pathElements = queryPath.split("/");
        switch (pathElements[1]) {
          case "save-products": //just to be nice. So, given that the url after "/" is save-products, it does the following:
            extractJSON(req)
              //  When converted to JSON it loops through every object and saves it to DB via the createProduct helper function.
              .then((productData) => {
                productData.forEach((product) => {
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
          case "send-confirmation-email":
            let bodyConfirmationMail = "";

            // Listen for incoming data and append it to the body
            req.on(
              "data",
              (chunk) => (bodyConfirmationMail += chunk.toString())
            );

            req.on("end", async () => {
              try {
                const{ email, basket, fornavn, efternavn } = JSON.parse(bodyConfirmationMail);
                const shopNames = [...new Set(basket.map((item) => item.info))];

                await sendConfirmationEmail(email, basket, shopNames, fornavn, efternavn);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            break;

          case "verify-token":
            let bodyVerify = "";

            // Listen for incoming data and append it to the body
            req.on("data", (chunk) => {
              bodyVerify += chunk.toString();
            });

            req.on("end", async () => {
              try {
                const { token } = JSON.parse(bodyVerify);

                // If no token respond with 400 (Bad request)
                if (!token) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  return res.end(JSON.stringify({ isAuthenticated: false }));
                }

                let decoded;

                try {
                  // Verify the token using secret_key
                  decoded = jwt.verify(token, SECRET_KEY_JWT);
                } catch (error) {
                  // If the token is invalid or expired, respond unauthorized
                  console.error("JWT verification error:", error.message);
                  res.writeHead(401, { "Content-Type": "application/json" });
                  return res.end(JSON.stringify({ isAuthenticated: false }));
                }

                const userId = decoded.id;

                //Look into database by the users ID
                db.query(
                  "SELECT admin FROM users_table WHERE ID = ?",
                  [userId],
                  (err, results) => {
                    if (err) {
                      console.error("Database error:", err.message);
                      res.writeHead(500, {
                        "Content-Type": "application/json",
                      });
                      return res.end(
                        JSON.stringify({ isAuthenticated: false })
                      );
                    }
                    // If no user return unauthorized
                    if (results.length === 0) {
                      res.writeHead(404, {
                        "Content-Type": "application/json",
                      });
                      return res.end(
                        JSON.stringify({ isAuthenticated: false })
                      );
                    }

                    // Extract admin status from the user record
                    const user = results[0];
                    // If user.admin === 1 isAdmin will be true
                    // If user.admin !== 1 isAdmin will be false
                    const isAdmin = user.admin === 1;

                    // Respond with authorized admin
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

          case "event-detail":
            let bodyEventDetail = "";

            // Listen for incoming data and append it to the body
            req.on("data", (chunk) => {
              bodyEventDetail += chunk.toString();
            });

            req.on("end", async () => {
              try {
                const { userID, eventId } = JSON.parse(bodyEventDetail);
                //Insert the given data into user_events
                db.query(
                  "INSERT INTO user_events (userID,eventID) VALUES (?,?)",
                  [userID, eventId]
                );
              } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Internal server error" }));
              }
            });
            break;

          case "create-checkout-session":
            let bodyCheckoutSession = "";

            // Listen for incoming data and append it to the body
            req.on("data", (chunk) => {
              bodyCheckoutSession += chunk.toString();
            });

            req.on("end", async () => {
              try {
                const { totalPrice } = JSON.parse(bodyCheckoutSession);

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
                    "http://localhost:3000/public/pages/paymentsystem/paymentsuccess.html", //CHANGE LOCAL HOST TO ACTUAL NUMBER EX. 3000
                  cancel_url:
                    "http://localhost:3000/public/pages/paymentsystem/paymentfail.html",
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
            break;

          case "signup":
            let bodySignup = "";

            // Listen for incoming data and append it to the body
            req.on("data", (chunk) => {
              bodySignup += chunk.toString();
            });

            req.on("end", async () => {
              try {
                const { email, password, name } = JSON.parse(bodySignup);
                // Check that required fields are provided
                if (!email || !password || !name) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({ error: "All fields are required" })
                  );
                }

                // Hash the password that the user has provided
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user into database, name, email and hashedpassword
                db.query(
                  "INSERT INTO users_table (name, email, password) VALUES (?, ?, ?)",
                  [name, email, hashedPassword],
                  (err, result) => {
                    if (err) {
                      console.error(
                        "Der eksisterer allerede en bruger med denne mail",
                        err
                      );
                      res.writeHead(500, {
                        "Content-Type": "application/json",
                      });
                      return res.end(
                        JSON.stringify({
                          error:
                            "Der eksisterer allerede en bruger med denne mail",
                        })
                      );
                    }

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        message: "User registered successfully",
                      })
                    );
                  }
                );
              } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Internal server error 1234" })
                );
              }
            });
            break;

          case "login":
            let bodyLogin = "";

            // Listen for incoming data and append it to the body
            req.on("data", (chunk) => {
              bodyLogin += chunk.toString();
            });

            req.on("end", () => {
              try {
                const { email, password } = JSON.parse(bodyLogin);
                // Check that required fields are provided
                if (!email || !password) {
                  if (!res.headersSent) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        error: "Email og password skal udfyldes",
                      })
                    );
                  }
                  return;
                }

                // Look into database and check the users email
                db.query(
                  "SELECT * FROM users_table WHERE email = ?",
                  [email],
                  (err, results) => {
                    if (err) {
                      console.error("Database error:", err);
                      if (!res.headersSent) {
                        res.writeHead(500, {
                          "Content-Type": "application/json",
                        });
                        res.end(
                          JSON.stringify({ error: "Internal server error" })
                        );
                      }
                      return;
                    }
                    // if no email match in the database
                    if (results.length === 0) {
                      if (!res.headersSent) {
                        res.writeHead(401, {
                          "Content-Type": "application/json",
                        });
                        res.end(
                          JSON.stringify({
                            error: "Forkert email eller password",
                          })
                        );
                      }
                      return;
                    }

                    const user = results[0];

                    // Compare provided password with hashed password in the database (bcrypt does the hashing)
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                      if (err) {
                        console.error("Bcrypt error:", err);
                        if (!res.headersSent) {
                          res.writeHead(500, {
                            "Content-Type": "application/json",
                          });
                          res.end(
                            JSON.stringify({
                              error: "Password comparison failed",
                            })
                          );
                        }
                        return;
                      }

                      // Create jsonwebtoken for authenticating user
                      if (isMatch) {
                        const token = jwt.sign(
                          { id: user.ID },
                          SECRET_KEY_JWT,
                          { expiresIn: "30m" }
                        );
                        if (!res.headersSent) {
                          res.writeHead(200, {
                            "Content-Type": "application/json",
                          });
                          res.end(
                            JSON.stringify({
                              message: "Du er nu logget ind",
                              token,
                            })
                          );
                        }
                      } else {
                        if (!res.headersSent) {
                          res.writeHead(401, {
                            "Content-Type": "application/json",
                          });
                          res.end(
                            JSON.stringify({
                              error: "Forkert email eller password",
                            })
                          );
                        }
                      }
                    });
                  }
                );
              } catch (error) {
                console.error("Login error:", error);
                if (!res.headersSent) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Internal server error" }));
                }
              }
            });
            break;

          default:
            console.error("Resource doesn't exist");
        }
      }
      break;

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
          case "get-events":
            try {
              const events = await getEvents();
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(events));
            } catch (error) {
              console.error("Error fetching events:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to fetch events" }));
            }
            break;
          case "recommend":
            await recommenderAlgorithmForUser(2)
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
          case "event-recommend":
            await recommenderAlgorithmForEvents()
              .then((rec) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(rec));
              })
              .catch((err) => {
                console.error(
                  "Error with fetching recommended event list",
                  err
                );
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Failed to fetch events list" })
                );
              });
            break;
            break;
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

// helper functions for POST part

async function sendConfirmationEmail(recipientEmail, basket, shopNames, fornavn, efternavn) {
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
          <h2>Hej ${fornavn} ${efternavn},</h2>
          <p>Tak for din ordre!</p>
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
