// recommendations.js - Product recommendation logic for Pippa of London

// Global variables
let allProducts = [];
let currentRecommendations = [];
let activeFilters = {
    category: 'all',
    sortBy: 'match'
};

// Load product recommendations based on analysis results
async function loadRecommendations(analysisData) {
    try {
        // Get products from localStorage (populated by catalog module)
        const productsData = localStorage.getItem('pippaProducts');
        if (!productsData) {
            // Generate sample products if not found
            generateSampleProducts();
            allProducts = JSON.parse(localStorage.getItem('pippaProducts'));
        } else {
            allProducts = JSON.parse(productsData);
        }

        // Calculate recommendations based on skin tone analysis
        currentRecommendations = calculateRecommendations(analysisData, allProducts);
        
        // Display initial recommendations
        displayRecommendations(currentRecommendations);
        
        // Update favorites count
        updateFavoritesCount();
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        showToast('Error loading product recommendations', 'error');
    }
}

// Calculate product recommendations based on skin analysis
function calculateRecommendations(analysisData, products) {
    const recommendations = [];
    const userLAB = analysisData.skinTone.lab;
    const userUndertone = analysisData.skinTone.undertone;
    const userMonkScale = analysisData.skinTone.monkScale;

    // Process each product
    products.forEach(product => {
        product.shades.forEach(shade => {
            // Skip out of stock items
            if (!shade.inStock) return;

            // Calculate color distance (Delta E)
            const deltaE = calculateDeltaE(userLAB, shade.labColor);
            
            // Calculate match score (0-1)
            let matchScore = calculateMatchScore(deltaE, shade, analysisData.skinTone);
            
            // Boost score for matching undertones
            if (shade.undertone === userUndertone) {
                matchScore *= 1.2;
            }
            
            // Create recommendation object
            const recommendation = {
                productId: product.productId,
                productName: product.name,
                category: product.category,
                price: product.price,
                brand: product.brand,
                productImage: product.images?.main || generateProductImage(product.category),
                shadeId: shade.shadeId,
                shadeName: shade.name,
                shadeCode: shade.code,
                hexColor: shade.hexColor,
                undertone: shade.undertone,
                deltaE: deltaE,
                matchScore: Math.min(matchScore, 1), // Cap at 1.0
                undertoneMatch: shade.undertone === userUndertone,
                monkScale: shade.monkScale,
                monkDifference: Math.abs(shade.monkScale - userMonkScale)
            };
            
            recommendations.push(recommendation);
        });
    });

    // Sort by match score (best matches first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top recommendations per category
    return getTopRecommendationsPerCategory(recommendations);
}

// Calculate color distance using Delta E formula
function calculateDeltaE(lab1, lab2) {
    const deltaL = lab1.L - lab2.L;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Calculate match score based on various factors
function calculateMatchScore(deltaE, shade, userSkinTone) {
    // Base score from color distance (lower deltaE = higher score)
    let score = 1 - (deltaE / 100); // Normalize to 0-1 range
    
    // Penalty for large Monk scale differences
    const monkDiff = Math.abs(shade.monkScale - userSkinTone.monkScale);
    score -= monkDiff * 0.05;
    
    // Bonus for popular shades
    if (shade.popularity) {
        score += shade.popularity / 100;
    }
    
    return Math.max(0, score); // Ensure non-negative
}

// Get top recommendations for each category
function getTopRecommendationsPerCategory(recommendations) {
    const topPerCategory = {
        foundation: [],
        concealer: [],
        lipstick: [],
        blush: [],
        bronzer: []
    };
    
    const limits = {
        foundation: 6,
        concealer: 4,
        lipstick: 8,
        blush: 4,
        bronzer: 3
    };
    
    recommendations.forEach(rec => {
        const category = rec.category;
        if (topPerCategory[category] && topPerCategory[category].length < limits[category]) {
            topPerCategory[category].push(rec);
        }
    });
    
    // Flatten into single array
    return Object.values(topPerCategory).flat();
}

// Display recommendations in the UI
function displayRecommendations(recommendations) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';
    
    // Filter by selected category
    let filteredRecs = recommendations;
    if (activeFilters.category !== 'all') {
        filteredRecs = recommendations.filter(rec => rec.category === activeFilters.category);
    }
    
    // Sort recommendations
    filteredRecs = sortRecommendations(filteredRecs, activeFilters.sortBy);
    
    // Create product cards
    filteredRecs.forEach((rec, index) => {
        const card = createProductCard(rec);
        productGrid.appendChild(card);
    });
    
    // Trigger stagger animation
    requestAnimationFrame(() => {
        productGrid.querySelectorAll('.product-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.05}s`;
        });
    });
}

// Sort recommendations based on criteria
function sortRecommendations(recommendations, sortBy) {
    const sorted = [...recommendations];
    
    switch (sortBy) {
        case 'match':
            sorted.sort((a, b) => b.matchScore - a.matchScore);
            break;
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'popularity':
            sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
    }
    
    return sorted;
}

