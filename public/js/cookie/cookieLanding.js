function makeCookie(cookieName, value, expire) {
    const date = new Date();
    date.setTime(date.getTime() + expire * 24 * 60 * 60 * 1000);
    let expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + value + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
    // gør det nemmer at søge efter landigVisited navnet. 
    let name = cookieName + "=";
    // decode gør URL encoded tegn læselige fx %20. ellers blive cookien hentet ned. 
    let decodedCookie = decodeURIComponent(document.cookie);
    // vi splitter alle evt cookie up. 
    let cookieArray = decodedCookie.split(";");

    // vi kører igennem alle cookies indtil vi finder den rigtige
    for (let i = 0; i < cookieArray.length; i++) {
        // vores cookie array er nu cookie. 
        let cookie = cookieArray[i].trim();
        // vi tjekker her om det er landingvisited vi kigger på. så vi tjekker om 
        // landingvisited er det første ord. 
        if (cookie.indexOf(name) === 0) {
            // substring fjerner det fra 0-name.lenght og derfra fra cookie.length til slut
            // derfor gemme den tallet efter = , og ikke andet. 
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
    } else if (cookie === "2") {
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