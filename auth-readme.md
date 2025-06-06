# Pippa of London - Authentication Module

## Overview
This is a complete user authentication system for the Pippa of London beauty platform prototype. It provides secure user registration, login, profile management, and session handling using vanilla JavaScript, HTML5, and CSS3.

## Features

### 🔐 Core Authentication
- **User Registration** with comprehensive form validation
- **Secure Login** with SHA-256 password hashing
- **Password Reset** functionality (demo mode)
- **Session Management** with configurable duration
- **Remember Me** option (30-day extended sessions)
- **Auto-logout** after 24 hours (or 30 days with Remember Me)

### 👤 User Profile
- Personal information management
- Beauty profile (age range, skin concerns)
- Analysis history tracking
- Favorites management
- Marketing preferences

### 🎨 Design & UX
- **Mobile-first responsive design**
- **Elegant beauty brand aesthetic** with exact color palette
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **WCAG 2.1 Level AA** accessibility compliance
- **Touch-friendly** interface (44px minimum targets)

### 🔒 Security Features
- SHA-256 password hashing
- Session expiration monitoring
- Form validation with real-time feedback
- Password strength indicator
- CSRF protection ready

## File Structure

```
auth/
├── auth.html          # Main authentication page (login/register)
├── profile.html       # User profile management page
├── auth.js           # Core authentication logic
├── auth.css          # All styling (mobile-responsive)
├── validation.js     # Form validation utilities
└── session.js        # Session management system
```

## Setup Instructions

### 1. Basic Setup
```bash
# Create the auth directory
mkdir auth

# Copy all files into the auth directory
# Ensure all 6 files are present
```

### 2. Integration with Main Website
Add navigation links to your main website:
```html
<a href="/auth/auth.html">Sign In</a>
<a href="/auth/profile.html">My Profile</a>
```

### 3. Configure Paths
If your auth folder is not at the root, update the paths in the HTML files:
```html
<!-- Update script sources -->
<script src="./validation.js"></script>
<script src="./session.js"></script>
<script src="./auth.js"></script>

<!-- Update navigation links -->
<a href="./auth.html">Sign In</a>
```

## Usage Guide

### For End Users

#### Registration Flow
1. Click "Create Account" tab
2. Fill in all required fields:
   - Valid email address
   - Password (minimum 8 characters)
   - Full name
   - Age range selection
   - Skin concerns (optional)
   - Accept terms & conditions
3. Click "Create Account"
4. Automatically logged in and redirected to profile

#### Login Flow
1. Enter email and password
2. Optional: Check "Remember me for 30 days"
3. Click "Sign In"
4. Redirected to profile page

#### Password Reset
1. Click "Forgot your password?"
2. Enter your email address
3. Demo code "DEMO123" is displayed
4. Enter the code and new password
5. Password is reset

### For Developers

#### Authentication Functions
```javascript
// Register a new user
const result = await registerUser({
    email: 'user@example.com',
    password: 'securepass123',
    name: 'Jane Doe',
    ageRange: '25-34',
    skinConcerns: ['acne', 'dryness'],
    termsAccepted: true,
    marketingConsent: false
});

// Login user
const loginResult = await loginUser(email, password, rememberMe);

// Get current user
const user = getCurrentUser();

// Update user profile
updateProfile({ name: 'New Name', email: 'new@email.com' });

// Logout
logoutUser();
```

#### Session Management
```javascript
// Check session status
const session = sessionManager.getCurrentSession();

// Get session info
const info = sessionManager.getSessionInfo();
console.log(info.timeRemaining); // Time until expiration

// Extend session (for Remember Me users)
sessionManager.extendSession();
```

#### Custom Events
Listen for authentication events in other modules:
```javascript
// User logged in
window.addEventListener('userLoggedIn', (e) => {
    console.log('User logged in:', e.detail);
});

// User logged out
window.addEventListener('userLoggedOut', () => {
    console.log('User logged out');
});

// User registered
window.addEventListener('userRegistered', (e) => {
    console.log('New user registered:', e.detail);
});

// Session expired
window.addEventListener('sessionExpired', () => {
    console.log('Session expired');
});
```

