// color-matching.js - Match skin tones to product shades

// Matching configuration
const MATCHING_CONFIG = {
    maxDeltaE: 10, // Maximum acceptable color difference
    topMatchesPerCategory: 3,
    undertoneWeight: 0.3, // Weight for undertone matching
    colorWeight: 0.7, // Weight for color distance
};

// Find best product matches for analyzed skin tone
async function findBestMatches(skinToneData, productDatabase) {
    const { performanceTracker } = window.ColorAnalysisUtils;
    performanceTracker.start('findBestMatches');
    
    try {
        window.showProgress('Finding perfect matches...', 80);
        
        // Get products from database (or use mock data)
        const products = productDatabase || window.getProductCatalog();
        
        if (!products || products.length === 0) {
            throw new Error('No products available for matching');
        }
        
        // Calculate matches for all products
        const allMatches = [];
        
        products.forEach(product => {
            if (!product.shades || product.shades.length === 0) return;
            
            product.shades.forEach(shade => {
                const match = calculateShadeMatch(skinToneData, product, shade);
                if (match) {
                    allMatches.push(match);
                }
            });
        });
        
        // Sort by match score
        allMatches.sort((a, b) => b.matchScore - a.matchScore);
        
        // Group by category and get top matches
        const categorizedMatches = categorizeBestMatches(allMatches);
        
        window.showProgress('Matches found!', 90);
        
        performanceTracker.end('findBestMatches');
        
        return {
            allMatches: allMatches.slice(0, 20), // Top 20 overall
            byCategory: categorizedMatches,
            bestMatch: allMatches[0] || null
        };
        
    } catch (error) {
        performanceTracker.end('findBestMatches');
        console.error('Product matching error:', error);
        throw error;
    }
}

// Calculate match score for a single shade
function calculateShadeMatch(skinToneData, product, shade) {
    // Skip if shade doesn't have color data
    if (!shade.deltaE || (!shade.hexColor && !shade.lab)) {
        return null;
    }
    
    // Get shade LAB values
    let shadeLab;
    if (shade.lab) {
        shadeLab = shade.lab;
    } else if (shade.deltaE) {
        // Use deltaE values as LAB (simplified for prototype)
        shadeLab = {
            L: shade.deltaE.L,
            a: shade.deltaE.a,
            b: shade.deltaE.b
        };
    } else {
        return null;
    }
    
    // Calculate color distance
    const deltaE = window.ColorAnalysisUtils.calculateDeltaE(skinToneData.lab, shadeLab);
    
    // Skip if color difference is too large
    if (deltaE > MATCHING_CONFIG.maxDeltaE) {
        return null;
    }
    
    // Calculate undertone match
    const undertoneMatch = shade.undertone === skinToneData.undertone;
    const undertoneScore = undertoneMatch ? 1.0 : 0.5;
    
    // Calculate color match score (inverse of deltaE, normalized)
    const colorScore = 1 - (deltaE / MATCHING_CONFIG.maxDeltaE);
    
    // Calculate combined match score
    const matchScore = (colorScore * MATCHING_CONFIG.colorWeight) + 
                      (undertoneScore * MATCHING_CONFIG.undertoneWeight);
    
    // Get shade hex color
    let hexColor = shade.hexColor;
    if (!hexColor && shade.lab) {
        const rgb = window.ColorAnalysisUtils.labToRgb(shade.lab);
        hexColor = window.ColorAnalysisUtils.rgbToHex(rgb);
    } else if (!hexColor) {
        // Generate from deltaE values (approximation)
        const rgb = window.ColorAnalysisUtils.labToRgb(shadeLab);
        hexColor = window.ColorAnalysisUtils.rgbToHex(rgb);
    }
    
    return {
        productId: product.productId,
        shadeId: shade.shadeId,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        shadeName: shade.name,
        shadeCode: shade.code,
        hexColor: hexColor,
        deltaE: deltaE,
        matchScore: matchScore,
        undertoneMatch: undertoneMatch,
        monkScale: shade.monkScale,
        price: product.price,
        currency: product.currency
    };
}

// Categorize matches by product type
function categorizeBestMatches(allMatches) {
    const categories = {};
    
    allMatches.forEach(match => {
        if (!categories[match.category]) {
            categories[match.category] = [];
        }
        
        // Only keep top N matches per category
        if (categories[match.category].length < MATCHING_CONFIG.topMatchesPerCategory) {
            categories[match.category].push(match);
        }
    });
    
    return categories;
}

