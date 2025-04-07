const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

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
            alert("du er nu logget ind"); 
            window.location.href = "/public/pages/userdashboard/userdashboard.html";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Something went wrong, please try again.");
    }
  });