#### Form Validation
```javascript
// Create a form validator
const validator = new FormValidator(formElement);

// Add validation rules
validator.addField('email', [Validators.email]);
validator.addField('password', [
    Validators.password,
    (value) => Validators.passwordStrength(value).score >= 2 
        ? { valid: true } 
        : { valid: false, message: 'Password too weak' }
]);

// Validate entire form
const isValid = validator.validateAll();
```

## Data Storage

### User Data Schema (localStorage)
```json
{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "password": "hashed_password_sha256",
    "name": "Jane Doe",
    "ageRange": "25-34",
    "skinConcerns": ["acne", "dryness"],
    "marketingConsent": true,
    "createdAt": "2025-06-06T10:00:00Z",
    "lastLogin": "2025-06-06T15:30:00Z",
    "favorites": ["productId1", "productId2"],
    "analysisHistory": [
        {
            "id": "analysisId",
            "date": "2025-06-06T14:00:00Z",
            "result": "Warm undertone, Shade 5"
        }
    ]
}
```

### Session Data Schema (sessionStorage)
```json
{
    "sessionId": "session_uuid",
    "userId": "user_uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "loginTime": 1717675200000,
    "lastActivity": 1717678800000,
    "expiresAt": 1717761600000,
    "rememberMe": false
}
```

## Customization

### Color Palette
Update CSS variables in `auth.css`:
```css
:root {
    --primary-gold: #D4A574;    /* Main CTAs */
    --soft-pink: #F8E8E0;       /* Backgrounds */
    --deep-rose: #8B4B6B;       /* Accents */
    --cream: #FDFCF8;           /* Cards */
    --charcoal: #2C2C2C;        /* Text */
}
```

### Session Duration
Modify in `session.js`:
```javascript
const SESSION_CONFIG = {
    defaultDuration: 24 * 60 * 60 * 1000,      // 24 hours
    extendedDuration: 30 * 24 * 60 * 60 * 1000 // 30 days
};
```

### Validation Rules
Adjust in `validation.js`:
```javascript
const VALIDATION_RULES = {
    password: {
        minLength: 8,  // Change minimum length
        // Add custom patterns
    }
};
```

## Browser Compatibility
- Chrome 88+
- Safari 14+
- Firefox 85+
- Edge 88+
- iOS 14+
- Android 8+

## Security Considerations

### For Production
1. **Never use localStorage for sensitive data** - Use secure HTTP-only cookies
2. **Implement server-side authentication** - This is a client-side prototype
3. **Use HTTPS** - Required for crypto.subtle API
4. **Add CSRF protection** - Tokens for state-changing operations
5. **Implement rate limiting** - Prevent brute force attacks
6. **Use secure password hashing** - bcrypt or Argon2 on server
7. **Add two-factor authentication** - For enhanced security

### Current Prototype Limitations
- Passwords stored in localStorage (use server + secure cookies in production)
- No email verification (add email confirmation flow)
- Demo password reset (implement real email service)
- Client-side only (add server API integration)

## Troubleshooting

### Common Issues

**"Session expired" immediately after login**
- Check system time is correct
- Clear browser storage and try again

**Styles not loading**
- Ensure auth.css is in the same directory
- Check console for 404 errors

**Form validation not working**
- Verify validation.js loads before auth.js
- Check browser console for errors

**Password reset not working**
- Use the demo code: DEMO123
- Ensure email exists in the system

## Testing Checklist
- [ ] Registration with all fields
- [ ] Login with Remember Me
- [ ] Password visibility toggle
- [ ] Form validation errors
- [ ] Password strength indicator
- [ ] Password reset flow
- [ ] Session expiration (wait 24 hours or modify time)
- [ ] Logout functionality
- [ ] Profile page data display
- [ ] Mobile responsive design
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## Next Steps
1. Integrate with Module 2 (Media Capture)
2. Connect to Module 3 (Product Catalog)
3. Link analysis results to user profile
4. Add social login functionality
5. Implement email verification
6. Create admin user management

## Support
For issues or questions about this authentication module, please refer to the main project documentation or contact the development team.