const formlogin = document.getElementById('loginForm');
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/'; // Or redirect to the desired page
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

const formregister = document.getElementById('registerForm');
formregister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const responseMessage = document.getElementById('responseMessage');

    // Clear previous messages
    responseMessage.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Send email and password
        });

        const data = await response.json();
        responseMessage.textContent = data.message;

        // Reset form if successful
        if (response.status === 201) {
            formregister.reset();
        }
    } catch (error) {
        console.error('Error:', error);
        responseMessage.textContent = 'Error registering user';
    }
});


const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Change this in production!

// 🔹 Register a new user
function registerUser(username, password, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);

        const query = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(query, [username, hash], (error, results) => {
            if (error) return callback(error);
            callback(null, { message: "User registered successfully" });
        });
    });
}

// 🔹 Login a user
function loginUser(username, password, callback) {
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (error, results) => {
        if (error) return callback(error);
        if (results.length === 0) return callback({ message: "User not found" });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback({ message: "Invalid password" });

            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
            callback(null, { message: "Login successful", token });
        });
    });
}

module.exports = { registerUser, loginUser };