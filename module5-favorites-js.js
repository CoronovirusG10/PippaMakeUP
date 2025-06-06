// favorites.js - Manage user's favorite products for Pippa of London

// Initialize favorites from localStorage
let userFavorites = [];

// Initialize favorites module
function initializeFavorites() {
    loadFavorites();
    updateFavoritesCount();
    
    // Listen for favorites updates from other pages
    window.addEventListener('favoritesUpdated', () => {
        loadFavorites();
        updateFavoritesCount();
    });
}

// Load favorites from localStorage
function loadFavorites() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;
    
    const favoritesKey = `favorites_${currentUser.userId}`;
    const savedFavorites = localStorage.getItem(favoritesKey);
    
    if (savedFavorites) {
        userFavorites = JSON.parse(savedFavorites);
    } else {
        userFavorites = [];
    }
}

// Save favorites to localStorage
function saveFavorites() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;
    
    const favoritesKey = `favorites_${currentUser.userId}`;
    localStorage.setItem(favoritesKey, JSON.stringify(userFavorites));
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { favorites: userFavorites }
    }));
}

// Check if a product/shade is favorited
function checkIfFavorite(productId, shadeId) {
    return userFavorites.some(fav => 
        fav.productId === productId && fav.shadeId === shadeId
    );
}

// Toggle favorite status
function toggleFavorite(productId, shadeId) {
    const index = userFavorites.findIndex(fav => 
        fav.productId === productId && fav.shadeId === shadeId
    );
    
    if (index > -1) {
        // Remove from favorites
        userFavorites.splice(index, 1);
        showToast('Removed from favorites', 'success');
    } else {
        // Add to favorites
        const recommendation = currentRecommendations.find(rec => 
            rec.productId === productId && rec.shadeId === shadeId
        );
        
        if (recommendation) {
            const favorite = {
                productId: recommendation.productId,
                shadeId: recommendation.shadeId,
                productName: recommendation.productName,
                shadeName: recommendation.shadeName,
                hexColor: recommendation.hexColor,
                price: recommendation.price,
                category: recommendation.category,
                productImage: recommendation.productImage,
                matchScore: recommendation.matchScore,
                addedAt: new Date().toISOString()
            };
            
            userFavorites.unshift(favorite); // Add to beginning
            showToast('Added to favorites!', 'success');
        }
    }
    
    saveFavorites();
    updateFavoritesCount();
}

// Update favorites count in UI
function updateFavoritesCount() {
    const countElement = document.getElementById('fav-count');
    if (countElement) {
        countElement.textContent = userFavorites.length;
    }
}

