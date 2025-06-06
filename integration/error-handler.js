// integration/error-handler.js - Global error handling utilities

import { eventBus } from './event-handler.js';

export class ErrorHandler {
    static handleAuthError(message) {
        this.notify(message || 'Authentication required', 'error');
    }

    static handleMediaError(message) {
        this.notify(message || 'Camera access error', 'error');
    }

    static handleAnalysisError(message) {
        this.notify(message || 'Analysis failed', 'error');
    }

    static handleNetworkError(message) {
        this.notify(message || 'Network issue', 'warning');
    }

    static handleGenericError(message) {
        this.notify(message || 'Something went wrong', 'error');
    }

    static notify(message, type='info') {
        eventBus.emit('notification', { message, type });
    }
}
