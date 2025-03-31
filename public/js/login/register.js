document.getElementById("signup").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if(password != confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    alert("Du er nu registreret og kan logge ind");
    
    window.location.href ="/public/pages/login/login.html";
})

//udkast til at gemme email og password i mySQL
/*
const bcrypt = require('bcrypt');
const saltRounds = 10;


function addUser(data) {
    //hashing password
    const passwordhashed = bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) throw err;
        })
    })

    let query = mysql.format(insertQuery, ["email", "password", data.email, data.passwordhashed]);
    Pool.query(query, (err, response) => {
        if (err) {
            console.log(err);
            return
        }
        console.log(response, insertId);
    })
} 

setTimeout(() => {
    addUser({
        "email": data.email,
        "password": data.passwordhashed
    })
})
    */