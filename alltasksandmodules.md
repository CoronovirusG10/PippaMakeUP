# Detailed Module Development Prompts - Pippa Platform Prototype

## Module 1: User Authentication & Registration System

**Prompt:**
Create a complete user authentication system for a beauty platform prototype called "Pippa of London". 

**Technical Requirements:**
- Use vanilla JavaScript, HTML5, and CSS3 (no frameworks)
- Store user data in localStorage for prototype purposes
- Implement proper form validation and security practices
- Mobile-first responsive design

**Specific Deliverables:**
1. **File Structure:**
   ```
   auth/
   ├── auth.html (registration/login forms)
   ├── profile.html (user profile page)
   ├── auth.js (authentication logic)
   ├── auth.css (styling)
   └── user-data.js (data management)
   ```

2. **Registration Form Fields:**
   - Email (with validation)
   - Password (min 8 characters, show strength indicator)
   - Confirm password
   - Full name
   - Age range (dropdown: 18-24, 25-34, 35-44, 45-54, 55+)
   - Skin concerns (checkboxes: acne, dryness, aging, sensitivity, oiliness)
   - Marketing consent checkbox

3. **User Data Schema (localStorage):**
   ```json
   {
     "userId": "uuid",
     "email": "user@email.com",
     "name": "Full Name",
     "ageRange": "25-34",
     "skinConcerns": ["acne", "dryness"],
     "createdAt": "2025-06-06T10:00:00Z",
     "lastLogin": "2025-06-06T10:00:00Z",
     "favorites": [],
     "analysisHistory": []
   }
   ```

4. **Authentication Functions to Implement:**
   - `registerUser(formData)` - validates and stores new user
   - `loginUser(email, password)` - authenticates existing user
   - `logoutUser()` - clears session
   - `getCurrentUser()` - returns logged-in user data
   - `updateProfile(userData)` - updates user information
   - `resetPassword(email)` - simulates password reset

5. **Session Management:**
   - Store current session in sessionStorage
   - Auto-logout after 24 hours
   - Remember login state across browser sessions
   - Redirect unauthorized users to login

6. **Validation Requirements:**
   - Email format validation with regex
   - Password strength indicator (weak/medium/strong)
   - Real-time validation feedback
   - Prevent duplicate email registration
   - Show clear error messages

7. **UI/UX Requirements:**
   - Toggle between login and registration forms
   - Show/hide password functionality
   - Loading states for form submission
   - Success/error toast notifications
   - Mobile-optimized touch targets (min 44px)

**Success Criteria:**
- Complete registration flow works end-to-end
- Users can login/logout successfully
- User data persists across browser sessions
- Form validation prevents invalid submissions
- Responsive design works on mobile devices
- Clean, professional visual design matching beauty brand aesthetic

---

## Module 2: Media Capture & Upload Interface

**Prompt:**
Build a comprehensive media capture system that allows users to take photos/videos or upload files for beauty analysis.

**Technical Requirements:**
- Use MediaDevices API for camera access
- Support both photo and video capture
- Handle file uploads with drag-and-drop
- Implement client-side image compression
- Work across desktop and mobile browsers

**Specific Deliverables:**
1. **File Structure:**
   ```
   media/
   ├── capture.html (main capture interface)
   ├── camera.js (camera functionality)
   ├── upload.js (file upload handling)
   ├── media-utils.js (compression, validation)
   ├── capture.css (styling)
   └── preview.js (media preview handling)
   ```

2. **Camera Functionality:**
   - Front-facing camera as default
   - Camera switching (front/back) on mobile
   - Photo capture with high resolution
   - Video recording (max 10 seconds for prototype)
   - Real-time preview stream
   - Camera permission handling and error states

3. **File Upload Features:**
   - Drag and drop zone
   - Traditional file picker button
   - Multiple file selection
   - File type validation (jpg, png, mp4, mov)
   - File size limits (photos: 10MB, videos: 50MB)
   - Upload progress indicators

4. **Media Processing Functions:**
   ```javascript
   // Required functions to implement:
   initializeCamera(facingMode) // 'user' or 'environment'
   capturePhoto() // returns blob
   startVideoRecording() // begins recording
   stopVideoRecording() // returns blob
   compressImage(file, quality) // reduces file size
   validateFile(file) // checks type/size
   generateThumbnail(file) // creates preview
   ```

