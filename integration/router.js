// integration/router.js - Simple client-side router

import { AppState, StateManager } from './state-manager.js';
import { eventBus } from './event-handler.js';

const routes = {
    '/': 'pippa-homepage.html',
    '/auth': 'auth-html.html',
    '/capture': 'media-capture-html.html',
    '/analyze': 'analyzer-html.html',
    '/results': 'module5-results-html.html',
    '/products': 'products-page.html',
    '/profile': 'profile-html.html',
    '/about': 'pippa-about.html'
};

function loadPage(path) {
    const file = routes[path] || routes['/'];
    fetch(file)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.body.innerHTML;
            const container = document.getElementById('app');
            container.innerHTML = content;
            eventBus.emit('pageLoaded', path);
        })
        .catch(err => {
            console.error('Route load error', err);
        });
}

export function navigate(path) {
    if (AppState.navigation.currentPage === path) return;
    StateManager.update('navigation.previousPage', AppState.navigation.currentPage);
    StateManager.update('navigation.currentPage', path);
    history.pushState({}, '', path);
    loadPage(path);
}

export function initRouter() {
    window.addEventListener('popstate', () => {
        loadPage(window.location.pathname);
    });
    loadPage(window.location.pathname);
}
