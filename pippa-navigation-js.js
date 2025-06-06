// Navigation and Routing System for Pippa of London
// This module handles client-side navigation, authentication checks, and page routing

// Navigation configuration
const navigationConfig = {
    main: {
        "Home": "/",
        "How It Works": "/how-it-works.html",
        "Try Now": "/auth/auth.html",
        "Products": "/catalog/products.html",
        "About": "/about.html"
    },
    user: {
        "My Profile": "/auth/profile.html",
        "My Results": "/results/results.html",
        "Favorites": "/results/favorites.html",
        "Logout": "javascript:logoutUser()"
    },
    utility: {
        "Contact": "/contact.html",
        "Privacy": "/privacy.html",
        "Terms": "/terms.html"
    }
};

// Authentication state management
class AuthManager {
    static isAuthenticated() {
        const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        return !!currentUser;
    }

    static getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    static requireAuth(redirectUrl = '/auth/auth.html') {
        if (!this.isAuthenticated()) {
            // Store intended destination
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    static logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('sessionToken');
        localStorage.removeItem('rememberMe');
        window.location.href = '/';
    }
}

// Router class for handling client-side navigation
class Router {
    constructor() {
        this.routes = {
            '/': { auth: false, module: 'homepage' },
            '/index.html': { auth: false, module: 'homepage' },
            '/how-it-works.html': { auth: false, module: 'how-it-works' },
            '/about.html': { auth: false, module: 'about' },
            '/contact.html': { auth: false, module: 'contact' },
            '/privacy.html': { auth: false, module: 'privacy' },
            '/terms.html': { auth: false, module: 'terms' },
            '/auth/auth.html': { auth: false, module: 'auth' },
            '/auth/profile.html': { auth: true, module: 'profile' },
            '/media/capture.html': { auth: true, module: 'capture' },
            '/analysis/analyzer.html': { auth: true, module: 'analysis' },
            '/results/results.html': { auth: true, module: 'results' },
            '/results/favorites.html': { auth: true, module: 'favorites' },
            '/catalog/products.html': { auth: false, module: 'catalog' }
        };
    }

    getCurrentRoute() {
        return window.location.pathname;
    }

    navigate(path) {
        const route = this.routes[path];
        
        if (!route) {
            this.handle404();
            return;
        }

        // Check authentication requirement
        if (route.auth && !AuthManager.requireAuth()) {
            return;
        }

        // Navigate to the path
        window.location.href = path;
    }

    handle404() {
        // In a real app, this would load a 404 page
        console.error('404: Page not found');
        window.location.href = '/';
    }

