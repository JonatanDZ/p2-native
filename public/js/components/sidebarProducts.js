async function loadSidebar(){
    await fetch('/public/pages/products/sidebarProducts.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;

    });
}
document.addEventListener("DOMContentLoaded", loadSidebar);