// Function to get a cookie value
function getCookie(name) {
    let cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [key, value] = cookie.split('=');
        if (key === name) return value;
    }
    return null;
}

// Function to check and redirect if the cookie exists
function onLoadCheckForLandingPageVisited() {
    if (getCookie("landingPageVisited") === "1") {
        console.log("Landing page already visited, redirecting...");
        window.location.href = "/public/pages/index.html";
    }
}

// Function to set cookie when clicking the link
function setLandingPageCookie() {
    document.cookie = "landingPageVisited=1; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
    console.log("Cookie set to 1:", document.cookie);
}

// Wait for DOM to be ready before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    let linkElement = document.getElementById("isClickedCookie");
    if (linkElement) {
        linkElement.addEventListener("click", setLandingPageCookie);
    }

    // Check if the user should be redirected on page load
    onLoadCheckForLandingPageVisited();
});