// Show favorites modal
function showFavoritesModal() {
    const modalBody = document.getElementById('modal-body');
    
    if (userFavorites.length === 0) {
        modalBody.innerHTML = `
            <div class="favorites-empty">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" style="color: var(--neutral-400);">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h3>No favorites yet</h3>
                <p>Products you love will appear here</p>
                <button class="btn-primary" onclick="document.getElementById('product-modal').classList.remove('active')">
                    Continue Shopping
                </button>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="favorites-content">
                <h2>Your Favorites (${userFavorites.length})</h2>
                <div class="favorites-grid">
                    ${userFavorites.map(fav => createFavoriteCard(fav)).join('')}
                </div>
                <div class="favorites-actions">
                    <button class="btn-secondary" id="share-favorites">Share Favorites</button>
                    <button class="btn-primary" id="shop-favorites">Shop All Favorites</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modalBody.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', handleRemoveFavorite);
        });
        
        modalBody.querySelector('#share-favorites').addEventListener('click', shareFavorites);
        modalBody.querySelector('#shop-favorites').addEventListener('click', shopAllFavorites);
    }
    
    document.getElementById('product-modal').classList.add('active');
}

// Create favorite card HTML
function createFavoriteCard(favorite) {
    const matchPercentage = Math.round(favorite.matchScore * 100);
    
    return `
        <div class="favorite-card" data-product="${favorite.productId}" data-shade="${favorite.shadeId}">
            <div class="favorite-image">
                <img src="${favorite.productImage}" alt="${favorite.productName}">
                ${favorite.matchScore ? `<div class="match-badge">${matchPercentage}% Match</div>` : ''}
            </div>
            <div class="favorite-details">
                <h4>${favorite.productName}</h4>
                <div class="shade-info">
                    <div class="shade-swatch" style="background-color: ${favorite.hexColor}"></div>
                    <span>${favorite.shadeName}</span>
                </div>
                <div class="favorite-price">£${favorite.price.toFixed(2)}</div>
                <div class="favorite-actions">
                    <button class="btn-primary btn-sm add-to-cart" 
                            data-product="${favorite.productId}" 
                            data-shade="${favorite.shadeId}">
                        Add to Cart
                    </button>
                    <button class="btn-icon remove-favorite" 
                            data-product="${favorite.productId}" 
                            data-shade="${favorite.shadeId}"
                            aria-label="Remove from favorites">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Handle remove from favorites
function handleRemoveFavorite(e) {
    e.stopPropagation();
    const productId = e.currentTarget.dataset.product;
    const shadeId = e.currentTarget.dataset.shade;
    
    toggleFavorite(productId, shadeId);
    
    // Update the modal content
    showFavoritesModal();
    
    // Update favorite buttons in product grid
    const favoriteBtn = document.querySelector(`.favorite-btn[data-product="${productId}"][data-shade="${shadeId}"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.remove('active');
    }
}

// Share favorites list
function shareFavorites() {
    // Create shareable favorites list
    const favoritesText = userFavorites.map(fav => 
        `${fav.productName} - ${fav.shadeName}`
    ).join('\n');
    
    const shareData = {
        title: 'My Pippa of London Favorites',
        text: `Check out my favorite shades:\n${favoritesText}`,
        url: window.location.origin
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showToast('Favorites shared!', 'success'))
            .catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        const textToCopy = `My Pippa of London Favorites:\n${favoritesText}\n\nShop at: ${window.location.origin}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => showToast('Favorites copied to clipboard!', 'success'))
            .catch(err => showToast('Could not copy favorites', 'error'));
    }
}

// Shop all favorites
function shopAllFavorites() {
    // Add all favorites to cart
    userFavorites.forEach(fav => {
        window.dispatchEvent(new CustomEvent('productAddedToCart', {
            detail: { 
                productId: fav.productId, 
                shadeId: fav.shadeId 
            }
        }));
    });
    
    showToast(`Added ${userFavorites.length} items to cart!`, 'success');
    document.getElementById('product-modal').classList.remove('active');
}

// Get favorites by category
function getFavoritesByCategory(category) {
    if (category === 'all') {
        return userFavorites;
    }
    return userFavorites.filter(fav => fav.category === category);
}

// Export favorites data for analysis
function exportFavoritesData() {
    return {
        count: userFavorites.length,
        categories: userFavorites.reduce((acc, fav) => {
            acc[fav.category] = (acc[fav.category] || 0) + 1;
            return acc;
        }, {}),
        avgMatchScore: userFavorites.reduce((sum, fav) => sum + (fav.matchScore || 0), 0) / userFavorites.length,
        favorites: userFavorites
    };
}

// Clear all favorites
function clearAllFavorites() {
    if (confirm('Are you sure you want to remove all favorites?')) {
        userFavorites = [];
        saveFavorites();
        updateFavoritesCount();
        showToast('All favorites removed', 'success');
        
        // Update all favorite buttons
        document.querySelectorAll('.favorite-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

// Add custom styles for favorites modal
const favoritesStyles = `
<style>
.favorites-empty {
    text-align: center;
    padding: var(--spacing-3xl);
    color: var(--neutral-600);
}

.favorites-empty h3 {
    margin-top: var(--spacing-lg);
    color: var(--neutral-700);
}

.favorites-content h2 {
    margin-bottom: var(--spacing-lg);
    text-align: center;
}

.favorites-grid {
    display: grid;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    max-height: 60vh;
    overflow-y: auto;
    padding: var(--spacing-sm);
}

.favorite-card {
    display: flex;
    gap: var(--spacing-md);
    background: var(--neutral-100);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    transition: all 0.3s;
}

.favorite-card:hover {
    background: var(--neutral-200);
}

.favorite-image {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}

.favorite-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.favorite-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.favorite-details h4 {
    font-size: 1rem;
    margin-bottom: 0;
}

.favorite-price {
    font-weight: 600;
    color: var(--neutral-900);
}

.favorite-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: auto;
}

.btn-sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.75rem;
}

.favorites-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

/* Product detail modal styles */
.product-detail-content {
    padding: var(--spacing-lg);
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}

.detail-image img {
    width: 100%;
    border-radius: var(--radius-md);
}

.shade-display {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.large-swatch {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
}

.price-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.detail-price {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--neutral-900);
}

.in-stock {
    color: #4CAF50;
    font-weight: 500;
}

.out-of-stock {
    color: #F44336;
    font-weight: 500;
}

.features-list ul {
    list-style: none;
    padding: 0;
}

.features-list li {
    padding: var(--spacing-xs) 0;
    position: relative;
    padding-left: var(--spacing-lg);
}

.features-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--primary-pink);
    font-weight: bold;
}

.detail-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }
    
    .favorites-grid {
        max-height: 50vh;
    }
    
    .favorite-card {
        flex-direction: column;
        text-align: center;
    }
    
    .favorite-image {
        margin: 0 auto;
    }
}
</style>
`;

// Inject styles when module loads
if (!document.getElementById('favorites-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'favorites-styles';
    styleElement.innerHTML = favoritesStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Export functions for use in other modules
window.favoritesModule = {
    initializeFavorites,
    toggleFavorite,
    checkIfFavorite,
    showFavoritesModal,
    getFavoritesByCategory,
    exportFavoritesData,
    clearAllFavorites
};