// Create product card HTML
function createProductCard(rec) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = rec.productId;
    card.dataset.shadeId = rec.shadeId;
    
    const matchPercentage = Math.round(rec.matchScore * 100);
    const isFavorite = checkIfFavorite(rec.productId, rec.shadeId);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${rec.productImage}" alt="${rec.productName}">
            <div class="match-badge">${matchPercentage}% Match</div>
        </div>
        <div class="product-details">
            <h3 class="product-name">${rec.productName}</h3>
            <div class="shade-info">
                <div class="shade-swatch" style="background-color: ${rec.hexColor}"></div>
                <span class="shade-name">${rec.shadeName}</span>
            </div>
            <div class="product-price">£${rec.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn-primary add-to-cart" data-product="${rec.productId}" data-shade="${rec.shadeId}">
                    Add to Cart
                </button>
                <button class="btn-icon favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-product="${rec.productId}" 
                        data-shade="${rec.shadeId}"
                        aria-label="Add to favorites">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
            <button class="btn-secondary view-details" data-product="${rec.productId}" data-shade="${rec.shadeId}">
                View Details
            </button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.add-to-cart').addEventListener('click', handleAddToCart);
    card.querySelector('.favorite-btn').addEventListener('click', handleFavoriteToggle);
    card.querySelector('.view-details').addEventListener('click', handleViewDetails);
    
    // Add to comparison on click
    card.addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
            addToComparison(rec);
        }
    });
    
    return card;
}

// Handle add to cart
function handleAddToCart(e) {
    const productId = e.target.dataset.product;
    const shadeId = e.target.dataset.shade;
    
    // Add to cart logic (would integrate with e-commerce system)
    showToast('Added to cart!', 'success');
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('productAddedToCart', {
        detail: { productId, shadeId }
    }));
}

// Handle favorite toggle
function handleFavoriteToggle(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const shadeId = btn.dataset.shade;
    
    toggleFavorite(productId, shadeId);
    btn.classList.toggle('active');
    btn.classList.add('heart-pulse');
    setTimeout(() => btn.classList.remove('heart-pulse'), 600);
}

// Handle view details
function handleViewDetails(e) {
    e.stopPropagation();
    const productId = e.currentTarget.dataset.product;
    const shadeId = e.currentTarget.dataset.shade;
    
    showProductModal(productId, shadeId);
}

