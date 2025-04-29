const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;
    const rememberMe = form.remember.checked;

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
                localStorage.setItem("token", token); //localstorage saves and needs to be cleared manually
            } else {
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
