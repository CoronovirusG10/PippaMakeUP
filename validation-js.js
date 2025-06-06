// validation.js - Form Validation Utilities for Pippa of London

// Validation rules and patterns
const VALIDATION_RULES = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    password: {
        minLength: 8,
        patterns: {
            lowercase: /[a-z]/,
            uppercase: /[A-Z]/,
            number: /\d/,
            special: /[^a-zA-Z\d]/
        },
        message: 'Password must be at least 8 characters long'
    },
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
    }
};

// Common validation functions
const Validators = {
    // Email validation
    email(value) {
        if (!value) return { valid: false, message: 'Email is required' };
        
        const trimmed = value.trim();
        if (!VALIDATION_RULES.email.pattern.test(trimmed)) {
            return { valid: false, message: VALIDATION_RULES.email.message };
        }
        
        return { valid: true };
    },

    // Password validation
    password(value, checkStrength = false) {
        if (!value) return { valid: false, message: 'Password is required' };
        
        if (value.length < VALIDATION_RULES.password.minLength) {
            return { valid: false, message: VALIDATION_RULES.password.message };
        }
        
        if (checkStrength) {
            const strength = this.passwordStrength(value);
            if (strength.score < 2) {
                return { valid: false, message: 'Password is too weak. Try adding numbers and special characters.' };
            }
        }
        
        return { valid: true };
    },

    // Password strength calculation
    passwordStrength(password) {
        let score = 0;
        const feedback = [];
        
        // Length scoring
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        
        // Character diversity
        const patterns = VALIDATION_RULES.password.patterns;
        if (patterns.lowercase.test(password)) score += 1;
        if (patterns.uppercase.test(password)) score += 1;
        if (patterns.number.test(password)) score += 1;
        if (patterns.special.test(password)) score += 1;
        
        // Provide feedback
        if (!patterns.lowercase.test(password)) feedback.push('Add lowercase letters');
        if (!patterns.uppercase.test(password)) feedback.push('Add uppercase letters');
        if (!patterns.number.test(password)) feedback.push('Add numbers');
        if (!patterns.special.test(password)) feedback.push('Add special characters');
        
        // Calculate strength level
        let strength = 'weak';
        if (score >= 4) strength = 'medium';
        if (score >= 6) strength = 'strong';
        
        return { score, strength, feedback };
    },

    // Password confirmation
    passwordMatch(password, confirmPassword) {
        if (!confirmPassword) return { valid: false, message: 'Please confirm your password' };
        
        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        
        return { valid: true };
    },

    // Name validation
    name(value) {
        if (!value) return { valid: false, message: 'Name is required' };
        
        const trimmed = value.trim();
        if (trimmed.length < VALIDATION_RULES.name.minLength) {
            return { valid: false, message: `Name must be at least ${VALIDATION_RULES.name.minLength} characters` };
        }
        
        if (trimmed.length > VALIDATION_RULES.name.maxLength) {
            return { valid: false, message: `Name must be less than ${VALIDATION_RULES.name.maxLength} characters` };
        }
        
        if (!VALIDATION_RULES.name.pattern.test(trimmed)) {
            return { valid: false, message: VALIDATION_RULES.name.message };
        }
        
        return { valid: true };
    },

    // Age range validation
    ageRange(value) {
        if (!value) return { valid: false, message: 'Please select your age range' };
        
        const validRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
        if (!validRanges.includes(value)) {
            return { valid: false, message: 'Please select a valid age range' };
        }
        
        return { valid: true };
    },

    // Checkbox validation
    required(value) {
        if (!value) return { valid: false, message: 'This field is required' };
        return { valid: true };
    },

    // Skin concerns validation (at least one selected)
    skinConcerns(selectedValues) {
        if (!selectedValues || selectedValues.length === 0) {
            return { valid: false, message: 'Please select at least one skin concern' };
        }
        
        const validConcerns = ['acne', 'dryness', 'aging', 'sensitivity', 'oiliness'];
        const allValid = selectedValues.every(concern => validConcerns.includes(concern));
        
        if (!allValid) {
            return { valid: false, message: 'Invalid skin concern selected' };
        }
        
        return { valid: true };
    }
};

