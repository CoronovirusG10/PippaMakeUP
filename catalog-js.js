// Catalog.js - Main product catalog functionality
// Pippa of London Beauty Platform

// Global variables
let products = [];
let filteredProducts = [];
let currentProduct = null;
let selectedShade = null;
let favorites = JSON.parse(localStorage.getItem('pippa_favorites') || '[]');

// Initialize catalog on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initializeEventListeners();
    
    // Check which page we're on
    if (document.getElementById('productsGrid')) {
        displayProducts();
        updateResultsCount();
    } else if (document.getElementById('productName')) {
        loadProductDetail();
    }
});

// Load products from localStorage
function loadProducts() {
    const storedProducts = localStorage.getItem('pippa_products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        filteredProducts = [...products];
    } else {
        console.error('No products found in database');
        // Initialize with sample data if needed
        products = [];
        filteredProducts = [];
    }
}

// Generate color swatch using Canvas API
function generateSwatch(hexColor, size = 50) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create circular swatch with border
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
    ctx.fillStyle = hexColor;
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add subtle gradient overlay for realism
    const gradient = ctx.createRadialGradient(size/3, size/3, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    return canvas.toDataURL();
}

// Product Management Functions
function getAllProducts() {
    return products;
}

function getProductById(id) {
    return products.find(p => p.productId === id);
}

function getProductsByCategory(category) {
    return products.filter(p => p.category === category);
}

function getShadeById(shadeId) {
    for (const product of products) {
        const shade = product.shades.find(s => s.shadeId === shadeId);
        if (shade) return { product, shade };
    }
    return null;
}

// Search and Filter Functions
function searchProducts(query) {
    query = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.features.some(f => f.toLowerCase().includes(query))
    );
}

function filterByUndertone(undertone) {
    return products.filter(p => 
        p.shades.some(s => s.undertone === undertone)
    );
}

function filterByPriceRange(min, max) {
    return products.filter(p => p.price >= min && p.price <= max);
}

function filterBySkinType(skinType) {
    return products.filter(p => p.skinTypes.includes(skinType));
}

function filterByShadeRange(monkMin, monkMax) {
    return products.filter(p => 
        p.shades.some(s => s.monkScale >= monkMin && s.monkScale <= monkMax)
    );
}

// Color Science Functions
function calculateDeltaE(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL*dL + da*da + db*db);
}

function findShadesInRange(labValues, tolerance = 5) {
    const matches = [];
    
    products.forEach(product => {
        product.shades.forEach(shade => {
            const deltaE = calculateDeltaE(labValues, shade.lab);
            if (deltaE <= tolerance) {
                matches.push({
                    product,
                    shade,
                    deltaE,
                    matchScore: 1 - (deltaE / tolerance)
                });
            }
        });
    });
    
    return matches.sort((a, b) => a.deltaE - b.deltaE);
}

function getSimilarUndertones(undertone) {
    const matches = [];
    
    products.forEach(product => {
        const matchingShades = product.shades.filter(s => s.undertone === undertone);
        if (matchingShades.length > 0) {
            matches.push({
                product,
                shades: matchingShades
            });
        }
    });
    
    return matches;
}

function calculateShadeDistance(shade1, shade2) {
    return calculateDeltaE(shade1.lab, shade2.lab);
}

