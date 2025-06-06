// Search.js - Advanced search functionality for Pippa of London
// Handles text search, fuzzy matching, and caching

// Search cache for performance
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce function for search input
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

// Enhanced search with fuzzy matching
function enhancedSearch(query, products) {
    query = query.toLowerCase().trim();
    
    // Check cache first
    const cacheKey = query;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.results;
    }
    
    if (!query) {
        return products;
    }
    
    // Split query into terms
    const terms = query.split(/\s+/);
    
    // Score each product based on relevance
    const scoredProducts = products.map(product => {
        let score = 0;
        
        // Check product name (highest weight)
        terms.forEach(term => {
            if (product.name.toLowerCase().includes(term)) {
                score += 10;
            }
        });
        
        // Check category
        terms.forEach(term => {
            if (product.category.toLowerCase().includes(term)) {
                score += 8;
            }
        });
        
        // Check subcategory
        if (product.subcategory) {
            terms.forEach(term => {
                if (product.subcategory.toLowerCase().includes(term)) {
                    score += 6;
                }
            });
        }
        
        // Check description
        terms.forEach(term => {
            if (product.description.toLowerCase().includes(term)) {
                score += 5;
            }
        });
        
        // Check features
        product.features.forEach(feature => {
            terms.forEach(term => {
                if (feature.toLowerCase().includes(term)) {
                    score += 4;
                }
            });
        });
        
        // Check shade names
        product.shades.forEach(shade => {
            terms.forEach(term => {
                if (shade.name.toLowerCase().includes(term)) {
                    score += 3;
                }
                if (shade.undertone && shade.undertone.includes(term)) {
                    score += 3;
                }
            });
        });
        
        // Check skin types
        product.skinTypes.forEach(type => {
            terms.forEach(term => {
                if (type.toLowerCase().includes(term)) {
                    score += 2;
                }
            });
        });
        
        return { product, score };
    });
    
    // Filter and sort by score
    const results = scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
    
    // Cache results
    searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
    });
    
    return results;
}

// Search suggestions/autocomplete
function getSearchSuggestions(query, products) {
    if (!query || query.length < 2) {
        return [];
    }
    
    query = query.toLowerCase();
    const suggestions = new Set();
    
    // Add matching product names
    products.forEach(product => {
        if (product.name.toLowerCase().includes(query)) {
            suggestions.add(product.name);
        }
    });
    
    // Add matching categories
    const categories = ['foundation', 'concealer', 'lipstick', 'blush', 'bronzer'];
    categories.forEach(cat => {
        if (cat.includes(query)) {
            suggestions.add(cat);
        }
    });
    
    // Add matching features
    const commonFeatures = ['long-wearing', 'buildable', 'non-comedogenic', 'hydrating', 'matte', 'natural'];
    commonFeatures.forEach(feature => {
        if (feature.includes(query)) {
            suggestions.add(feature);
        }
    });
    
    // Add matching shade names
    products.forEach(product => {
        product.shades.forEach(shade => {
            if (shade.name.toLowerCase().includes(query)) {
                suggestions.add(shade.name);
            }
        });
    });
    
    return Array.from(suggestions).slice(0, 8); // Return top 8 suggestions
}

// Advanced filtering by multiple criteria
function advancedFilter(products, filters) {
    let filtered = [...products];
    
    // Text search
    if (filters.searchQuery) {
        filtered = enhancedSearch(filters.searchQuery, filtered);
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
        filtered = filtered.filter(p => filters.categories.includes(p.category));
    }
    
    // Undertone filter
    if (filters.undertones && filters.undertones.length > 0) {
        filtered = filtered.filter(p => 
            p.shades.some(s => filters.undertones.includes(s.undertone))
        );
    }
    
    // Skin type filter
    if (filters.skinTypes && filters.skinTypes.length > 0) {
        filtered = filtered.filter(p => 
            p.skinTypes.some(st => filters.skinTypes.includes(st))
        );
    }
    
    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filtered = filtered.filter(p => {
            if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
            if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
            return true;
        });
    }
    
    // Monk scale range
    if (filters.monkMin !== undefined || filters.monkMax !== undefined) {
        filtered = filtered.filter(p => 
            p.shades.some(s => {
                if (filters.monkMin !== undefined && s.monkScale < filters.monkMin) return false;
                if (filters.monkMax !== undefined && s.monkScale > filters.monkMax) return false;
                return true;
            })
        );
    }
    
    // Features filter
    if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter(p => 
            filters.features.every(feature => 
                p.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
            )
        );
    }
    
    // Coverage filter (for foundations/concealers)
    if (filters.coverage && filters.coverage.length > 0) {
        filtered = filtered.filter(p => 
            p.shades.some(s => s.coverage && filters.coverage.includes(s.coverage))
        );
    }
    
    // In stock only
    if (filters.inStockOnly) {
        filtered = filtered.filter(p => 
            p.shades.some(s => s.inStock)
        );
    }
    
    return filtered;
}

