// auth.js - Core Authentication Logic for Pippa of London

// Import dependencies
// Note: validation.js and session.js are loaded before this file

// Global state
const AUTH_STATE = {
    isAuthenticating: false,
    currentTab: 'login'
};

// Error messages
const ERROR_MESSAGES = {
    emailExists: "An account with this email already exists",
    emailNotFound: "No account found with this email",
    passwordWeak: "Password must be at least 8 characters",
    passwordMismatch: "Passwords don't match",
    invalidEmail: "Please enter a valid email address",
    invalidCredentials: "Invalid email or password",
    termsRequired: "You must agree to the terms and conditions",
    nameRequired: "Please enter your full name",
    ageRequired: "Please select your age range"
};

// Initialize authentication module
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    checkExistingSession();
});

// Main initialization function
function initializeAuth() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });

    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    resetForm.addEventListener('submit', handlePasswordReset);

    // Password toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', togglePasswordVisibility);
    });

    // Real-time validation
    setupRealtimeValidation();

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password');
    forgotPasswordLink.addEventListener('click', showPasswordResetModal);

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    modalClose.addEventListener('click', hidePasswordResetModal);

    // Modal backdrop click
    const modal = document.getElementById('password-reset-modal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hidePasswordResetModal();
        }
    });
}

// Check for existing session on page load
function checkExistingSession() {
    const user = getCurrentUser();
    if (user) {
        // Redirect to profile or main app
        window.location.href = '/profile.html';
    }
}

// Tab switching functionality
function handleTabSwitch(e) {
    const targetTab = e.target.dataset.tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    e.target.classList.add('active');
    e.target.setAttribute('aria-selected', 'true');

    // Update panels
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('hidden', '');
    });
    
    const targetPanel = document.getElementById(`${targetTab}-panel`);
    targetPanel.classList.add('active');
    targetPanel.removeAttribute('hidden');

    AUTH_STATE.currentTab = targetTab;
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    if (AUTH_STATE.isAuthenticating) return;
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Clear previous errors
    clearErrors(['login-email', 'login-password']);

    // Validate
    if (!validateEmail(email)) {
        showError('login-email', ERROR_MESSAGES.invalidEmail);
        return;
    }

    // Show loading state
    setLoadingState('login-submit', true);
    AUTH_STATE.isAuthenticating = true;

    try {
        const result = await loginUser(email, password, rememberMe);
        
        if (result.success) {
            showToast('Login successful! Redirecting...', 'success');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: result.user }));
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1000);
        } else {
            showError('login-password', result.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setLoadingState('login-submit', false);
        AUTH_STATE.isAuthenticating = false;
    }
}

// Handle registration form submission
async function handleRegister(e) {
    e.preventDefault();
    
    if (AUTH_STATE.isAuthenticating) return;

    // Get form values
    const formData = {
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value,
        confirmPassword: document.getElementById('confirm-password').value,
        name: document.getElementById('full-name').value.trim(),
        ageRange: document.getElementById('age-range').value,
        skinConcerns: Array.from(document.querySelectorAll('[name="skin-concerns"]:checked')).map(cb => cb.value),
        termsAccepted: document.getElementById('terms-checkbox').checked,
        marketingConsent: document.getElementById('marketing-checkbox').checked
    };

    // Clear previous errors
    clearErrors(['register-email', 'register-password', 'confirm-password', 'full-name', 'age-range', 'terms']);

    // Validate all fields
    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, error]) => {
            showError(field, error);
        });
        return;
    }

    // Show loading state
    setLoadingState('register-submit', true);
    AUTH_STATE.isAuthenticating = true;

    try {
        const result = await registerUser(formData);
        
        if (result.success) {
            showToast('Account created successfully!', 'success');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('userRegistered', { detail: result.user }));
            
            // Auto-login and redirect
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1000);
        } else {
            showError('register-email', result.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setLoadingState('register-submit', false);
        AUTH_STATE.isAuthenticating = false;
    }
}

// Validate registration form
function validateRegistrationForm(formData) {
    const errors = {};

    if (!validateEmail(formData.email)) {
        errors['register-email'] = ERROR_MESSAGES.invalidEmail;
    }

    if (formData.password.length < 8) {
        errors['register-password'] = ERROR_MESSAGES.passwordWeak;
    }

    if (formData.password !== formData.confirmPassword) {
        errors['confirm-password'] = ERROR_MESSAGES.passwordMismatch;
    }

    if (!formData.name) {
        errors['full-name'] = ERROR_MESSAGES.nameRequired;
    }

    if (!formData.ageRange) {
        errors['age-range'] = ERROR_MESSAGES.ageRequired;
    }

    if (!formData.termsAccepted) {
        errors['terms'] = ERROR_MESSAGES.termsRequired;
    }

    return errors;
}

// Core authentication functions
async function loginUser(email, password, rememberMe = false) {
    try {
        // Get all users
        const users = getAllUsers();
        
        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return { success: false, error: ERROR_MESSAGES.emailNotFound };
        }

        // Hash the input password
        const hashedPassword = await hashPassword(password);
        
        // Compare passwords
        if (user.password !== hashedPassword) {
            return { success: false, error: ERROR_MESSAGES.invalidCredentials };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        updateUser(user);

        // Create session
        createSession(user, rememberMe);

        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An error occurred during login' };
    }
}

