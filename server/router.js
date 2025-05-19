//Import from other files:
import {
  deleteProduct,
  createProduct,
  getProducts,
  createEvent,
  getEvents,
  getProduct,
  getEvent,
} from "./dbserver.js";
import { fileResponse, sendConfirmationEmail, extractJSON } from "./server.js";
import {
  recommenderAlgorithmForUser,
  recommenderAlgorithmForItem,
} from "./recommender/recommenderAlgorithms.js";
import { recommenderAlgorithmForEvents } from "./recommender/event_recommender.js";
import { updateUserFilters } from "./recommender/updateUserFilters.js";

//Import libraries
// Stripe library to interact with Stripe's API
import Stripe from "stripe";

// dotenv library to load environment variables from .env file
import dotenv from "dotenv";

// path library to handle and manipulate file paths
import path from "path";

import { fileURLToPath } from "url";

import mysql from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Finding .evn file in root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

//Use dotenv to access stripe secret key
dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;

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
      let pathElements = queryPath.split("/");
      switch (pathElements[1]) {
        case "save-products":
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
                                                        );*/
              });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Products saved successfully." })
              );
            })
            .catch((err) => console.error(err));
          break;
        case "delete-product":
          extractJSON(req)
            .then(async ({ productId }) => {
              try {
                const result = await deleteProduct(productId);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    filtersDeleted: result.filtersDeleted,
                    productDeleted: result.productDeleted,
                  })
                );
              } catch (err) {
                console.error("Error deleting product:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to delete product" }));
              }
            })
            .catch((err) => {
              console.error("Error parsing request body:", err);
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid request data." }));
            });
          break;
        case "update-user-filters":
          extractJSON(req)
            .then(({ userId, itemId }) => {
              updateUserFilters(userId, itemId)
                .then(() => {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      message: "User filters updated successfully.",
                    })
                  );
                })
                .catch((err) => {
                  console.error("Error updating user filters:", err);
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      error: "Failed to update user filters.",
                    })
                  );
                });
            })
            .catch((err) => {
              console.error("Error parsing request body:", err);
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid request data." }));
            });
          break;
        case "save-events":
          extractJSON(req)
            //When converted to JSON it loops through every object and saves it to DB via the createProduct helper function.
            .then((productEvent) => {
              productEvent.forEach((event) => {
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
        // Stripe checkout session is created if backend receives the URL path "create-checkout-session"
        case "create-checkout-session":
          let body = "";
          req.on("data", (chunk) => (body += chunk.toString()));
          req.on("end", async () => {
            try {
              const { email, basket } = JSON.parse(body);
              if (!email || !Array.isArray(basket) || basket.length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Missing or invalid data" }));
                return;
              }
              const allProducts = await getProducts(); // Get full DB list
              let totalPrice = 0;
              for (const basketItem of basket) {
                const product = allProducts.find(p => p.ID == basketItem.id); // use == to match number/string
                if (!product) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: `Product ID ${basketItem.id} not found.` }));
                  return;
                }
                const price = typeof product.price === "string"
                ? parseInt(product.price.replace(/[^\d]/g, ""), 10)
                : Number(product.price);
                
                const quantity = basketItem.quantity || 1;
                if (quantity < 1 || quantity > 99) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: `Invalid quantity for product ${basketItem.id}` }));
                  return;
                }
                totalPrice += price * quantity;
              }
              // Create Stripe checkout session with verified total
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price_data: {
                      currency: "dkk",
                      product_data: { name: "Din kurv" },
                      unit_amount: Math.round(totalPrice * 100),
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                customer_email: email,
                success_url: "http://localhost:3000/public/pages/paymentsystem/paymentsuccess.html",
                cancel_url: "http://localhost:3000/public/pages/paymentsystem/paymentfail.html",
              });
              res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ url: session.url }));
            } catch (err) {
              console.error("Checkout error:", err);
              res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;

        // Sends a confirmation email to the user with the given data
        case "send-confirmation-email":
          let bodyConfirmationMail = "";
          // Listen for incoming data and append it to the body
          req.on("data", (chunk) => (bodyConfirmationMail += chunk.toString()));
          req.on("end", async () => {
            try {
              const { email, basket, fornavn, efternavn } = JSON.parse(bodyConfirmationMail);

              const allProducts = await getProducts();

                let correctedBasket = [];
                let totalPrice = 0;

                for (const item of basket) {
                  const product = allProducts.find(p => p.ID == item.id);
                  if (!product) continue;

                  const quantity = item.quantity || 1;
                  const price = typeof product.price === "string"
                    ? parseInt(product.price.replace(/[^\d]/g, ""), 10)
                    : Number(product.price);

                  correctedBasket.push({
                    name: product.name,
                    quantity,
                    price: `DKK ${price}`,
                    shopID: product.shopID
                  });

                  totalPrice += price * quantity;
                }

                 // give each shopId a name
                  const shopIdToName = {
                    1: "Lucy's Tøjbutik",
                    2: "Tøjhjørnet",
                    3: "ModeMekka",
                    4: "Stil & Stof",
                    5: "Den Lille Garderobe"
                };

                const shopIds = [...new Set(correctedBasket.map(item => item.shopID).filter(Boolean))];
                const shopNames = shopIds.map(id => shopIdToName[id] || `Ukendt butik (ID ${id})`);

              await sendConfirmationEmail(
                email,
                correctedBasket,
                shopNames,
                fornavn,
                efternavn,
                totalPrice
              );
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
                    return res.end(JSON.stringify({ isAuthenticated: false }));
                  }
                  // If no user return unauthorized
                  if (results.length === 0) {
                    res.writeHead(404, {
                      "Content-Type": "application/json",
                    });
                    return res.end(JSON.stringify({ isAuthenticated: false }));
                  }
                  // Extract admin status from the user record
                  const user = results[0];
                  // If user.admin === 1 isAdmin will be true
                  // If user.admin !== 1 isAdmin will be false
                  const isAdmin = user.admin === 1;
                  // Respond with authorized admin
                  res.writeHead(200, { "Content-Type": "application/json" });
                  return res.end(
                    JSON.stringify({
                      isAuthenticated: true,
                      isAdmin,
                      userId: userId,
                    })
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
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(
                      JSON.stringify({
                        error:
                          "Der eksisterer allerede en bruger med denne mail",
                      })
                    );
                  }

                  const userId = result.insertId;

                  db.query(
                    `INSERT INTO user_filters (
                    userID, black, white, gray, brown, blue,
                    pants, t_shirt, sweatshirt, hoodie, shoes, shorts,
                    cotton, linnen, polyester
                    ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
                    [userId],
                    (err2) => {
                      if (err2) {
                        console.error(
                          "Fejl under oprettelse af brugerfiltre",
                          err2
                        );
                        res.writeHead(500, {
                          "Content-Type": "application/json",
                        });
                        return res.end(
                          JSON.stringify({
                            error: "Fejl under oprettelse af brugerfiltre",
                          })
                        );
                      }

                      res.writeHead(201, {
                        "Content-Type": "application/json",
                      });
                      res.end(
                        JSON.stringify({
                          message: "User registered successfully",
                        })
                      );
                    }
                  );
                }
              );
            } catch (error) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Internal server error 1234" }));
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
                      const token = jwt.sign({ id: user.ID }, SECRET_KEY_JWT, {
                        expiresIn: "30m",
                      });
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
          case "recommendItems":
            const urlObjRec = new URL(req.url, `http://${req.headers.host}`);
            const userId = parseInt(urlObjRec.searchParams.get("userId"));

            if (!userId) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify([])); // return empty array instead of error object
              break;
            }

            recommenderAlgorithmForUser(parseInt(userId))
              .then((recommendations) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(recommendations)); // just the list
              })
              .catch((err) => {
                console.error("Error generating recommendations:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify([])); // return empty list on error
              });

            break;
          case "recommendEvents":
            const urlObjRecEvent = new URL(
              req.url,
              `http://${req.headers.host}`
            );
            const userIdEvent = parseInt(
              urlObjRecEvent.searchParams.get("userId")
            );

            if (!userIdEvent) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify([])); // return empty array instead of error object
              break;
            }

            recommenderAlgorithmForEvents(parseInt(userIdEvent))
              .then((recommendations) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(recommendations)); // just the list
              })
              .catch((err) => {
                console.error("Error generating recommendations:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify([])); // return empty list on error
              });

            break;
          case "similarItems":
            const urlObjSimilar = new URL(
              req.url,
              `http://${req.headers.host}`
            );
            const itemId = parseInt(urlObjSimilar.searchParams.get("itemId"));

            if (!itemId) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify([])); // return empty array instead of error object
              break;
            }

            recommenderAlgorithmForItem(parseInt(itemId))
              .then((similarItems) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(similarItems)); // just the list
              })
              .catch((err) => {
                console.error("Error generating similarItems:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify([])); // return empty list on error
              });

            break;
          case "get-product":
            try {
              const productId = new URL(
                req.url,
                `http://${req.headers.host}`
              ).searchParams.get("id");
              if (!productId) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Product ID is required" }));
                return;
              }

              const product = await getProduct(productId);
              if (!product) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Product not found" }));
                return;
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(product));
            } catch (error) {
              console.error("Error fetching product:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to fetch product" }));
            }
            break;
          case "get-event":
            try {
              const eventId = new URL(
                req.url,
                `http://${req.headers.host}`
              ).searchParams.get("id");

              if (!eventId) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Event ID is required" }));
                return;
              }
              const event = await getEvent(eventId);

              if (!event) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Event not found" }));
                return;
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(event));
            } catch (error) {
              console.error("Error fetching event:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to fetch event" }));
            }
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

export { processReq };
