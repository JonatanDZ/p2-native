window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
  
    fetch("/verifyToken", { 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/public/pages/login/login.html";
        }
      })
      .catch(() => {
        window.location.href = "/public/pages/login/login.html";
      });
  });
  