5. **Data Output Format:**
   ```json
   {
     "mediaId": "uuid",
     "type": "photo|video",
     "timestamp": "2025-06-06T10:00:00Z",
     "file": "base64|blob",
     "thumbnail": "base64",
     "metadata": {
       "width": 1920,
       "height": 1080,
       "size": 2048576,
       "duration": 5.2 // for videos
     },
     "source": "camera|upload"
   }
   ```

6. **UI Components:**
   - Camera viewfinder with guidelines
   - Capture button (photo) and record button (video)
   - Camera flip button
   - Upload area with drag-drop visual feedback
   - Media preview gallery
   - Delete/retake options
   - "Use this photo/video" confirmation

7. **Error Handling:**
   - Camera permission denied
   - No camera available
   - File too large
   - Unsupported file format
   - Camera access failure
   - Storage quota exceeded

8. **Mobile Optimizations:**
   - Touch-friendly interface
   - Proper aspect ratios
   - iOS Safari compatibility
   - Android Chrome compatibility
   - Orientation change handling

**Success Criteria:**
- Camera opens and displays live preview
- Photos and videos capture successfully
- File uploads work via drag-drop and file picker
- Compressed files are properly sized
- Preview system shows all captured/uploaded media
- Error states are handled gracefully
- Interface works on both desktop and mobile

---

## Module 3: Product Catalog & Database

**Prompt:**
Create a comprehensive product catalog system for makeup products with multiple shades and color data for the Pippa of London beauty platform.

**Technical Requirements:**
- Use localStorage to simulate database
- Include realistic makeup product data
- Implement search and filtering functionality
- Create admin interface for product management
- Support complex color data structures

**Specific Deliverables:**
1. **File Structure:**
   ```
   catalog/
   ├── products.html (product listing page)
   ├── product-detail.html (individual product page)
   ├── admin.html (product management)
   ├── catalog.js (product logic)
   ├── search.js (search/filter functionality)
   ├── admin.js (admin functionality)
   ├── product-data.js (sample data)
   └── catalog.css (styling)
   ```

2. **Product Data Schema:**
   ```json
   {
     "productId": "uuid",
     "name": "Flawless Foundation",
     "brand": "Pippa of London",
     "category": "foundation",
     "subcategory": "liquid",
     "description": "Full coverage liquid foundation",
     "price": 35.00,
     "currency": "GBP",
     "shades": [
       {
         "shadeId": "uuid",
         "name": "Porcelain",
         "code": "P01",
         "hexColor": "#FDB5A6",
         "undertone": "cool", // cool, warm, neutral
         "coverage": "full", // light, medium, full
         "deltaE": {
           "L": 85.2,
           "a": 12.1,
           "b": 18.5
         },
         "fitzpatrickScale": 1, // 1-6
         "monkScale": 2, // 1-10
         "inStock": true,
         "popularity": 8.5
       }
     ],
     "features": ["long-wearing", "buildable", "non-comedogenic"],
     "skinTypes": ["all", "dry", "oily", "combination"],
     "ingredients": ["water", "dimethicone", "titanium dioxide"],
     "images": {
       "main": "url",
       "swatch": "url",
       "lifestyle": "url"
     },
     "createdAt": "2025-06-06T10:00:00Z",
     "isActive": true
   }
   ```

3. **Sample Product Categories:**
   - Foundation (20 products, 12 shades each)
   - Concealer (15 products, 10 shades each)
   - Lipstick (25 products, 15 shades each)
   - Blush (10 products, 8 shades each)
   - Bronzer (8 products, 6 shades each)

4. **Required Functions:**
   ```javascript
   // Product management
   getAllProducts()
   getProductById(id)
   getProductsByCategory(category)
   getShadeById(shadeId)
   
   // Search and filtering
   searchProducts(query)
   filterByUndertone(undertone)
   filterByPriceRange(min, max)
   filterBySkinType(skinType)
   filterByShadeRange(monkMin, monkMax)
   
   // Admin functions
   addProduct(productData)
   updateProduct(id, productData)
   deleteProduct(id)
   addShade(productId, shadeData)
   updateShade(shadeId, shadeData)
   ```

