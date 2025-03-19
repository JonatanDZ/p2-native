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