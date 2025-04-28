window.addEventListener('DOMContentLoaded', (event) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log('No token found. Redirecting to login.');
        window.location.href = '/public/pages/login/login.html';
        return;
    }

    console.log('Token found. Verifying...');

    fetch('/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            if (data.isAdmin) {
                console.log('User is authenticated and an admin.');
            } else {
                console.log('User is authenticated but not an admin.');

                if (!window.location.pathname.includes('/public/pages/userdashboard/userdashboard.html')) {
                    window.location.href = '/public/pages/userdashboard/userdashboard.html';
                }
            }
        } else {
            console.log('User is not authenticated. Clearing token and redirecting...');
            localStorage.removeItem("token");
            window.location.href = '/public/pages/login/login.html';
        }
    })
    .catch(err => {
        console.error('Error verifying token:', err);
        localStorage.removeItem("token");
        window.location.href = '/public/pages/login/login.html';
    });
});
