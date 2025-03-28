export function loadFooter() {
    fetch("/public/components/footer.html")
        .then(response => response.text())
        .then(html => {
            document.querySelector(".footer").innerHTML = html;
        })
        .catch(error => console.error("Error loading navbar:", error));
}

document.addEventListener("DOMContentLoaded", loadFooter);