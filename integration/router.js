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

            // Inject styles
            const styles = doc.querySelectorAll('link[rel="stylesheet"]');
            styles.forEach(link => {
                const href = link.getAttribute('href');
                if (!document.querySelector(`link[data-dynamic="${href}"]`)) {
                    const styleEl = document.createElement('link');
                    styleEl.rel = 'stylesheet';
                    styleEl.href = href;
                    styleEl.dataset.dynamic = href;
                    document.head.appendChild(styleEl);
                }
            });

            const container = document.getElementById('app');
            container.innerHTML = doc.body.innerHTML;

            // Inject scripts so they execute
            const scripts = doc.querySelectorAll('script');
            scripts.forEach(srcScript => {
                const src = srcScript.getAttribute('src');
                if (src && document.querySelector(`script[data-dynamic="${src}"]`)) {
                    return; // avoid duplicates
                }
                const script = document.createElement('script');
                if (src) {
                    script.src = src;
                    script.defer = srcScript.defer;
                    script.dataset.dynamic = src;
                }
                script.textContent = srcScript.textContent;
                document.body.appendChild(script);
            });

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