5. **Color Matching Data:**
   - Include accurate hex colors for all shades
   - LAB color values for each shade
   - Undertone classifications (cool, warm, neutral)
   - Monk Skin Tone Scale mappings (1-10)
   - Fitzpatrick Scale mappings (1-6)

6. **Search & Filter Interface:**
   - Text search across product names/descriptions
   - Category filters (foundation, lipstick, etc.)
   - Price range slider
   - Undertone filters (cool/warm/neutral)
   - Skin type checkboxes
   - Shade range filters
   - Sort options (price, popularity, name)

7. **Product Display Components:**
   - Product grid view with images
   - Product detail pages
   - Shade selector with color swatches
   - Zoom functionality for color swatches
   - Related products suggestions
   - Add to favorites functionality

8. **Admin Interface:**
   - Product CRUD operations
   - Bulk shade management
   - Image upload simulation
   - Product status management (active/inactive)
   - Sales analytics dashboard

**Success Criteria:**
- Database contains 50+ realistic products with accurate color data
- Search and filtering work smoothly
- Product detail pages display all relevant information
- Admin interface allows full product management
- Color data is scientifically accurate for matching algorithms
- Mobile-responsive product browsing experience

---

## Module 4: Basic Color Analysis Engine

**Prompt:**
Build a client-side color analysis system that can analyze skin tones from photos and match them against the product database.

**Technical Requirements:**
- Use face-api.js for face detection
- Implement color extraction algorithms
- Create color matching logic
- Return structured results with confidence scores
- Work entirely in the browser

**Specific Deliverables:**
1. **File Structure:**
   ```
   analysis/
   ├── analyzer.html (analysis interface)
   ├── face-detection.js (face detection logic)
   ├── color-extraction.js (skin tone analysis)
   ├── color-matching.js (product matching)
   ├── analysis-utils.js (helper functions)
   ├── models/ (face-api.js model files)
   └── analysis.css (styling)
   ```

2. **Core Analysis Functions:**
   ```javascript
   // Face detection and analysis
   async detectFace(imageElement)
   async extractSkinTone(imageElement, faceBox)
   calculateUndertone(rgbValues)
   mapToMonkScale(labValues)
   calculateConfidenceScore(detectionData)
   
   // Color matching
   findBestMatches(skinToneData, productDatabase)
   calculateColorDistance(color1, color2) // Delta E calculation
   rankMatches(matches, userPreferences)
   generateRecommendations(matches, userHistory)
   ```

3. **Analysis Pipeline:**
   ```javascript
   // Main analysis workflow
   async function analyzeImage(imageFile) {
     1. Load and prepare image
     2. Detect face(s) in image
     3. Extract skin tone from cheek/forehead areas
     4. Calculate undertone (cool/warm/neutral)
     5. Map to Monk Skin Tone Scale
     6. Find matching products
     7. Calculate confidence scores
     8. Return structured results
   }
   ```

4. **Skin Tone Extraction:**
   - Focus on cheek and forehead areas
   - Avoid eyes, lips, and hair regions
   - Sample multiple points for accuracy
   - Convert RGB to LAB color space
   - Calculate average values with outlier removal

5. **Color Matching Algorithm:**
   ```javascript
   // Simplified Delta E calculation
   function calculateDeltaE(lab1, lab2) {
     const deltaL = lab1.L - lab2.L;
     const deltaA = lab1.a - lab2.a;
     const deltaB = lab1.b - lab2.b;
     return Math.sqrt(deltaL*deltaL + deltaA*deltaA + deltaB*deltaB);
   }
   ```

6. **Analysis Results Schema:**
   ```json
   {
     "analysisId": "uuid",
     "timestamp": "2025-06-06T10:00:00Z",
     "skinTone": {
       "rgb": [185, 145, 120],
       "lab": [65.2, 12.1, 18.5],
       "hex": "#B99178",
       "undertone": "warm",
       "monkScale": 5,
       "fitzpatrickScale": 3,
       "confidence": 0.85
     },
     "faceDetection": {
       "facesDetected": 1,
       "faceBox": {"x": 100, "y": 50, "width": 200, "height": 200},
       "confidence": 0.92
     },
     "matches": [
       {
         "productId": "uuid",
         "shadeId": "uuid",
         "productName": "Flawless Foundation",
         "shadeName": "Golden Beige",
         "deltaE": 2.3,
         "matchScore": 0.89,
         "undertoneMatch": true
       }
     ],
     "recommendations": {
       "foundation": ["shade1", "shade2", "shade3"],
       "concealer": ["shade1", "shade2"],
       "bronzer": ["shade1"]
     }
   }
   ```

