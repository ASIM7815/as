// Google Sign-In Configuration
const CLIENT_ID = '104517837705-tsgs4at9fqm2h30jghh78209tanh28jk.apps.googleusercontent.com';
const TOKEN_KEY = 'googleAuthToken';
const USER_KEY = 'googleAuthUser';

// Check if user is already authenticated
function checkAuthStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    
    if (token && user) {
        // User is already logged in, redirect to index.html
        window.location.href = 'index.html';
    }
}

// Handle credential response from Google Sign-In
function handleCredentialResponse(response) {
    // Show loading spinner
    document.getElementById('loading').style.display = 'block';
    
    if (response.credential) {
        try {
            // Decode JWT token to get user information
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            
            const userData = JSON.parse(jsonPayload);
            
            // Store authentication data
            localStorage.setItem(TOKEN_KEY, response.credential);
            localStorage.setItem(USER_KEY, JSON.stringify({
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                sub: userData.sub
            }));
            
            console.log('User logged in:', userData.email);
            
            // Redirect to index.html after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } catch (error) {
            console.error('Error processing credential:', error);
            document.getElementById('loading').style.display = 'none';
            alert('Authentication error. Please try again.');
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Sign out from Google
    google.accounts.id.disableAutoSelect();
    
    window.location.href = 'login.html';
}

// Get current user info
function getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only check on login.html and pages that aren't index.html
    if (window.location.pathname.endsWith('login.html') || 
        window.location.pathname === '/' ||
        window.location.pathname.includes('index.html')) {
        checkAuthStatus();
    }
});

// Protect authenticated pages
function protectPage() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    
    if (!token || !user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Add logout button to pages
function addLogoutButton() {
    const user = getCurrentUser();
    if (user) {
        const logoutBtn = document.createElement('button');
        logoutBtn.innerHTML = `Logout (${user.email})`;
        logoutBtn.className = 'logout-btn';
        logoutBtn.onclick = logout;
        logoutBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;';
        document.body.appendChild(logoutBtn);
    }
}
