document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) return;

    try {
        const response = await fetch('/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        const sidebarLinks = document.getElementById('sidebar-links');

        if (!sidebarLinks) return; // Safety check

        if (data.isAuthenticated && data.isAdmin) {
            const adminLink = document.createElement('li');
            adminLink.classList.add('nav-item');
            adminLink.innerHTML = `<a class="nav-link" href="/public/pages/admin/admin.html">Admin side</a>`;
            sidebarLinks.prepend(adminLink);
        }

        const logoutLink = document.createElement('li');

        logoutLink.innerHTML = `<a class="nav-link text-danger" href="#" id="logout-link">Log ud</a>`;
        sidebarLinks.appendChild(logoutLink);

        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token'); // Delete token
            window.location.href = '/public/pages/login/login.html'; // Redirect to login
        });

    } catch (error) {
        console.error('Error checking admin status:', error);
    }
});