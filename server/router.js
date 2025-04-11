export { processReq };
import { createProduct } from "./dbserver.js";
import { fileResponse } from "./server.js";

//Process the request
function processReq(req, res) {
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
    case "GET":
      {
        //If the request is a get, split the path and print
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