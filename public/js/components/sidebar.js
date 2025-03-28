export function loadSidebar(){
    fetch('/public/pages/admin/components/sidebar.html')
    .then(res => res.text())
    .then(html => {
        document.querySelector(".sidebar-container").innerHTML = html;
    });
}
document.addEventListener("DOMContentLoaded", loadSidebar);
