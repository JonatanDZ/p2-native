const http = require("http");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//get secret key from env file (for jwt)
const SECRET_KEY = process.env.SECRET_KEY;


// Create database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

// Create server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); 
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); 

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }
    //gets posts from signup page
    if (req.method === "POST" && req.url === "/signup") {
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
                res.end(JSON.stringify({ error: "Internal server error" }));
            }
        });
    //gets posts from login page
    } else if (req.method === "POST" && req.url === "/login") {
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
                    const isMatch = await bcrypt.compare(password, users_table.password);
    
                    if (isMatch) {
                        //create token for successfully logged in
                        const token = jwt.sign({ email: users_table.email }, SECRET_KEY, { expiresIn: "1h" });

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
     else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