// Display Functions
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        return;
    } else {
        document.getElementById('noResults').classList.add('hidden');
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.productId;
    
    // Create shade swatches
    const swatchesHtml = product.shades.slice(0, 6).map(shade => 
        `<img src="${generateSwatch(shade.hexColor, 30)}" alt="${shade.name}" title="${shade.name}" class="mini-swatch">`
    ).join('');
    
    const moreShades = product.shades.length > 6 ? `<span class="more-shades">+${product.shades.length - 6} more</span>` : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.images.main}" alt="${product.name}">
            ${favorites.includes(product.productId) ? '<span class="favorite-badge">♥</span>' : ''}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-category">${product.category}</p>
            <p class="product-price">£${product.price.toFixed(2)}</p>
            <div class="shade-preview">
                ${swatchesHtml}
                ${moreShades}
            </div>
            <button class="view-product-btn" onclick="viewProduct('${product.productId}')">View Details</button>
        </div>
    `;
    
    // Dispatch event for other modules
    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-product-btn')) {
            window.dispatchEvent(new CustomEvent('productSelected', {
                detail: { productId: product.productId }
            }));
        }
    });
    
    return card;
}

// Product Detail Page Functions
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    currentProduct = getProductById(productId);
    if (!currentProduct) {
        alert('Product not found');
        window.location.href = 'products.html';
        return;
    }
    
    displayProductDetail();
}

function displayProductDetail() {
    // Update breadcrumb
    document.getElementById('breadcrumbCategory').textContent = currentProduct.category;
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    
    // Update product info
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = currentProduct.price.toFixed(2);
    document.getElementById('productDescription').textContent = currentProduct.description;
    
    // Update images
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = currentProduct.images.main;
    
    // Update thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        const imageType = thumb.dataset.image;
        thumb.src = currentProduct.images[imageType] || currentProduct.images.main;
    });
    
    // Display shades
    displayShades();
    
    // Display features
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = currentProduct.features.map(f => `<li>${f}</li>`).join('');
    
    // Display ingredients
    document.getElementById('ingredientsList').textContent = currentProduct.ingredients.join(', ');
    
    // Display skin types
    const skinTypesList = document.getElementById('skinTypesList');
    skinTypesList.innerHTML = currentProduct.skinTypes.map(type => 
        `<span class="skin-type-tag">${type}</span>`
    ).join('');
    
    // Check if in favorites
    updateFavoriteButton();
    
    // Load related products
    loadRelatedProducts();
}

function displayShades() {
    const shadeGrid = document.getElementById('shadeGrid');
    shadeGrid.innerHTML = '';
    
    currentProduct.shades.forEach(shade => {
        const shadeButton = document.createElement('button');
        shadeButton.className = 'shade-button';
        shadeButton.dataset.shadeId = shade.shadeId;
        
        const swatch = document.createElement('img');
        swatch.src = generateSwatch(shade.hexColor, 40);
        swatch.alt = shade.name;
        
        const shadeName = document.createElement('span');
        shadeName.className = 'shade-button-name';
        shadeName.textContent = shade.name;
        
        shadeButton.appendChild(swatch);
        shadeButton.appendChild(shadeName);
        
        if (!shade.inStock) {
            shadeButton.classList.add('out-of-stock');
            shadeButton.disabled = true;
        }
        
        shadeButton.addEventListener('click', () => selectShade(shade));
        shadeGrid.appendChild(shadeButton);
    });
}

function selectShade(shade) {
    selectedShade = shade;
    
    // Update UI
    document.querySelectorAll('.shade-button').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.shadeId === shade.shadeId) {
            btn.classList.add('selected');
        }
    });
    
    // Update selected shade info
    document.getElementById('selectedShadeName').textContent = shade.name;
    document.getElementById('shadeDetails').classList.remove('hidden');
    
    // Update shade details
    document.getElementById('shadeUndertone').textContent = shade.undertone;
    document.getElementById('shadeMonkScale').textContent = `${shade.monkScale}/10`;
    document.getElementById('shadeCoverage').textContent = shade.coverage || 'Full';
    document.getElementById('shadeBestFor').textContent = `Fitzpatrick ${shade.fitzpatrickScale}`;
    
    // Enable add to cart button
    const addToCartBtn = document.getElementById('addToCart');
    addToCartBtn.disabled = false;
    addToCartBtn.textContent = 'Add to Cart';
    
    // Find similar shades
    findSimilarShades(shade);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('shadeSelected', {
        detail: { 
            productId: currentProduct.productId,
            shadeId: shade.shadeId,
            shade: shade
        }
    }));
}

function findSimilarShades(targetShade) {
    const similarContainer = document.getElementById('similarShades');
    similarContainer.innerHTML = '';
    
    const matches = findShadesInRange(targetShade.lab, 10);
    const topMatches = matches
        .filter(m => m.shade.shadeId !== targetShade.shadeId)
        .slice(0, 4);
    
    topMatches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'similar-shade-card';
        
        card.innerHTML = `
            <img src="${generateSwatch(match.shade.hexColor, 60)}" alt="${match.shade.name}">
            <h4>${match.product.name}</h4>
            <p>${match.shade.name}</p>
            <p class="match-score">${Math.round(match.matchScore * 100)}% match</p>
            <button onclick="viewProduct('${match.product.productId}')">View Product</button>
        `;
        
        similarContainer.appendChild(card);
    });
}

// Favorites Functions
function toggleFavorite() {
    if (!currentProduct) return;
    
    const productId = currentProduct.productId;
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    
    localStorage.setItem('pippa_favorites', JSON.stringify(favorites));
    updateFavoriteButton();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { favorites, productId }
    }));
}

function updateFavoriteButton() {
    const btn = document.getElementById('addToFavorites');
    if (!btn || !currentProduct) return;
    
    const isFavorite = favorites.includes(currentProduct.productId);
    btn.innerHTML = isFavorite ? 
        '<span class="heart-icon">♥</span><span>Remove from Favorites</span>' :
        '<span class="heart-icon">♡</span><span>Add to Favorites</span>';
}

// Event Listeners
function initializeEventListeners() {
    // Products page listeners
    if (document.getElementById('searchBtn')) {
        document.getElementById('searchBtn').addEventListener('click', performSearch);
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Filter listeners
    if (document.getElementById('categoryFilters')) {
        document.querySelectorAll('#categoryFilters input').forEach(input => {
            input.addEventListener('change', applyFilters);
        });
        
        document.querySelectorAll('#undertoneFilters input').forEach(input => {
            input.addEventListener('change', applyFilters);
        });
        
        document.querySelectorAll('#skinTypeFilters input').forEach(input => {
            input.addEventListener('change', applyFilters);
        });
        
        document.getElementById('priceRange').addEventListener('input', function(e) {
            document.getElementById('priceValue').textContent = e.target.value;
            applyFilters();
        });
        
        document.getElementById('monkMin').addEventListener('input', applyFilters);
        document.getElementById('monkMax').addEventListener('input', applyFilters);
        
        document.getElementById('sortSelect').addEventListener('change', sortProducts);
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
    }
    
    // Product detail page listeners
    if (document.getElementById('addToFavorites')) {
        document.getElementById('addToFavorites').addEventListener('click', toggleFavorite);
        
        document.getElementById('decreaseQty').addEventListener('click', () => {
            const qtyInput = document.getElementById('quantity');
            if (qtyInput.value > 1) qtyInput.value--;
        });
        
        document.getElementById('increaseQty').addEventListener('click', () => {
            const qtyInput = document.getElementById('quantity');
            if (qtyInput.value < 10) qtyInput.value++;
        });
        
        document.getElementById('addToCart').addEventListener('click', addToCart);
        
        // Thumbnail clicks
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const mainImage = document.getElementById('mainProductImage');
                mainImage.src = this.src;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Filter and Search Implementation
function performSearch() {
    const query = document.getElementById('searchInput').value;
    filteredProducts = query ? searchProducts(query) : [...products];
    applyFilters();
}

function applyFilters() {
    let filtered = [...filteredProducts];
    
    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('#categoryFilters input:checked'))
        .map(input => input.value);
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    
    // Undertone filter
    const selectedUndertones = Array.from(document.querySelectorAll('#undertoneFilters input:checked'))
        .map(input => input.value);
    if (selectedUndertones.length > 0) {
        filtered = filtered.filter(p => 
            p.shades.some(s => selectedUndertones.includes(s.undertone))
        );
    }
    
    // Skin type filter
    const selectedSkinTypes = Array.from(document.querySelectorAll('#skinTypeFilters input:checked'))
        .map(input => input.value);
    if (selectedSkinTypes.length > 0) {
        filtered = filtered.filter(p => 
            p.skinTypes.some(st => selectedSkinTypes.includes(st))
        );
    }
    
    // Price filter
    const maxPrice = parseFloat(document.getElementById('priceRange').value);
    filtered = filtered.filter(p => p.price <= maxPrice);
    
    // Monk scale filter
    const monkMin = parseInt(document.getElementById('monkMin').value);
    const monkMax = parseInt(document.getElementById('monkMax').value);
    filtered = filtered.filter(p => 
        p.shades.some(s => s.monkScale >= monkMin && s.monkScale <= monkMax)
    );
    
    filteredProducts = filtered;
    displayProducts();
    updateResultsCount();
}

function sortProducts() {
    const sortBy = document.getElementById('sortSelect').value;
    
    switch(sortBy) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popularity':
            filteredProducts.sort((a, b) => {
                const avgPopA = a.shades.reduce((sum, s) => sum + s.popularity, 0) / a.shades.length;
                const avgPopB = b.shades.reduce((sum, s) => sum + s.popularity, 0) / b.shades.length;
                return avgPopB - avgPopA;
            });
            break;
    }
    
    displayProducts();
}

function resetFilters() {
    // Reset all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    
    // Reset sliders
    document.getElementById('priceRange').value = 100;
    document.getElementById('priceValue').textContent = '100';
    document.getElementById('monkMin').value = 1;
    document.getElementById('monkMax').value = 10;
    document.getElementById('monkMinValue').textContent = '1';
    document.getElementById('monkMaxValue').textContent = '10';
    
    // Reset search
    document.getElementById('searchInput').value = '';
    
    // Reset filtered products
    filteredProducts = [...products];
    displayProducts();
    updateResultsCount();
}

function updateResultsCount() {
    const count = document.getElementById('resultsCount');
    if (count) {
        count.textContent = `${filteredProducts.length} products found`;
    }
}

// Cart Functions (placeholder)
function addToCart() {
    if (!selectedShade) {
        alert('Please select a shade');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // For prototype, just show success message
    alert(`Added ${quantity}x ${currentProduct.name} - ${selectedShade.name} to cart!`);
    
    // In real implementation, would update cart in localStorage
    // and dispatch cart update event
}

// Related Products
function loadRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    // Get products from same category
    const related = products
        .filter(p => p.category === currentProduct.category && p.productId !== currentProduct.productId)
        .slice(0, 4);
    
    container.innerHTML = '';
    related.forEach(product => {
        const card = createProductCard(product);
        card.classList.add('related-product-card');
        container.appendChild(card);
    });
}

// Export functions for other modules
window.CatalogAPI = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getShadeById,
    searchProducts,
    filterByUndertone,
    filterByPriceRange,
    filterBySkinType,
    filterByShadeRange,
    findShadesInRange,
    getSimilarUndertones,
    calculateShadeDistance,
    calculateDeltaE,
    generateSwatch
};

// Dispatch catalog loaded event
window.addEventListener('load', () => {
    window.dispatchEvent(new CustomEvent('catalogLoaded', {
        detail: { productCount: products.length }
    }));
});