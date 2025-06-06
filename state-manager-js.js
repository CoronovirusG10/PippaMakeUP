// Pippa of London - Basic State Management for Media Module
// This is a simplified version - full implementation would be in Module 7

// Global application state
window.AppState = {
    user: {
        isAuthenticated: false,
        profile: null,
        preferences: null
    },
    media: {
        currentImage: null,
        analysisHistory: []
    },
    analysis: {
        currentResults: null,
        isProcessing: false,
        confidence: null
    },
    products: {
        catalog: null,
        favorites: [],
        cart: []
    },
    ui: {
        currentPage: 'capture',
        isLoading: false,
        notifications: []
    }
};

// State management functions
const StateManager = {
    // Get current state
    getState() {
        return window.AppState;
    },
    
    // Update state
    setState(updates) {
        window.AppState = {
            ...window.AppState,
            ...updates
        };
        this.notifyListeners();
    },
    
    // Update nested state
    updateNestedState(path, value) {
        const keys = path.split('.');
        let current = window.AppState;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.notifyListeners();
    },
    
    // State change listeners
    listeners: [],
    
    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },
    
    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(window.AppState));
    },
    
    // Initialize state from localStorage
    initializeState() {
        // Check for saved user session
        const savedSession = localStorage.getItem('pippa_user_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                window.AppState.user = session;
            } catch (e) {
                console.error('Failed to parse saved session:', e);
            }
        }
        
        // Load media history
        const mediaHistory = localStorage.getItem('pippa_media_captures');
        if (mediaHistory) {
            try {
                window.AppState.media.analysisHistory = JSON.parse(mediaHistory);
            } catch (e) {
                console.error('Failed to parse media history:', e);
            }
        }
    },
    
    // Save state to localStorage
    persistState() {
        // Save user session
        if (window.AppState.user.isAuthenticated) {
            localStorage.setItem('pippa_user_session', JSON.stringify(window.AppState.user));
        }
        
        // Media history is already saved by media-utils.js
    },
    
    // Clear all state
    clearState() {
        window.AppState = {
            user: {
                isAuthenticated: false,
                profile: null,
                preferences: null
            },
            media: {
                currentImage: null,
                analysisHistory: []
            },
            analysis: {
                currentResults: null,
                isProcessing: false,
                confidence: null
            },
            products: {
                catalog: null,
                favorites: [],
                cart: []
            },
            ui: {
                currentPage: 'home',
                isLoading: false,
                notifications: []
            }
        };
        
        // Clear localStorage
        localStorage.removeItem('pippa_user_session');
        localStorage.removeItem('pippa_media_captures');
        
        this.notifyListeners();
    }
};

// Initialize state on load
document.addEventListener('DOMContentLoaded', () => {
    StateManager.initializeState();
});

// Save state before unload
window.addEventListener('beforeunload', () => {
    StateManager.persistState();
});

// Export for use in other modules
window.StateManager = StateManager;