7. **Error Handling:**
   - No face detected
   - Multiple faces detected (use largest)
   - Poor lighting conditions
   - Low resolution images
   - Analysis timeout
   - Model loading failures

8. **Performance Optimizations:**
   - Image resizing before analysis
   - Lazy loading of ML models
   - Web worker for heavy processing
   - Caching of analysis results
   - Progressive analysis feedback

9. **Undertone Detection Logic:**
   ```javascript
   function calculateUndertone(labValues) {
     const bValue = labValues.b;
     const aValue = labValues.a;
     
     if (bValue > 15 && aValue < 8) return "warm";
     if (bValue < 10 && aValue > 5) return "cool";
     return "neutral";
   }
   ```

**Success Criteria:**
- Detects faces in uploaded photos accurately
- Extracts believable skin tone values
- Matches against product database with realistic confidence scores
- Provides undertone analysis (cool/warm/neutral)
- Returns top 3-5 product matches per category
- Analysis completes within 3-5 seconds
- Works with various lighting conditions and image qualities

---

## Module 5: Results Display & Recommendation Interface

**Prompt:**
Create a comprehensive results interface that displays color analysis results and product recommendations in an engaging, user-friendly format.

**Technical Requirements:**
- Display analysis results from Module 4
- Show product recommendations from Module 3
- Include interactive elements for user engagement
- Implement save/share functionality
- Mobile-optimized design

**Specific Deliverables:**
1. **File Structure:**
   ```
   results/
   ├── results.html (main results page)
   ├── recommendations.js (recommendation logic)
   ├── favorites.js (save functionality)
   ├── sharing.js (social sharing)
   ├── comparison.js (shade comparison)
   ├── results.css (styling)
   └── animations.css (transitions/effects)
   ```

2. **Results Page Layout:**
   ```html
   <!-- Main sections to implement -->
   <section id="analysis-summary">Your Skin Analysis</section>
   <section id="shade-matches">Perfect Matches</section>
   <section id="product-recommendations">Recommended Products</section>
   <section id="comparison-tool">Compare Shades</section>
   <section id="next-steps">What's Next?</section>
   ```

3. **Analysis Summary Display:**
   - User's analyzed photo with skin tone overlay
   - Monk Scale position visualization
   - Undertone indicator (cool/warm/neutral)
   - Confidence score with explanation
   - "How we analyzed this" expandable section

4. **Product Recommendations Interface:**
   ```javascript
   // Recommendation categories to display
   const categories = {
     foundation: "Perfect Foundation Matches",
     concealer: "Matching Concealer Shades", 
     lipstick: "Complementary Lip Colors",
     blush: "Flattering Blush Tones",
     bronzer: "Natural Bronzer Options"
   };
   ```

5. **Individual Product Cards:**
   - Product image and name
   - Shade name and color swatch
   - Match confidence percentage
   - Price and "Add to Cart" button
   - "Save to Favorites" heart icon
   - "Virtual Try-On" button (future feature)
   - Detailed shade information popup

6. **Interactive Features:**
   ```javascript
   // Required interactive functions
   saveToFavorites(productId, shadeId)
   removeFromFavorites(productId, shadeId)
   shareResults(platform) // instagram, facebook, twitter
   compareShades(shade1, shade2)
   filterRecommendations(category)
   sortRecommendations(criteria) // price, match, popularity
   ```

7. **Shade Comparison Tool:**
   - Side-by-side shade comparison
   - Color difference visualization
   - Undertone compatibility indicator
   - "Which shade is better for me?" helper
   - Save comparison results

8. **User Engagement Elements:**
   - "Rate this match" (1-5 stars)
   - "Not quite right?" feedback button
   - "Tell us about your experience" form
   - Social proof ("Others with similar skin loved...")
   - Progress indicator for onboarding

