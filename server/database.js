const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 📌 Ensure correct routing to your HTML pages
app.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'pages', 'login', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'pages', 'login', 'login.html'));
});

// Create MySQL connection
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "StrongP@ssw0rd!",
    database: "myDB",
    port: 3306,
    connectTimeout: 10000
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL database');
    }
});

// Updated Register API
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err); // Log error if hashing fails
            return res.status(500).json({ message: 'Error hashing password' });
        }

        const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(query, [email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error executing query:', err); // Log SQL query error
                return res.status(500).json({ message: 'Error registering user' });
            }

            console.log('User registered successfully:', result); // Log the result of the query

            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Updated Login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error logging in' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

            const token = jwt.sign({ id: user.id, email: user.email }, 'secretkey', { expiresIn: '1h' });

            res.status(200).json({ message: 'Login successful', token });
        });
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
