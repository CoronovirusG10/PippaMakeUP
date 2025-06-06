// integration/app.js - Main application controller

import { initRouter, navigate } from './router.js';
import { eventBus } from './event-handler.js';
import { ModuleAPI } from './module-api.js';
import { StateManager } from './state-manager.js';
import { ErrorHandler } from './error-handler.js';

function initNavigation() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a[data-route]');
        if (link) {
            e.preventDefault();
            const path = link.getAttribute('href');
            navigate(path);
        }
    });
}

function initNotifications() {
    eventBus.on('notification', ({ message, type }) => {
        const div = document.createElement('div');
        div.className = `toast ${type}`;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    });
}

export function initApp() {
    StateManager.load();
    initRouter();
    initNavigation();
    initNotifications();

    // Example event binding: capturing from media module
    eventBus.on('media:captureError', msg => ErrorHandler.handleMediaError(msg));
}

document.addEventListener('DOMContentLoaded', initApp);
