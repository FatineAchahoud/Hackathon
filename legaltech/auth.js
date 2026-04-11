// auth.js - Authentication Helper Functions
// Note: This is a mock implementation. In production, integrate with Firebase Authentication.

// Mock user storage
let currentUser = null;
const users = new Map();

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (client or advocate)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function register(email, password, role) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Validation
            if (!email || !password || !role) {
                resolve({ success: false, error: 'Missing required fields' });
                return;
            }

            if (users.has(email)) {
                resolve({ success: false, error: 'Email already registered' });
                return;
            }

            if (password.length < 8) {
                resolve({ success: false, error: 'Password must be at least 8 characters' });
                return;
            }

            // Create user
            const user = {
                uid: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                role: role,
                createdAt: new Date().toISOString(),
                password: btoa(password) // Simple base64 encoding (DO NOT USE IN PRODUCTION)
            };

            users.set(email, user);
            localStorage.setItem('users', JSON.stringify(Array.from(users.entries())));
            
            resolve({ success: true });
        }, 500);
    });
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - Expected user role
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function login(email, password, role) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!users.has(email)) {
                resolve({ success: false, error: 'Invalid email or password' });
                return;
            }

            const user = users.get(email);
            
            if (btoa(password) !== user.password) {
                resolve({ success: false, error: 'Invalid email or password' });
                return;
            }

            if (user.role !== role) {
                resolve({ success: false, error: 'Wrong account type selected' });
                return;
            }

            currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('userId', user.uid);
            
            resolve({ success: true });
        }, 500);
    });
}

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>}
 */
async function getCurrentUser() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Try to get from sessionStorage first
            const stored = sessionStorage.getItem('currentUser');
            if (stored) {
                try {
                    currentUser = JSON.parse(stored);
                    resolve(currentUser);
                } catch (e) {
                    resolve(null);
                }
            } else {
                resolve(currentUser);
            }
        }, 100);
    });
}

/**
 * Logout current user
 * @returns {Promise<{success: boolean}>}
 */
async function logout() {
    return new Promise((resolve) => {
        setTimeout(() => {
            currentUser = null;
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('userId');
            resolve({ success: true });
        }, 300);
    });
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null && user !== undefined;
}

// Initialize users from localStorage on page load
function initAuth() {
    try {
        const stored = localStorage.getItem('users');
        if (stored) {
            const entries = JSON.parse(stored);
            entries.forEach(([key, value]) => users.set(key, value));
        }
    } catch (e) {
        console.error('Error initializing auth:', e);
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
