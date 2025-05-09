/**
 * @jest-environment jsdom
 */

'use strict';

global.fetch = jest.fn();

//restores the mock data after each test
beforeEach(() => {
    fetch.mockReset();
    localStorage.clear();
    sessionStorage.clear();

    Object.defineProperty(window, 'location', {
        writable: true,
        value: {
            href: '',
            pathname: '/public/pages/admin/admin.html'
        }
    });
});
// Test authenticateToken
const { authenticateToken } = require('./functionsToTest');

test('redirects to login if no token is found', async () => {
    await authenticateToken();
    /* since "beforeEach" clears local and sesstion storage and we dont declare a token, it is simulated that there is no token
    therefore we expect the window location to redirect to login.html as that is what the function should do */
    expect(window.location.href).toBe('/public/pages/login/login.html');
});

test('redirects to user dashboard if authenticated but not admin', async () => {
     /* we need to mock a token in localStorage for it to reach our fetch
    otherwise the authenticateToken has the if(!token) which will run if there is no mocked token */
    localStorage.setItem('token', 'valid-token');
    // here we mock that the token isAuthenticated but isAdmin is false
    fetch.mockResolvedValueOnce({
        json: async () => ({
            isAuthenticated: true,
            isAdmin: false
        })
    });
    await authenticateToken();
    //with a token that is authenticated but not admin, we need it to redirect the user to userdashboard
    expect(window.location.href).toBe('/public/pages/userdashboard/userdashboard.html');
});

test('clears token and redirects if not authenticated', async () => {
    /* we need to mock a token that is invalid in localStorage for it to reach our fetch
    otherwise the authenticateToken has the if(!token) which will run if there is no mocked token */
    localStorage.setItem('token', 'invalid-token');
    // here we mock that the token isAuthenticated but isAdmin is false
    fetch.mockResolvedValueOnce({
        json: async () => ({
            isAuthenticated: false
        })
    });
    await authenticateToken();
    //with a token that is not authenticated, we expect our function to redirect to login
    expect(window.location.href).toBe('/public/pages/login/login.html');
});