9. **Results Data Schema:**
   ```json
   {
     "resultId": "uuid",
     "userId": "uuid",
     "analysisId": "uuid",
     "displayData": {
       "skinToneVisualization": "base64Image",
       "confidenceExplanation": "text",
       "monkScalePosition": 5,
       "undertoneIcon": "warm-icon.svg"
     },
     "recommendations": {
       "foundation": [matchObjects],
       "concealer": [matchObjects],
       "lipstick": [matchObjects]
     },
     "userActions": {
       "favorites": ["productId1", "productId2"],
       "ratings": {"productId": 4},
       "shares": ["instagram", "facebook"]
     }
   }
   ```

10. **Responsive Design Requirements:**
    - Mobile-first approach
    - Touch-friendly interaction areas
    - Swipeable product carousels
    - Collapsible sections for mobile
    - Fast loading on slower connections

11. **Call-to-Action Flow:**
    - Primary: "Shop This Look" 
    - Secondary: "Save Favorites"
    - Tertiary: "Get More Recommendations"
    - "Book Virtual Consultation" (future)
    - "Share Your Results"

12. **Error States:**
    - No recommendations found
    - Analysis confidence too low
    - Product unavailable
    - Loading failed
    - Network connectivity issues

**Success Criteria:**
- Results page loads quickly with all analysis data
- Product recommendations display correctly with accurate information
- Users can save favorites and interact with recommendations
- Sharing functionality works for major social platforms
- Mobile experience is smooth and intuitive
- Visual design matches beauty brand aesthetic
- Clear next steps guide users toward purchase or re-analysis

---

## Module 6: Main Website & Landing Pages

**Prompt:**
Build the main website structure including homepage, navigation, and all connecting pages for the Pippa of London beauty platform prototype.

**Technical Requirements:**
- Create cohesive navigation between all modules
- Design compelling landing pages that explain the technology
- Implement responsive design with beauty brand aesthetic
- Include proper loading states and error handling
- Optimize for mobile and desktop

**Specific Deliverables:**
1. **File Structure:**
   ```
   website/
   ├── index.html (homepage)
   ├── about.html (technology explanation)
   ├── how-it-works.html (user guide)
   ├── privacy.html (privacy policy)
   ├── terms.html (terms of service)
   ├── contact.html (contact form)
   ├── navigation.js (routing and navigation)
   ├── homepage.js (homepage functionality)
   ├── global.css (site-wide styles)
   ├── components.css (reusable components)
   └── assets/ (images, icons, fonts)
   ```

2. **Homepage Structure:**
   ```html
   <!-- Required homepage sections -->
   <header>Brand header with navigation</header>
   <section id="hero">Main value proposition</section>
   <section id="how-it-works">3-step process</section>
   <section id="technology">AI technology explanation</section>
   <section id="benefits">User benefits</section>
   <section id="social-proof">Testimonials/reviews</section>
   <section id="cta">Get started call-to-action</section>
   <footer>Links and company info</footer>
   ```

3. **Navigation System:**
   ```javascript
   // Main navigation structure
   const navigationItems = {
     "Home": "/",
     "How It Works": "/how-it-works.html",
     "Try Now": "/auth/auth.html",
     "Products": "/catalog/products.html",
     "About": "/about.html",
     "Contact": "/contact.html"
   };
   
   // User account navigation (when logged in)
   const userNavigation = {
     "My Profile": "/auth/profile.html",
     "My Results": "/results/results.html",
     "Favorites": "/results/favorites.html",
     "Logout": "javascript:logoutUser()"
   };
   ```

4. **Brand Identity Elements:**
   - Color scheme: Elegant pinks, golds, and neutrals
   - Typography: Modern, clean fonts suitable for beauty brand
   - Logo and brand mark implementation
   - Consistent button styles and interactions
   - Professional photography placeholders

5. **Homepage Value Proposition:**
   ```html
   <!-- Hero section content -->
   <h1>Find Your Perfect Shade with AI Precision</h1>
   <p>Revolutionary color-matching technology that analyzes your unique skin tone and undertones to recommend makeup shades that are truly made for you.</p>
   <button>Try Free Analysis</button>
   ```

6. **How It Works Section:**
   ```javascript
   // Three-step process to highlight
   const steps = [
     {
       icon: "camera-icon",
       title: "Take a Selfie",
       description: "Capture a photo or upload an image in good lighting"
     },
     {
       icon: "ai-icon", 
       title: "AI Analysis",
       description: "Our advanced AI analyzes your skin tone and undertones"
     },
     {
       icon: "makeup-icon",
       title: "Perfect Matches",
       description: "Get personalized shade recommendations across all products"
     }
   ];
   ```

