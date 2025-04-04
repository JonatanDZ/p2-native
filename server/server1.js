const http = require("http");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

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
    console.log("✅ Connected to MySQL");
});

// Create server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific HTTP methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
        res.writeHead(204); // No content response
        return res.end();
    }

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
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
