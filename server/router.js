export { processReq };
import { createProduct } from "./dbserver.js";
import { fileResponse } from "./server.js";

//Import stripe and dotenv
import Stripe from "stripe";
import dotenv from "dotenv";

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
  //  POST logic is from BMI app
  switch (req.method) {
    case "POST": {
      let pathElements=queryPath.split("/"); 
       switch(pathElements[1]){
        case "save-products": //just to be nice. So, given that the url after "/" is save-products, it does the following:
          extractJSON(req)
          //  When converted to JSON it loops through every object and saves it to DB via the createProduct helper function. 
          .then(productData => {
              productData.forEach(product => {
                createProduct(product.name, product.price, product.amount, product.filters);
              });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Products saved successfully." }));
          })
          .catch(err=>reportError(res,err));
          break;  
        default: 
          console.error("Resource doesn't exist");
          reportError(res, new Error("there was an error")); 
        }
      } 
      break; //END POST URL
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

function extractJSON(req){
  if(isJsonEncoded(req.headers['content-type']))
   return collectPostBody(req).then(body=> {
     let x= JSON.parse(body);
     //console.log(x);
     return x;
  });
  else
    return Promise.reject(new Error(ValidationError)); //create a rejected promise
}
function isJsonEncoded(contentType){
  //Format 
  //Content-Type: application/json; encoding
  let ctType=contentType.split(";")[0];
  ctType=ctType.trim();
  return (ctType==="application/json"); 
//would be more robust to use the content-type module and  contentType.parse(..)
}
function collectPostBody(req){
  //the "executor" function
 function collectPostBodyExecutor(resolve,reject){
    let bodyData = [];
    let length=0;
    req.on('data', (chunk) => {
      bodyData.push(chunk);
      length+=chunk.length; 
 
      if(length>10000000) { //10 MB limit!
        req.connection.destroy(); //we would need the response object to send an error code
        reject(new Error(MessageTooLongError));
      }
    }).on('end', () => {
    bodyData = Buffer.concat(bodyData).toString(); //By default, Buffers use UTF8
    console.log(bodyData);
    resolve(bodyData); 
    });
    //Exceptions raised will reject the promise
  }
  return new Promise(collectPostBodyExecutor);
}