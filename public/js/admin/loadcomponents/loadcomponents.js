import { loadFooter } from "../../components/footer.js";
import { loadNavbar } from "../../components/navbar.js";
import { loadSidebar } from "../../components/sidebar.js";

console.log("Component script loaded");

export function loadComponents() {
    loadSidebar();
    loadFooter();
    loadNavbar();
}
document.addEventListener("DOMContentLoaded", loadComponents);