// Form validation helper
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.fields = {};
        this.errors = {};
    }

    // Add field to validation
    addField(fieldName, validators) {
        this.fields[fieldName] = {
            element: this.form.querySelector(`[name="${fieldName}"], #${fieldName}`),
            validators: validators
        };
    }

    // Validate single field
    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return true;

        const value = this.getFieldValue(field.element);
        
        for (const validator of field.validators) {
            const result = validator(value);
            if (!result.valid) {
                this.errors[fieldName] = result.message;
                this.showFieldError(fieldName, result.message);
                return false;
            }
        }
        
        delete this.errors[fieldName];
        this.clearFieldError(fieldName);
        return true;
    }

    // Validate entire form
    validateAll() {
        let isValid = true;
        this.errors = {};

        for (const fieldName in this.fields) {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        }

        return isValid;
    }

    // Get field value (handles different input types)
    getFieldValue(element) {
        if (!element) return null;

        if (element.type === 'checkbox') {
            if (element.name && document.querySelectorAll(`[name="${element.name}"]`).length > 1) {
                // Multiple checkboxes with same name
                return Array.from(document.querySelectorAll(`[name="${element.name}"]:checked`))
                    .map(cb => cb.value);
            }
            return element.checked;
        }

        if (element.type === 'radio') {
            const checked = document.querySelector(`[name="${element.name}"]:checked`);
            return checked ? checked.value : null;
        }

        return element.value;
    }

    // Show field error
    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        if (!field) return;

        const errorElement = this.form.querySelector(`#${fieldName}-error, [data-error-for="${fieldName}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        if (field.element) {
            field.element.classList.add('error');
            field.element.setAttribute('aria-invalid', 'true');
            if (errorElement) {
                field.element.setAttribute('aria-describedby', errorElement.id);
            }
        }
    }

    // Clear field error
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return;

        const errorElement = this.form.querySelector(`#${fieldName}-error, [data-error-for="${fieldName}"]`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        if (field.element) {
            field.element.classList.remove('error');
            field.element.setAttribute('aria-invalid', 'false');
        }
    }

    // Clear all errors
    clearAllErrors() {
        for (const fieldName in this.fields) {
            this.clearFieldError(fieldName);
        }
        this.errors = {};
    }

    // Get all errors
    getErrors() {
        return this.errors;
    }

    // Setup real-time validation
    setupRealtimeValidation() {
        for (const fieldName in this.fields) {
            const field = this.fields[fieldName];
            if (!field.element) continue;

            // Different events for different input types
            let eventName = 'blur';
            if (field.element.type === 'checkbox' || field.element.type === 'radio') {
                eventName = 'change';
            }

            field.element.addEventListener(eventName, () => {
                this.validateField(fieldName);
            });

            // Special handling for password fields (show strength on input)
            if (field.element.type === 'password' && fieldName.includes('password') && !fieldName.includes('confirm')) {
                field.element.addEventListener('input', (e) => {
                    const strength = Validators.passwordStrength(e.target.value);
                    this.updatePasswordStrengthUI(strength);
                });
            }
        }
    }

    // Update password strength UI
    updatePasswordStrengthUI(strength) {
        const strengthBar = this.form.querySelector('.strength-bar');
        const strengthText = this.form.querySelector('.strength-text strong');
        
        if (strengthBar) {
            strengthBar.className = `strength-bar ${strength.strength}`;
        }
        
        if (strengthText) {
            const labels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };
            strengthText.textContent = labels[strength.strength];
        }
    }
}

// Utility functions
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

// Export for use in other modules
window.Validators = Validators;
window.FormValidator = FormValidator;
window.ValidationUtils = {
    debounce,
    VALIDATION_RULES
};