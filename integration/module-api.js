// integration/module-api.js - Inter-module communication

import { eventBus } from './event-handler.js';
import { navigate } from './router.js';
import { StateManager, AppState } from './state-manager.js';

export const ModuleAPI = {
    // Authentication
    loginUser(credentials) {
        eventBus.emit('auth:login', credentials);
    },
    getUserSession() {
        return AppState.user;
    },
    logoutUser() {
        StateManager.update('user', { isAuthenticated: false, profile: null, sessionId: null });
        eventBus.emit('auth:logout');
        navigate('/');
    },

    // Media capture
    captureComplete(mediaData) {
        StateManager.update('currentMedia', { imageData: mediaData, timestamp: Date.now() });
        eventBus.emit('media:captured', mediaData);
        navigate('/analyze');
    },

    // Analysis
    analysisComplete(results) {
        StateManager.update('currentMedia.analysisResults', results);
        eventBus.emit('analysis:complete', results);
        navigate('/results');
    },

    findProductMatches(skinTone) {
        eventBus.emit('products:findMatches', skinTone);
    },

    // Results
    saveToFavorites(productId) {
        const favs = AppState.products.favorites;
        if (!favs.includes(productId)) {
            favs.push(productId);
            StateManager.persist();
        }
        eventBus.emit('favorites:updated', favs);
    },

    shareResults(platform) {
        eventBus.emit('results:share', { platform });
    }
};