    checkCurrentRoute() {
        const currentPath = this.getCurrentRoute();
        const route = this.routes[currentPath];

        if (route && route.auth && !AuthManager.isAuthenticated()) {
            AuthManager.requireAuth();
        }
    }
}

// Navigation UI builder
class NavigationBuilder {
    static createHeader() {
        const isAuthenticated = AuthManager.isAuthenticated();
        const currentUser = AuthManager.getCurrentUser();

        return `
            <header id="main-header">
                <div class="container">
                    <div class="header-content">
                        <a href="/" class="logo">Pippa of London</a>
                        <nav>
                            <ul class="nav-links">
                                ${this.buildNavLinks(navigationConfig.main, isAuthenticated)}
                            </ul>
                            ${isAuthenticated ? this.buildUserMenu(currentUser) : this.buildAuthCTA()}
                            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                                <span class="hamburger"></span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    static buildNavLinks(links, isAuthenticated) {
        return Object.entries(links)
            .filter(([text, path]) => {
                // Hide "Try Now" if authenticated
                if (text === "Try Now" && isAuthenticated) return false;
                return true;
            })
            .map(([text, path]) => `
                <li><a href="${path}" class="nav-link ${this.isActive(path) ? 'active' : ''}">${text}</a></li>
            `).join('');
    }

    static buildUserMenu(user) {
        return `
            <div class="user-menu">
                <button class="user-menu-toggle">
                    <span class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    <span class="user-name">${user.name || 'My Account'}</span>
                </button>
                <div class="user-dropdown">
                    ${Object.entries(navigationConfig.user)
                        .map(([text, path]) => `
                            <a href="${path}" class="dropdown-item">${text}</a>
                        `).join('')}
                </div>
            </div>
        `;
    }

    static buildAuthCTA() {
        return `<a href="/auth/auth.html" class="nav-cta">Try Now</a>`;
    }

    static isActive(path) {
        const currentPath = window.location.pathname;
        return currentPath === path || 
               (path === '/' && currentPath === '/index.html');
    }

    static createFooter() {
        return `
            <footer>
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <h3>Pippa of London</h3>
                            <p>Revolutionary AI-powered beauty technology for inclusive, accurate shade matching.</p>
                            <div class="social-links">
                                <a href="#" class="social-link" aria-label="Instagram">📷</a>
                                <a href="#" class="social-link" aria-label="Facebook">👤</a>
                                <a href="#" class="social-link" aria-label="Twitter">🐦</a>
                                <a href="#" class="social-link" aria-label="YouTube">▶️</a>
                            </div>
                        </div>
                        <div class="footer-column">
                            <h4>Product</h4>
                            <ul>
                                ${Object.entries(navigationConfig.main)
                                    .filter(([text]) => text !== "Home")
                                    .map(([text, path]) => `
                                        <li><a href="${path}">${text}</a></li>
                                    `).join('')}
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4>Support</h4>
                            <ul>
                                ${Object.entries(navigationConfig.utility)
                                    .map(([text, path]) => `
                                        <li><a href="${path}">${text}</a></li>
                                    `).join('')}
                                <li><a href="#">FAQ</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4>Newsletter</h4>
                            <p>Get beauty tips and exclusive offers</p>
                            <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
                                <input type="email" placeholder="Your email" required>
                                <button type="submit" class="btn btn-primary">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2025 Pippa of London. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Mobile navigation handler
class MobileNavigation {
    static init() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const userMenu = document.querySelector('.user-menu');

        if (toggle) {
            toggle.addEventListener('click', () => {
                navLinks?.classList.toggle('active');
                userMenu?.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        }

        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks?.classList.remove('active');
                toggle?.classList.remove('active');
            });
        });
    }
}

// Loading states manager
class LoadingManager {
    static showLoading(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    static hideLoading() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 300);
        }
    }

    static showError(message) {
        this.hideLoading();
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }
}

// Integration functions for module communication
window.navigationAPI = {
    // Start the color analysis flow
    startAnalysis() {
        if (!AuthManager.isAuthenticated()) {
            sessionStorage.setItem('redirectAfterLogin', '/media/capture.html');
            window.location.href = '/auth/auth.html';
        } else {
            window.location.href = '/media/capture.html';
        }
    },

    // View user profile
    viewProfile() {
        if (AuthManager.requireAuth()) {
            window.location.href = '/auth/profile.html';
        }
    },

    // View products catalog
    viewProducts() {
        window.location.href = '/catalog/products.html';
    },

    // View analysis results
    viewResults() {
        if (AuthManager.requireAuth()) {
            window.location.href = '/results/results.html';
        }
    },

    // Logout user
    logoutUser() {
        if (confirm('Are you sure you want to logout?')) {
            AuthManager.logout();
        }
    }
};

// Newsletter subscription
window.subscribeNewsletter = function(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Simulate subscription
    console.log('Newsletter subscription for:', email);
    
    // Show success message
    const form = event.target;
    form.innerHTML = '<p class="success-message">✓ Successfully subscribed!</p>';
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize router
    const router = new Router();
    router.checkCurrentRoute();

    // Initialize mobile navigation
    MobileNavigation.init();

    // Update navigation based on auth status
    const header = document.getElementById('main-header');
    if (header && !header.dataset.initialized) {
        header.dataset.initialized = 'true';
        
        // Add user menu functionality if authenticated
        if (AuthManager.isAuthenticated()) {
            const userMenuToggle = document.querySelector('.user-menu-toggle');
            const userDropdown = document.querySelector('.user-dropdown');
            
            if (userMenuToggle && userDropdown) {
                userMenuToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    userDropdown.classList.toggle('active');
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', () => {
                    userDropdown.classList.remove('active');
                });
            }
        }
    }

    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.getElementById('main-header');
        
        if (header) {
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll
            if (currentScroll > lastScroll && currentScroll > 300) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
        }
        
        lastScroll = currentScroll;
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthManager,
        Router,
        NavigationBuilder,
        LoadingManager,
        navigationAPI
    };
}