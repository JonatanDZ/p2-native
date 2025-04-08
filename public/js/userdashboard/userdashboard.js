fetch("/verifyToken", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      console.log("Response status:", res.status); 
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .catch((err) => {
      console.error("Error during token verification:", err); 
      window.location.href = "/public/pages/login/login.html";
    });
  