7. **Technology Explanation Page:**
   - How the AI color matching works
   - Monk Skin Tone Scale explanation
   - Undertone analysis methodology
   - Accuracy and confidence metrics
   - Privacy and data security
   - Scientific backing and research

8. **User Benefits Section:**
   - "No more wrong shade purchases"
   - "Inclusive color matching for all skin tones"
   - "Sustainable beauty choices"
   - "Professional-grade accuracy"
   - "Works on any device"

9. **Loading States and Transitions:**
   ```css
   /* Required loading animations */
   .loading-spinner { /* CSS spinner */ }
   .fade-in { /* Smooth content loading */ }
   .slide-up { /* Page transitions */ }
   .skeleton-loader { /* Content placeholders */ }
   ```

10. **Error Handling:**
    - 404 page not found
    - Network connectivity issues
    - Browser compatibility warnings
    - JavaScript disabled fallback
    - Graceful degradation for older browsers

11. **Contact and Support:**
    - Contact form with validation
    - FAQ section with common questions
    - Support ticket system (basic)
    - Live chat placeholder
    - Email and phone contact information

12. **Footer Content:**
    - Company information and mission
    - Social media links
    - Legal pages (privacy, terms)
    - Newsletter signup
    - Accessibility statement

13. **SEO and Performance:**
    - Proper HTML5 semantic structure
    - Meta tags and descriptions
    - Open Graph tags for social sharing
    - Fast loading times
    - Accessibility compliance (WCAG 2.1)

14. **Mobile Optimizations:**
    - Touch-friendly navigation
    - Readable text sizes
    - Optimized images
    - Fast mobile loading
    - App-like experience

**Success Criteria:**
- Professional, cohesive design across all pages
- Clear value proposition that explains the technology
- Smooth navigation between all modules
- Mobile-responsive design that works on all devices
- Fast loading times and smooth transitions
- Compelling content that would convince users to try the technology
- Proper error handling and fallback states

---

## Module 7: Integration & Orchestration Layer

**Prompt:**
Create the integration layer that connects all modules into a cohesive, working application with proper data flow, state management, and deployment configuration.

**Technical Requirements:**
- Implement centralized state management
- Create API layer for module communication
- Handle routing between all modules
- Implement error boundaries and fallbacks
- Optimize performance and prepare for deployment

**Specific Deliverables:**
1. **File Structure:**
   ```
   integration/
   ├── app.js (main application controller)
   ├── router.js (client-side routing)
   ├── state-manager.js (global state)
   ├── api-layer.js (inter-module communication)
   ├── error-handler.js (global error handling)
   ├── performance.js (optimization utilities)
   ├── config.js (application configuration)
   └── deployment/ (build and deploy scripts)
   ```

2. **Global State Management:**
   ```javascript
   // Central state object structure
   const AppState = {
     user: {
       isAuthenticated: false,
       profile: null,
       preferences: null
     },
     media: {
       currentImage: null,
       analysisHistory: []
     },
     analysis: {
       currentResults: null,
       isProcessing: false,
       confidence: null
     },
     products: {
       catalog: null,
       favorites: [],
       cart: []
     },
     ui: {
       currentPage: 'home',
       isLoading: false,
       notifications: []
     }
   };
   ```

3. **Module Communication API:**
   ```javascript
   // Inter-module communication functions
   class ModuleAPI {
     // Auth module integration
     static async authenticateUser(credentials)
     static async getUserProfile()
     static async updateUserPreferences(preferences)
     
     // Media module integration  
     static async processMedia(mediaData)
     static async validateMedia(file)
     
     // Analysis module integration
     static async analyzeImage(imageData)
     static async getAnalysisHistory(userId)
     
     // Catalog module integration
     static async searchProducts(query)
     static async getRecommendations(analysisResults)
     
     // Results module integration
     static async saveResults(results)
     static async shareResults(platform, resultsId)
   }
   ```

