var http = require("http");
var fs = require("fs");

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    var readStream = fs.createReadStream("public/pages/index.html");
    readStream.pipe(res);
  })
  .listen(3000);

//Setup video: https://www.youtube.com/watch?v=qq0abPSi4F8
