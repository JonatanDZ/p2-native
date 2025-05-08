export async function sendUserIdAndItemId(product){
    const userId = getUserId();

    console.log(userId, product)
}

async function getUserId(){
    // Get token from localStorage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // If no token, redirect to login page and return (run no more code)


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


        console.log(userid);
        return await data.userId;

    } catch (err) {
        // Handle fetch errors or server issues
        console.error('Error verifying token:', err);
        localStorage.removeItem("token");
        window.location.href = '/public/pages/login/login.html';
    }

}