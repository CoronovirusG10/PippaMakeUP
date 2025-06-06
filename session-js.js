// session.js - Session Management for Pippa of London

// Session configuration
const SESSION_CONFIG = {
    storageKey: 'pippa_session',
    defaultDuration: 24 * 60 * 60 * 1000, // 24 hours
    extendedDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    checkInterval: 60 * 1000 // Check every minute
};

// Session manager
class SessionManager {
    constructor() {
        this.session = null;
        this.checkInterval = null;
        this.initializeSession();
    }

    // Initialize session on page load
    initializeSession() {
        const storedSession = this.getStoredSession();
        
        if (storedSession && this.isSessionValid(storedSession)) {
            this.session = storedSession;
            this.startSessionMonitoring();
            this.updateLastActivity();
        } else {
            this.clearSession();
        }
    }

    // Get stored session from sessionStorage
    getStoredSession() {
        try {
            const sessionData = sessionStorage.getItem(SESSION_CONFIG.storageKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    }

    // Store session in sessionStorage
    storeSession(sessionData) {
        try {
            sessionStorage.setItem(SESSION_CONFIG.storageKey, JSON.stringify(sessionData));
            
            // Also store a flag in localStorage if "remember me" is checked
            if (sessionData.rememberMe) {
                localStorage.setItem('pippa_remember_session', JSON.stringify({
                    userId: sessionData.userId,
                    email: sessionData.email,
                    expiresAt: sessionData.expiresAt
                }));
            }
        } catch (error) {
            console.error('Error storing session:', error);
        }
    }

    // Check if session is valid
    isSessionValid(session) {
        if (!session || !session.userId || !session.expiresAt) {
            return false;
        }

        const now = Date.now();
        return now < session.expiresAt;
    }

    // Create new session
    createSession(user, rememberMe = false) {
        const duration = rememberMe ? SESSION_CONFIG.extendedDuration : SESSION_CONFIG.defaultDuration;
        const now = Date.now();

        this.session = {
            sessionId: crypto.randomUUID(),
            userId: user.userId,
            email: user.email,
            name: user.name,
            loginTime: now,
            lastActivity: now,
            expiresAt: now + duration,
            rememberMe: rememberMe
        };

        this.storeSession(this.session);
        this.startSessionMonitoring();

        return this.session;
    }

    // Get current session
    getCurrentSession() {
        if (this.session && this.isSessionValid(this.session)) {
            return this.session;
        }
        return null;
    }

    // Update last activity timestamp
    updateLastActivity() {
        if (this.session) {
            this.session.lastActivity = Date.now();
            this.storeSession(this.session);
        }
    }

    // Clear session
    clearSession() {
        this.session = null;
        sessionStorage.removeItem(SESSION_CONFIG.storageKey);
        localStorage.removeItem('pippa_remember_session');
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Start monitoring session validity
    startSessionMonitoring() {
        // Clear any existing interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Check session validity periodically
        this.checkInterval = setInterval(() => {
            if (!this.isSessionValid(this.session)) {
                this.handleSessionExpired();
            }
        }, SESSION_CONFIG.checkInterval);

        // Monitor user activity
        this.setupActivityMonitoring();
    }

    // Setup activity monitoring
    setupActivityMonitoring() {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        const updateActivity = debounce(() => {
            this.updateLastActivity();
        }, 5000); // Update at most every 5 seconds

        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });
    }

    // Handle expired session
    handleSessionExpired() {
        this.clearSession();
        
        // Dispatch session expired event
        window.dispatchEvent(new CustomEvent('sessionExpired'));
        
        // Show notification
        if (window.authModule && window.authModule.showToast) {
            window.authModule.showToast('Your session has expired. Please log in again.', 'warning');
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = '/auth/auth.html';
        }, 2000);
    }

    // Extend session (for remember me functionality)
    extendSession() {
        if (this.session && this.session.rememberMe) {
            const now = Date.now();
            this.session.expiresAt = now + SESSION_CONFIG.extendedDuration;
            this.storeSession(this.session);
        }
    }

    // Get session info
    getSessionInfo() {
        if (!this.session) return null;

        const now = Date.now();
        const timeRemaining = Math.max(0, this.session.expiresAt - now);
        const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
        const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));

        return {
            isActive: this.isSessionValid(this.session),
            userId: this.session.userId,
            email: this.session.email,
            loginTime: new Date(this.session.loginTime),
            lastActivity: new Date(this.session.lastActivity),
            expiresAt: new Date(this.session.expiresAt),
            timeRemaining: timeRemaining,
            displayTime: hoursRemaining > 0 ? `${hoursRemaining} hours` : `${minutesRemaining} minutes`,
            rememberMe: this.session.rememberMe
        };
    }
}

// Initialize session manager
const sessionManager = new SessionManager();

// Global session functions
function createSession(user, rememberMe = false) {
    return sessionManager.createSession(user, rememberMe);
}

function getCurrentUser() {
    const session = sessionManager.getCurrentSession();
    if (!session) return null;

    // Get full user data from localStorage
    const users = localStorage.getItem('pippa_users');
    if (!users) return null;

    const userList = JSON.parse(users);
    return userList.find(u => u.userId === session.userId) || null;
}

function logoutUser() {
    // Clear session
    sessionManager.clearSession();
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Redirect to login
    window.location.href = '/auth/auth.html';
}

function updateProfile(updates) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    // Update user data
    const users = JSON.parse(localStorage.getItem('pippa_users') || '[]');
    const userIndex = users.findIndex(u => u.userId === currentUser.userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('pippa_users', JSON.stringify(users));
        
        // Update session if email changed
        if (updates.email) {
            const session = sessionManager.getCurrentSession();
            if (session) {
                session.email = updates.email;
                sessionManager.storeSession(session);
            }
        }
        
        return true;
    }
    
    return false;
}

function resetPassword(email) {
    // This is a simplified version for the prototype
    // In a real app, this would send an email
    const users = JSON.parse(localStorage.getItem('pippa_users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        return {
            success: true,
            message: 'Password reset code: DEMO123',
            resetCode: 'DEMO123'
        };
    }
    
    return {
        success: false,
        message: 'No account found with this email address'
    };
}

// Auto-logout on window close if remember me is not checked
window.addEventListener('beforeunload', () => {
    const session = sessionManager.getCurrentSession();
    if (session && !session.rememberMe) {
        sessionManager.clearSession();
    }
});

// Check for remembered session on page load
window.addEventListener('DOMContentLoaded', () => {
    const rememberedSession = localStorage.getItem('pippa_remember_session');
    if (rememberedSession && !sessionManager.getCurrentSession()) {
        try {
            const sessionData = JSON.parse(rememberedSession);
            if (sessionManager.isSessionValid(sessionData)) {
                // Restore session from remembered data
                const users = JSON.parse(localStorage.getItem('pippa_users') || '[]');
                const user = users.find(u => u.userId === sessionData.userId);
                if (user) {
                    sessionManager.createSession(user, true);
                }
            } else {
                // Clear expired remembered session
                localStorage.removeItem('pippa_remember_session');
            }
        } catch (error) {
            console.error('Error restoring remembered session:', error);
            localStorage.removeItem('pippa_remember_session');
        }
    }
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export session manager and functions
window.sessionManager = sessionManager;
window.sessionFunctions = {
    createSession,
    getCurrentUser,
    logoutUser,
    updateProfile,
    resetPassword
};