let city;

function makeCookie(cookieName, value, expire) {
  const date = new Date();
  date.setTime(date.getTime() + expire * 24 * 60 * 60 * 1000);
  let expires = "expires=" + date.toUTCString();
  document.cookie = cookieName + "=" + value + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

function checkCookie(cookieName) {
  let cookie = getCookie(cookieName);
  console.log(cookie);
  if (cookie === "1") {
    window.location.href = "/public/pages/index.html";
  } else if (cookie === "2"){
    window.location.href = "/public/pages/index.html";
  } else if (cookie === "3") {
    window.location.href = "/public/pages/index.html";
  } else {
    console.log("Fejl i cookie");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("isClickedCookieAalborg")
    .addEventListener("click", function () {
      makeCookie("landingVisited", 1, 30);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("isClickedCookieAarhus")
    .addEventListener("click", function () {
      makeCookie("landingVisited", 2, 30);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("isClickedCookieKoebenhavn")
    .addEventListener("click", function () {
      makeCookie("landingVisited", 3, 30);
    });
});