// Sort products by various criteria
function sortProductsBy(products, sortBy, order = 'asc') {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'name':
            sorted.sort((a, b) => {
                const compare = a.name.localeCompare(b.name);
                return order === 'asc' ? compare : -compare;
            });
            break;
            
        case 'price':
            sorted.sort((a, b) => {
                const compare = a.price - b.price;
                return order === 'asc' ? compare : -compare;
            });
            break;
            
        case 'popularity':
            sorted.sort((a, b) => {
                const avgPopA = a.shades.reduce((sum, s) => sum + s.popularity, 0) / a.shades.length;
                const avgPopB = b.shades.reduce((sum, s) => sum + s.popularity, 0) / b.shades.length;
                const compare = avgPopA - avgPopB;
                return order === 'asc' ? compare : -compare;
            });
            break;
            
        case 'shadeRange':
            sorted.sort((a, b) => {
                const compare = a.shades.length - b.shades.length;
                return order === 'asc' ? compare : -compare;
            });
            break;
            
        case 'newest':
            sorted.sort((a, b) => {
                const compare = new Date(b.createdAt) - new Date(a.createdAt);
                return order === 'asc' ? -compare : compare;
            });
            break;
    }
    
    return sorted;
}

// Find products by specific shade characteristics
function findProductsByShadeCharacteristics(products, characteristics) {
    const matches = [];
    
    products.forEach(product => {
        const matchingShades = product.shades.filter(shade => {
            let match = true;
            
            if (characteristics.hexColor) {
                match = match && shade.hexColor.toLowerCase() === characteristics.hexColor.toLowerCase();
            }
            
            if (characteristics.undertone) {
                match = match && shade.undertone === characteristics.undertone;
            }
            
            if (characteristics.monkScale !== undefined) {
                match = match && shade.monkScale === characteristics.monkScale;
            }
            
            if (characteristics.fitzpatrickScale !== undefined) {
                match = match && shade.fitzpatrickScale === characteristics.fitzpatrickScale;
            }
            
            if (characteristics.labTolerance && characteristics.labValues) {
                const deltaE = window.CatalogAPI.calculateDeltaE(shade.lab, characteristics.labValues);
                match = match && deltaE <= characteristics.labTolerance;
            }
            
            return match;
        });
        
        if (matchingShades.length > 0) {
            matches.push({
                product,
                matchingShades
            });
        }
    });
    
    return matches;
}

// Search history management
const searchHistory = {
    getHistory: function() {
        return JSON.parse(localStorage.getItem('pippa_search_history') || '[]');
    },
    
    addToHistory: function(query) {
        if (!query || query.length < 2) return;
        
        let history = this.getHistory();
        
        // Remove if already exists
        history = history.filter(item => item.query !== query);
        
        // Add to beginning
        history.unshift({
            query,
            timestamp: Date.now()
        });
        
        // Keep only last 10 searches
        history = history.slice(0, 10);
        
        localStorage.setItem('pippa_search_history', JSON.stringify(history));
    },
    
    clearHistory: function() {
        localStorage.removeItem('pippa_search_history');
    }
};

// Popular searches
function getPopularSearches() {
    return [
        'foundation',
        'matte lipstick',
        'natural blush',
        'full coverage',
        'cool undertone',
        'long-wearing',
        'sensitive skin',
        'bronzer'
    ];
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // Add debounced search
    const debouncedSearch = debounce(() => {
        performSearch();
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
    
    // Add search suggestions (if implementing autocomplete)
    // This would require additional UI elements
}

// Clear search cache periodically
setInterval(() => {
    const now = Date.now();
    searchCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
            searchCache.delete(key);
        }
    });
}, 60000); // Check every minute

// Export search functions
window.SearchAPI = {
    enhancedSearch,
    getSearchSuggestions,
    advancedFilter,
    sortProductsBy,
    findProductsByShadeCharacteristics,
    searchHistory,
    getPopularSearches,
    initializeSearch
};