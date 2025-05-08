async function loadSidebar(){
    await fetch('/public/pages/events/sidebarEvents.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;

    });
}
document.addEventListener("DOMContentLoaded", loadSidebar);