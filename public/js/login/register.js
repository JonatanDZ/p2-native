document.getElementById("signup").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/signup", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        let result = {};
        try {
            const text = await response.text();
            result = text ? JSON.parse(text) : {};
        } catch (err) {
            console.error("Failed to parse JSON:", err);
        }

        if (response.ok) {
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
