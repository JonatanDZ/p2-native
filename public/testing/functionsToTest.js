export async function authenticateToken() {
    // Get token from localStorage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // If no token, redirect to login page and return (run no more code)
    if (!token) {
        console.log('No token found. Redirecting to login.');
        window.location.href = '/public/pages/login/login.html';
        return;
    }

    // If token found
    console.log('Token found');

    try {
        // Send POST request to server to verify authentication and admin status
        const response = await fetch('/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
        });

        const data = await response.json();

        if (data.isAuthenticated) {
            if (data.isAdmin) {
                // User is admin and can stay on admin page or wherever they are
                console.log('User is authenticated and an admin.');
            } else {
                // User is authenticated but NOT admin - redirected to user dashboard
                console.log('User is authenticated but not an admin.');

                // To avoid loop, only redirect to user dashboard if the user is NOT already there
                if (!window.location.pathname.includes('/public/pages/userdashboard/userdashboard.html')) {
                    window.location.href = '/public/pages/userdashboard/userdashboard.html';
                }
            }
        } else {
            // Invalid token, clear it and redirect to login page
            console.log('User is not authenticated. Clearing token and redirecting...');
            localStorage.removeItem("token");
            window.location.href = '/public/pages/login/login.html';
        }
    } catch (err) {
        // Handle fetch errors or server issues
        console.error('Error verifying token:', err);
        localStorage.removeItem("token");
        window.location.href = '/public/pages/login/login.html';
    }
};