// Rank matches based on user preferences
function rankMatches(matches, userPreferences) {
    if (!userPreferences) return matches;
    
    // Apply preference-based scoring adjustments
    return matches.map(match => {
        let adjustedScore = match.matchScore;
        
        // Adjust for price preference
        if (userPreferences.priceRange) {
            const inRange = match.price >= userPreferences.priceRange.min && 
                           match.price <= userPreferences.priceRange.max;
            adjustedScore *= inRange ? 1.1 : 0.9;
        }
        
        // Adjust for brand preference
        if (userPreferences.preferredBrands && 
            userPreferences.preferredBrands.includes(match.brand)) {
            adjustedScore *= 1.2;
        }
        
        // Adjust for coverage preference
        if (userPreferences.coverage && match.coverage === userPreferences.coverage) {
            adjustedScore *= 1.1;
        }
        
        return {
            ...match,
            adjustedScore: Math.min(1.0, adjustedScore)
        };
    }).sort((a, b) => b.adjustedScore - a.adjustedScore);
}

// Generate product recommendations based on matches and history
function generateRecommendations(matches, userHistory) {
    const recommendations = {};
    
    // Get unique categories from matches
    const categories = [...new Set(matches.allMatches.map(m => m.category))];
    
    categories.forEach(category => {
        const categoryMatches = matches.byCategory[category] || [];
        
        // Get shade IDs for this category
        recommendations[category] = categoryMatches.map(match => ({
            productId: match.productId,
            shadeId: match.shadeId,
            reason: getRecommendationReason(match),
            confidence: match.matchScore
        }));
    });
    
    // Add complementary product recommendations
    if (recommendations.foundation && recommendations.foundation.length > 0) {
        // Suggest matching concealer
        if (!recommendations.concealer) {
            recommendations.concealer = generateComplementaryRecommendations('concealer', matches);
        }
        
        // Suggest bronzer for contouring
        if (!recommendations.bronzer) {
            recommendations.bronzer = generateComplementaryRecommendations('bronzer', matches);
        }
    }
    
    return recommendations;
}

// Generate recommendation reason text
function getRecommendationReason(match) {
    const reasons = [];
    
    if (match.deltaE < 2) {
        reasons.push('Perfect color match');
    } else if (match.deltaE < 4) {
        reasons.push('Excellent color match');
    } else {
        reasons.push('Good color match');
    }
    
    if (match.undertoneMatch) {
        reasons.push('matching undertone');
    }
    
    return reasons.join(' with ');
}

// Generate complementary product recommendations
function generateComplementaryRecommendations(category, matches) {
    // Simple logic for prototype
    // In production, would use more sophisticated algorithms
    
    const skinToneMonk = matches.bestMatch ? matches.bestMatch.monkScale : 5;
    
    if (category === 'concealer') {
        // Concealer should be slightly lighter than foundation
        return [{
            recommendation: 'one_shade_lighter',
            reason: 'Brightening effect'
        }];
    } else if (category === 'bronzer') {
        // Bronzer should be 2-3 shades darker
        return [{
            recommendation: 'two_shades_darker',
            reason: 'Natural contouring'
        }];
    }
    
    return [];
}

// Filter matches by specific criteria
function filterMatches(matches, filters) {
    if (!filters) return matches;
    
    return matches.filter(match => {
        // Filter by undertone
        if (filters.undertone && match.undertone !== filters.undertone) {
            return false;
        }
        
        // Filter by price range
        if (filters.priceRange) {
            if (match.price < filters.priceRange.min || 
                match.price > filters.priceRange.max) {
                return false;
            }
        }
        
        // Filter by category
        if (filters.category && match.category !== filters.category) {
            return false;
        }
        
        // Filter by brand
        if (filters.brands && filters.brands.length > 0) {
            if (!filters.brands.includes(match.brand)) {
                return false;
            }
        }
        
        return true;
    });
}

// Compare two shades
function compareShades(shade1, shade2) {
    // Calculate color difference
    const deltaE = window.ColorAnalysisUtils.calculateDeltaE(shade1.lab, shade2.lab);
    
    // Compare undertones
    const sameUndertone = shade1.undertone === shade2.undertone;
    
    // Compare Monk Scale values
    const monkDifference = Math.abs(shade1.monkScale - shade2.monkScale);
    
    return {
        colorDifference: deltaE,
        sameUndertone,
        monkDifference,
        recommendation: getComparisonRecommendation(deltaE, sameUndertone, monkDifference)
    };
}

// Get comparison recommendation text
function getComparisonRecommendation(deltaE, sameUndertone, monkDifference) {
    if (deltaE < 2 && sameUndertone) {
        return 'These shades are nearly identical';
    } else if (deltaE < 4 && sameUndertone) {
        return 'Very similar shades with matching undertones';
    } else if (deltaE < 6) {
        return 'Similar shades with slight differences';
    } else if (monkDifference <= 1) {
        return 'Different colors but suitable for similar skin tones';
    } else {
        return 'Noticeably different shades';
    }
}

// Export functions
window.ColorMatching = {
    findBestMatches,
    rankMatches,
    generateRecommendations,
    filterMatches,
    compareShades
};