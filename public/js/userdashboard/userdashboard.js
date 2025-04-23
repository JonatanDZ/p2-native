window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
      console.log("Token found");
  } else {
      console.log("No token found.");
      window.location.href = "/public/pages/login/login.html";
  }
});