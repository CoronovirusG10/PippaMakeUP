// integration/state-manager.js - Global state management for Pippa of London

export const AppState = {
    user: {
        isAuthenticated: false,
        profile: null,
        sessionId: null
    },
    currentMedia: {
        imageData: null,
        analysisResults: null,
        timestamp: null
    },
    navigation: {
        currentPage: 'home',
        previousPage: null,
        userJourneyStep: 1
    },
    products: {
        favorites: [],
        recentlyViewed: [],
        searchHistory: []
    },
    ui: {
        isLoading: false,
        notifications: [],
        errors: []
    }
};

export const StateManager = {
    getState() {
        return AppState;
    },
    update(path, value) {
        const keys = path.split('.');
        let obj = AppState;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
            if (!obj) return;
        }
        obj[keys[keys.length - 1]] = value;
        this.persist();
    },
    persist() {
        try {
            localStorage.setItem('pippa_app_state', JSON.stringify(AppState));
        } catch (e) {
            console.warn('State persistence failed:', e);
        }
    },
    load() {
        const saved = localStorage.getItem('pippa_app_state');
        if (saved) {
            try {
                const obj = JSON.parse(saved);
                Object.assign(AppState, obj);
            } catch (e) {
                console.error('Failed to parse saved state', e);
            }
        }
    },
    clear() {
        localStorage.removeItem('pippa_app_state');
    }
};

StateManager.load();
