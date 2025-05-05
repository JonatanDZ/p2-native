document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // If no token return (not running the rest of the code)
    if (!token) return;


    try {
        // Send a POST request to verify-token (happens in router.js)
        const response = await fetch('/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        // Parsing JSON response
        const data = await response.json();

        const sidebarLinks = document.getElementById('sidebar-links');

        if (!sidebarLinks) return; // Safety check

        // Checks if the user is authenticated AND admin, and shows the admin button (gets it from verify-token)
        if (data.isAuthenticated && data.isAdmin) {
            const adminLink = document.createElement('li');
            adminLink.classList.add('nav-item');
            adminLink.innerHTML = `<a class="nav-link" href="/public/pages/admin/admin.html">Admin side</a>`;
            sidebarLinks.prepend(adminLink);
        }

        // Creating and adding logout link
        const logoutLink = document.createElement('li');

        logoutLink.innerHTML = `<a class="nav-link text-danger" href="#" id="logout-link">Log ud</a>`;
        sidebarLinks.appendChild(logoutLink);

        // When logout link is clicked it removes token from localStorage
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token'); // Delete token
            window.location.href = '/public/pages/login/login.html'; // Redirect to login
        });

    } catch (error) {
        console.error('Error checking admin status:', error);
    }
});