var http = require("http");
var fs = require("fs");

var htmlFile;
var cssFile;

fs.readFile("./public/pages/landing/landing.html", function (err, data) {
  if (err) {
    throw err;
  }
  htmlFile = data;
});

fs.readFile("./public/css/global.css", function (err, data) {
  if (err) {
    throw err;
  }
  cssFile = data;
});

var server = http
  .createServer(function (request, response) {
    switch (request.url) {
      case "/public/css/global.css":
        response.writeHead(200, { "Content-Type": "text/css" });
        response.write(cssFile);
        break;
      default:
        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(htmlFile);
    }
    response.end();
  })
  .listen(3000);

/*http
  .createServer((req, res) => {
    console.log(req.url);
    
    switch (req.url) {
      case "/public/css/global.css":
        fs.readFile("public/css/global.css", (err, css) => {
          if (err) {
            throw err;
          }
          res.setHeader("Content-type", "text/css");
          res.write(css);
          res.statusCode = 200;
          res.end();
        });
      default:
        fs.readFile("public/pages/landing/landing.html", (err, html) => {
          if (err) {
            throw err;
          }
          res.setHeader("Content-type", "text/html");
          res.write(html);
          res.statusCode = 200;
          res.end();
        });
    }
  })
  .listen(3000);*/

//Setup video: https://www.youtube.com/watch?v=qq0abPSi4F8
