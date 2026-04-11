// auth.js - Authentication Helper Functions
// Note: This is a mock implementation. In production, integrate with Firebase Authentication.

let currentUser = null;
const users = new Map();
const USERS_STORAGE_KEY = 'users';

const DEMO_USERS = [
    {
        uid: 'client_demo_1',
        email: 'client.demo@legaltech.ma',
        role: 'client',
        createdAt: '2026-04-01T09:00:00.000Z',
        password: btoa('ClientDemo123')
    },
    {
        uid: 'lawyer_demo_1',
        email: 'lawyer.demo@legaltech.ma',
        role: 'lawyer',
        createdAt: '2026-04-01T09:15:00.000Z',
        password: btoa('LawyerDemo123')
    }
];

function normalizeRole(role) {
    if (role === 'advocate') {
        return 'lawyer';
    }
    return role;
}

function persistUsers() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(Array.from(users.entries())));
}

function getPublicUser(user) {
    return {
        uid: user.uid,
        email: user.email,
        role: normalizeRole(user.role),
        createdAt: user.createdAt
    };
}

function seedDemoUsersIfNeeded() {
    let changed = false;
    DEMO_USERS.forEach((user) => {
        const key = user.email.toLowerCase();
        const existing = users.get(key);

        // Keep demo credentials consistent across sessions and stale localStorage states.
        if (!existing || existing.uid !== user.uid || existing.password !== user.password || normalizeRole(existing.role) !== normalizeRole(user.role)) {
            users.set(key, { ...user });
            changed = true;
        }
    });

    if (changed) {
        persistUsers();
    }
}

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
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const normalizedRole = normalizeRole(role);

            // Validation
            if (!normalizedEmail || !password || !normalizedRole) {
                resolve({ success: false, error: 'Missing required fields' });
                return;
            }

            if (users.has(normalizedEmail)) {
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
                email: normalizedEmail,
                role: normalizedRole,
                createdAt: new Date().toISOString(),
                password: btoa(password) // Simple base64 encoding (DO NOT USE IN PRODUCTION)
            };

            users.set(normalizedEmail, user);
            persistUsers();
            
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
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const normalizedRole = normalizeRole(role);

            if (!users.has(normalizedEmail)) {
                resolve({ success: false, error: 'Invalid email or password' });
                return;
            }

            const user = users.get(normalizedEmail);
            
            if (btoa(password) !== user.password) {
                resolve({ success: false, error: 'Invalid email or password' });
                return;
            }

            if (normalizeRole(user.role) !== normalizedRole) {
                resolve({ success: false, error: 'Wrong account type selected' });
                return;
            }

            currentUser = getPublicUser(user);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            sessionStorage.setItem('userId', currentUser.uid);
            
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
                    const parsed = JSON.parse(stored);
                    currentUser = {
                        ...parsed,
                        role: normalizeRole(parsed.role)
                    };
                    resolve(currentUser);
                } catch (e) {
                    currentUser = null;
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
    return Boolean(user && user.uid);
}

function getDemoCredentials() {
    return [
        { email: 'client.demo@legaltech.ma', password: 'ClientDemo123', role: 'client' },
        { email: 'lawyer.demo@legaltech.ma', password: 'LawyerDemo123', role: 'lawyer' }
    ];
}

// Initialize users from localStorage on page load
function initAuth() {
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) {
            const entries = JSON.parse(stored);
            entries.forEach(([key, value]) => {
                const normalizedKey = String(key).toLowerCase();
                users.set(normalizedKey, {
                    ...value,
                    email: String(value.email || normalizedKey).toLowerCase(),
                    role: normalizeRole(value.role)
                });
            });
        }

        seedDemoUsersIfNeeded();
        persistUsers();

        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            currentUser = {
                ...parsed,
                role: normalizeRole(parsed.role)
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } catch (e) {
        console.error('Error initializing auth:', e);
        users.clear();
        seedDemoUsersIfNeeded();
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