4. **Client-Side Routing:**
   ```javascript
   // Route definitions and handlers
   const routes = {
     '/': 'homepage',
     '/auth': 'authentication',
     '/capture': 'media-capture', 
     '/analyze': 'color-analysis',
     '/results': 'results-display',
     '/products': 'product-catalog',
     '/profile': 'user-profile',
     '/about': 'about-page'
   };
   
   // Route handling with authentication checks
   function handleRoute(path) {
     const requiresAuth = ['/capture', '/analyze', '/results', '/profile'];
     if (requiresAuth.includes(path) && !AppState.user.isAuthenticated) {
       return redirectTo('/auth');
     }
     loadModule(routes[path]);
   }
   ```

5. **Data Flow Architecture:**
   ```javascript
   // Complete user journey data flow
   async function completeAnalysisFlow() {
     1. User authentication (auth module)
     2. Media capture (media module) 
     3. Image analysis (analysis module)
     4. Product matching (catalog module)
     5. Results display (results module)
     6. Save to profile (integration layer)
   }
   ```

6. **Error Handling System:**
   ```javascript
   // Global error handler with user-friendly messages
   class ErrorHandler {
     static handleAuthError(error)      // "Please log in to continue"
     static handleMediaError(error)     // "Camera access denied"
     static handleAnalysisError(error)  // "Analysis failed, please try again"
     static handleNetworkError(error)   // "Connection issue, retrying..."
     static handleGenericError(error)   // "Something went wrong"
     
     static showNotification(message, type) // success, error, warning, info
     static logError(error, context)        // Console logging for debugging
   }
   ```

7. **Performance Optimizations:**
   ```javascript
   // Performance enhancement functions
   class PerformanceOptimizer {
     static lazyLoadModules()           // Load modules on demand
     static preloadCriticalAssets()     // Preload essential resources
     static debounceSearch(func)        // Debounce search inputs
     static throttleAnalysis(func)      // Throttle analysis requests
     static cacheResults(key, data)     // Cache analysis results
     static optimizeImages(file)        // Compress images before processing
   }
   ```

8. **Configuration Management:**
   ```javascript
   // Application configuration
   const Config = {
     api: {
       baseUrl: window.location.origin,
       timeout: 30000,
       retryAttempts: 3
     },
     analysis: {
       maxImageSize: 10 * 1024 * 1024, // 10MB
       supportedFormats: ['image/jpeg', 'image/png'],
       confidenceThreshold: 0.7
     },
     ui: {
       animationDuration: 300,
       notificationTimeout: 5000,
       autoSaveInterval: 30000
     },
     features: {
       enableVideoAnalysis: false, // Future feature
       enableSocialSharing: true,
       enablePushNotifications: false
     }
   };
   ```

9. **Deployment Preparation:**
   ```javascript
   // Build and deployment functions
   class DeploymentManager {
     static minifyAssets()             // Minify CSS/JS
     static optimizeImages()           // Compress images
     static generateServiceWorker()    // PWA capabilities
     static setupAnalytics()           // Basic usage tracking
     static validateBuild()            // Pre-deployment checks
   }
   ```

10. **Module Loading Strategy:**
    ```javascript
    // Dynamic module loading for performance
    const ModuleLoader = {
      async loadAuthModule() {
        return await import('./auth/auth.js');
      },
      async loadMediaModule() {
        return await import('./media/camera.js');
      },
      async loadAnalysisModule() {
        return await import('./analysis/analyzer.js');
      }
      // ... other modules
    };
    ```

11. **Testing and Validation:**
    ```javascript
    // Integration testing functions
    class IntegrationTester {
      static async testCompleteFlow()     // End-to-end user journey
      static async testModuleCommunication() // Inter-module APIs
      static async testErrorHandling()    // Error scenarios
      static async testPerformance()      // Load and response times
      static validateDataIntegrity()      // Data consistency checks
    }
    ```

12. **Analytics and Monitoring:**
    ```javascript
    // Basic analytics for prototype
    class Analytics {
      static trackUserJourney(step)      // Track completion rates
      static trackAnalysisAccuracy()     // Monitor analysis quality
      static trackPerformance(metric)    // Monitor load times
      static trackErrors(error, context) // Error reporting
    }
    ```

**Success Criteria:**
- All modules communicate seamlessly through the API layer
- User can complete entire journey from signup to results
- State management works correctly across page navigation
- Error handling provides clear feedback for all failure scenarios
- Performance is optimized for mobile devices
- Application can be deployed to static hosting
- All integration points are thoroughly tested
- Fallback mechanisms work when individual modules fail