async function registerUser(formData) {
    try {
        // Check if email already exists
        const users = getAllUsers();
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            return { success: false, error: ERROR_MESSAGES.emailExists };
        }

        // Hash password
        const hashedPassword = await hashPassword(formData.password);

        // Create user object
        const newUser = {
            userId: crypto.randomUUID(),
            email: formData.email,
            password: hashedPassword,
            name: formData.name,
            ageRange: formData.ageRange,
            skinConcerns: formData.skinConcerns,
            marketingConsent: formData.marketingConsent,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            favorites: [],
            analysisHistory: []
        };

        // Save user
        saveUser(newUser);

        // Create session
        createSession(newUser, false);

        return { success: true, user: newUser };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'An error occurred during registration' };
    }
}

// Password reset functionality
async function handlePasswordReset(e) {
    e.preventDefault();
    
    const resetEmail = document.getElementById('reset-email').value.trim();
    const resetCode = document.getElementById('reset-code').value;
    const newPassword = document.getElementById('new-password').value;

    if (!resetCode) {
        // Step 1: Send reset code
        if (!validateEmail(resetEmail)) {
            showError('reset-email', ERROR_MESSAGES.invalidEmail);
            return;
        }

        const users = getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());

        if (!user) {
            showError('reset-email', ERROR_MESSAGES.emailNotFound);
            return;
        }

        // Show reset code section
        document.querySelector('.reset-code-section').removeAttribute('hidden');
        showToast('Reset code displayed above. Enter it to continue.', 'info');
    } else {
        // Step 2: Reset password
        if (resetCode !== 'DEMO123') {
            showToast('Invalid reset code', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast(ERROR_MESSAGES.passwordWeak, 'error');
            return;
        }

        // Update password
        const users = getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());
        
        if (user) {
            user.password = await hashPassword(newPassword);
            updateUser(user);
            
            showToast('Password reset successful! You can now login.', 'success');
            hidePasswordResetModal();
            
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
        }
    }
}

// Password hashing using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// User data management
function getAllUsers() {
    const users = localStorage.getItem('pippa_users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem('pippa_users', JSON.stringify(users));
}

function updateUser(user) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.userId === user.userId);
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem('pippa_users', JSON.stringify(users));
    }
}

// Password visibility toggle
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const input = button.previousElementSibling;
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    button.setAttribute('aria-pressed', isPassword);
    button.querySelector('.password-toggle-icon').textContent = isPassword ? '👁️‍🗨️' : '👁️';
}

// Show/hide password reset modal
function showPasswordResetModal(e) {
    e.preventDefault();
    const modal = document.getElementById('password-reset-modal');
    modal.removeAttribute('hidden');
    document.getElementById('reset-email').focus();
}

function hidePasswordResetModal() {
    const modal = document.getElementById('password-reset-modal');
    modal.setAttribute('hidden', '');
    
    // Reset form
    document.getElementById('reset-form').reset();
    document.querySelector('.reset-code-section').setAttribute('hidden', '');
}

// UI Helper functions
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.removeAttribute('hidden');
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.setAttribute('aria-invalid', 'true');
    }
}

function clearErrors(fieldIds) {
    fieldIds.forEach(fieldId => {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.setAttribute('hidden', '');
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
            inputElement.setAttribute('aria-invalid', 'false');
        }
    });
}

function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const textSpan = button.querySelector('.btn-text');
    const loaderSpan = button.querySelector('.btn-loader');
    
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
    
    if (textSpan) {
        textSpan.textContent = isLoading ? 'Please wait...' : textSpan.getAttribute('data-original-text') || 'Submit';
        if (!textSpan.hasAttribute('data-original-text')) {
            textSpan.setAttribute('data-original-text', textSpan.textContent);
        }
    }
    
    if (loaderSpan) {
        loaderSpan.hidden = !isLoading;
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Real-time validation setup
function setupRealtimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const isValid = validateEmail(this.value);
            if (!isValid && this.value) {
                showError(this.id, ERROR_MESSAGES.invalidEmail);
            } else {
                clearErrors([this.id]);
            }
        });
    });

    // Password strength indicator
    const registerPassword = document.getElementById('register-password');
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }

    // Confirm password validation
    const confirmPassword = document.getElementById('confirm-password');
    if (confirmPassword) {
        confirmPassword.addEventListener('blur', function() {
            const password = document.getElementById('register-password').value;
            if (this.value && this.value !== password) {
                showError('confirm-password', ERROR_MESSAGES.passwordMismatch);
            } else {
                clearErrors(['confirm-password']);
            }
        });
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength calculation
function updatePasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text strong');
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const strengthLevels = ['weak', 'medium', 'strong'];
    const strengthLabels = ['Weak', 'Medium', 'Strong'];
    
    let level = 0;
    if (strength >= 3) level = 1;
    if (strength >= 4) level = 2;
    
    strengthBar.className = `strength-bar ${strengthLevels[level]}`;
    strengthText.textContent = strengthLabels[level];
}

// Export functions for other modules
window.authModule = {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    updateProfile,
    resetPassword,
    showToast
};