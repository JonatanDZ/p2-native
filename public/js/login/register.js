    document.getElementById("signup").addEventListener("submit", async function(e) {
    e.preventDefault();

    // create values for name, email, password and confirmpassword which comes from the html
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    // POST request to send signup data to server, name, email and password
    try {
        const response = await fetch("http://localhost:3000/signup", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        let result = {};
        // Attempt to parse JSON response
        try {
            const text = await response.text();
            result = text.trim() ? JSON.parse(text) : {};
        } catch (err) {
            console.error("Failed to parse JSON:", err);
        }

        if (response.ok) {
            // Signup succes then tells user and redirect to login
            alert("Du er nu registreret og kan logge ind!");
            window.location.href = "/public/pages/login/login.html";
        } else {
            alert(result.error || "Something went wrong. Try again.");
        }

    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong. Try again.");
    }
});