// Show product details modal
function showProductModal(productId, shadeId) {
    const product = allProducts.find(p => p.productId === productId);
    const shade = product.shades.find(s => s.shadeId === shadeId);
    const recommendation = currentRecommendations.find(r => r.productId === productId && r.shadeId === shadeId);
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="product-detail-content">
            <div class="detail-grid">
                <div class="detail-image">
                    <img src="${product.images?.main || generateProductImage(product.category)}" alt="${product.name}">
                </div>
                <div class="detail-info">
                    <h2>${product.name}</h2>
                    <div class="shade-display">
                        <div class="large-swatch" style="background-color: ${shade.hexColor}"></div>
                        <div>
                            <h3>${shade.name} (${shade.code})</h3>
                            <p class="undertone-info">Undertone: ${shade.undertone}</p>
                            <p class="match-info">
                                <strong>${Math.round(recommendation.matchScore * 100)}% Match</strong>
                                <br>
                                Color difference (ΔE): ${recommendation.deltaE.toFixed(1)}
                            </p>
                        </div>
                    </div>
                    <div class="price-section">
                        <span class="detail-price">£${product.price.toFixed(2)}</span>
                        ${shade.inStock ? '<span class="in-stock">✓ In Stock</span>' : '<span class="out-of-stock">Out of Stock</span>'}
                    </div>
                    <div class="features-list">
                        <h4>Features:</h4>
                        <ul>
                            ${product.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="skin-types">
                        <h4>Suitable for:</h4>
                        <p>${product.skinTypes.join(', ')}</p>
                    </div>
                    <div class="detail-actions">
                        <button class="btn-primary add-to-cart" data-product="${productId}" data-shade="${shadeId}">
                            Add to Cart
                        </button>
                        <button class="btn-secondary try-ar" disabled>
                            Try with AR (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
            <div class="description-section">
                <h4>Description</h4>
                <p>${product.description}</p>
            </div>
            <div class="ingredients-section">
                <h4>Key Ingredients</h4>
                <p>${product.ingredients.slice(0, 5).join(', ')}...</p>
            </div>
        </div>
    `;
    
    // Add event listeners to modal buttons
    modalBody.querySelector('.add-to-cart').addEventListener('click', handleAddToCart);
    
    // Show modal
    document.getElementById('product-modal').classList.add('active');
}

// Filter products by category
function filterProducts(category) {
    activeFilters.category = category;
    displayRecommendations(currentRecommendations);
}

// Sort products
function sortProducts(criteria) {
    activeFilters.sortBy = criteria;
    displayRecommendations(currentRecommendations);
}

// Generate placeholder product image
function generateProductImage(category) {
    const imageMap = {
        foundation: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        concealer: 'https://images.unsplash.com/photo-1631730486784-74b37b011c9f?w=400',
        lipstick: 'https://images.unsplash.com/photo-1586495777437-94f9e271e0e4?w=400',
        blush: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400',
        bronzer: 'https://images.unsplash.com/photo-1608979048467-6194dabc6a3d?w=400'
    };
    return imageMap[category] || imageMap.foundation;
}

// Generate sample products if none exist
function generateSampleProducts() {
    const sampleProducts = [];
    const categories = ['foundation', 'concealer', 'lipstick', 'blush', 'bronzer'];
    const productCounts = { foundation: 25, concealer: 20, lipstick: 15, blush: 10, bronzer: 5 };
    
    categories.forEach(category => {
        for (let i = 0; i < productCounts[category]; i++) {
            const product = {
                productId: `${category}-${i + 1}`,
                name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
                brand: 'Pippa of London',
                category: category,
                subcategory: category === 'foundation' ? 'liquid' : category,
                description: `Premium ${category} with buildable coverage and long-lasting formula.`,
                price: 25 + Math.random() * 40,
                currency: 'GBP',
                shades: generateShades(category),
                features: ['long-wearing', 'buildable', 'non-comedogenic'],
                skinTypes: ['all', 'dry', 'oily', 'combination'],
                ingredients: ['water', 'dimethicone', 'titanium dioxide', 'iron oxides'],
                images: {
                    main: generateProductImage(category)
                },
                createdAt: new Date().toISOString(),
                isActive: true
            };
            sampleProducts.push(product);
        }
    });
    
    localStorage.setItem('pippaProducts', JSON.stringify(sampleProducts));
}

// Generate shades for a product
function generateShades(category) {
    const shadeCount = {
        foundation: 12,
        concealer: 10,
        lipstick: 8,
        blush: 6,
        bronzer: 4
    };
    
    const shades = [];
    const count = shadeCount[category] || 6;
    
    for (let i = 0; i < count; i++) {
        const monkScale = Math.floor((i / count) * 10) + 1;
        const shade = {
            shadeId: `shade-${i + 1}`,
            name: getShadeNameForCategory(category, i),
            code: `${category.substring(0, 2).toUpperCase()}${String(i + 1).padStart(2, '0')}`,
            hexColor: generateHexForMonkScale(monkScale, category),
            undertone: ['cool', 'warm', 'neutral'][i % 3],
            coverage: category === 'foundation' ? 'full' : 'medium',
            labColor: hexToLAB(generateHexForMonkScale(monkScale, category)),
            fitzpatrickScale: Math.ceil(monkScale / 2),
            monkScale: monkScale,
            inStock: Math.random() > 0.1,
            popularity: Math.random() * 10
        };
        shades.push(shade);
    }
    
    return shades;
}

// Get shade name based on category and index
function getShadeNameForCategory(category, index) {
    const shadeNames = {
        foundation: ['Porcelain', 'Ivory', 'Vanilla', 'Natural', 'Beige', 'Sand', 'Golden', 'Honey', 'Caramel', 'Toffee', 'Mahogany', 'Ebony'],
        concealer: ['Fair', 'Light', 'Light-Medium', 'Medium', 'Medium-Tan', 'Tan', 'Deep', 'Deep-Tan', 'Rich', 'Extra Rich'],
        lipstick: ['Nude Pink', 'Rose', 'Berry', 'Mauve', 'Red', 'Coral', 'Plum', 'Wine'],
        blush: ['Baby Pink', 'Peach', 'Rose Gold', 'Berry', 'Coral', 'Bronze'],
        bronzer: ['Light Bronze', 'Medium Bronze', 'Deep Bronze', 'Rich Bronze']
    };
    
    return shadeNames[category][index] || `Shade ${index + 1}`;
}

// Generate hex color for Monk scale value
function generateHexForMonkScale(monkScale, category) {
    if (category === 'lipstick') {
        const lipColors = ['#FFB6C1', '#FF69B4', '#DC143C', '#C71585', '#8B008B', '#FF1493', '#FF6347', '#8B0000'];
        return lipColors[Math.min(monkScale - 1, lipColors.length - 1)];
    } else if (category === 'blush') {
        const blushColors = ['#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493', '#C71585'];
        return blushColors[Math.min(monkScale - 1, blushColors.length - 1)];
    } else {
        // Foundation, concealer, bronzer - skin tone colors
        const r = Math.floor(255 - (monkScale - 1) * 15);
        const g = Math.floor(224 - (monkScale - 1) * 18);
        const b = Math.floor(196 - (monkScale - 1) * 20);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// Convert hex to LAB color space (simplified)
function hexToLAB(hex) {
    // Simplified conversion - in real app would use proper color conversion
    const rgb = hexToRGB(hex);
    return {
        L: 100 - (rgb.r + rgb.g + rgb.b) / 7.65,
        a: (rgb.r - rgb.g) / 4,
        b: (rgb.g - rgb.b) / 4
    };
}

// Convert hex to RGB
function hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Export functions for use in other modules
window.recommendationModule = {
    loadRecommendations,
    filterProducts,
    sortProducts,
    getCurrentRecommendations: () => currentRecommendations
};