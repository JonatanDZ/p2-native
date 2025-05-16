async function loadSidebarAndAuth() {
    try {
        // Load sidebar HTML first
        const res = await fetch('/public/pages/userdashboard/sidebarUserdashboard.html');
        const html = await res.text();
        document.getElementById("sidebar-container").innerHTML = html;

        // Get token from localtorage and return if there is no token. Stops the rest of code to run
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        // Call on verify-token which breaks down the token and can parse admin status of the user.
        const response = await fetch('/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        const data = await response.json();
        const sidebarLinks = document.getElementById('sidebar-links');
        if (!sidebarLinks) return;

        // data.isAuthenticated and data.isAdmin is parsed from verify-token. This if statement creates the button to admin page,
        // if the user is admin
        if (data.isAuthenticated && data.isAdmin) {
            const adminLink = document.createElement('li');
            adminLink.classList.add('nav-item');
            adminLink.innerHTML = `<a class="nav-link" href="/public/pages/admin/admin.html"><i class="nav-icon cil-speedometer"></i> Admin side
            </a></a>`;
            const firstItem = sidebarLinks.querySelector('li');
            // This puts the button at the top of the list
            if (firstItem && firstItem.nextSibling) {
                sidebarLinks.insertBefore(adminLink, firstItem.nextSibling);
            } else {
                sidebarLinks.appendChild(adminLink); // fallback
            }

        }

        // Create logout button
        const logoutBtn = document.getElementById('logout-link');
        // Logic if the button is clicked, it removes the token and redirects to login page
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/public/pages/login/login.html';
            });
        }

    } catch (error) {
        console.error('Error loading sidebar or verifying token:', error);
    }
}

document.addEventListener("DOMContentLoaded", loadSidebarAndAuth);
