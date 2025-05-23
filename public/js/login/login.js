const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create values for the email and password on login page and one if the "remember me" button is checked
    const email = form.email.value;
    const password = form.password.value;
    const rememberMe = form.remember.checked;

    // POST request to send login info to server
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            const { message, token } = data;
            if (rememberMe) {
                // Store token in localstorage if 'husk mig' on page is checked
                localStorage.setItem("token", token); //localstorage saves and needs to be cleared manually
            } else {
                // Store token in sessionStorage if 'husk mig' on page is not checked
                sessionStorage.setItem("token", token); //sessionstorage clears when the browser is closed
            }

            alert("Du er nu logget ind");
            window.location.href = "/public/pages/userdashboard/userdashboard.html";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Something went wrong, please try again.");
    }
});
