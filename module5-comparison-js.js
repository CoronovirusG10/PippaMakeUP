// comparison.js - Shade comparison functionality for Pippa of London

// Global variables for comparison
let comparisonSlots = {
    slot1: null,
    slot2: null
};

// Initialize comparison module
function initializeComparison() {
    setupComparisonListeners();
    loadSavedComparison();
}

// Set up comparison event listeners
function setupComparisonListeners() {
    // Clear comparison button
    const clearBtn = document.getElementById('clear-comparison');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearComparison);
    }
    
    // Listen for shade selection events
    window.addEventListener('shadeSelected', handleShadeSelection);
}

// Add shade to comparison
function addToComparison(recommendation) {
    // Check if shade is already in comparison
    if (isInComparison(recommendation.productId, recommendation.shadeId)) {
        showToast('This shade is already in comparison', 'warning');
        return;
    }
    
    // Add to first available slot
    if (!comparisonSlots.slot1) {
        comparisonSlots.slot1 = recommendation;
        updateComparisonSlot('slot-1', recommendation);
    } else if (!comparisonSlots.slot2) {
        comparisonSlots.slot2 = recommendation;
        updateComparisonSlot('slot-2', recommendation);
        // Both slots filled - show comparison
        performComparison();
    } else {
        // Both slots full - replace slot 2
        comparisonSlots.slot2 = recommendation;
        updateComparisonSlot('slot-2', recommendation);
        performComparison();
    }
    
    saveComparison();
    
    // Scroll to comparison section
    document.getElementById('comparison-tool').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// Check if shade is already in comparison
function isInComparison(productId, shadeId) {
    return (comparisonSlots.slot1?.productId === productId && comparisonSlots.slot1?.shadeId === shadeId) ||
           (comparisonSlots.slot2?.productId === productId && comparisonSlots.slot2?.shadeId === shadeId);
}

// Update comparison slot UI
function updateComparisonSlot(slotId, recommendation) {
    const slot = document.getElementById(slotId);
    
    if (!recommendation) {
        // Empty slot
        slot.innerHTML = `
            <div class="slot-placeholder">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                <p>Select a shade to compare</p>
            </div>
        `;
        slot.classList.remove('filled');
    } else {
        // Filled slot
        slot.innerHTML = `
            <div class="comparison-shade-card">
                <button class="remove-from-comparison" data-slot="${slotId}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <div class="comparison-swatch" style="background-color: ${recommendation.hexColor}"></div>
                <h4>${recommendation.productName}</h4>
                <p class="shade-name">${recommendation.shadeName}</p>
                <p class="undertone">${recommendation.undertone} undertone</p>
                <p class="match-score">${Math.round(recommendation.matchScore * 100)}% match</p>
            </div>
        `;
        slot.classList.add('filled');
        
        // Add remove listener
        slot.querySelector('.remove-from-comparison').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromComparison(slotId);
        });
    }
}

// Remove shade from comparison
function removeFromComparison(slotId) {
    if (slotId === 'slot-1') {
        comparisonSlots.slot1 = null;
    } else {
        comparisonSlots.slot2 = null;
    }
    
    updateComparisonSlot(slotId, null);
    
    // Hide comparison results if no shades to compare
    if (!comparisonSlots.slot1 || !comparisonSlots.slot2) {
        document.getElementById('comparison-results').style.display = 'none';
    }
    
    saveComparison();
}

// Perform shade comparison
function performComparison() {
    if (!comparisonSlots.slot1 || !comparisonSlots.slot2) return;
    
    const shade1 = comparisonSlots.slot1;
    const shade2 = comparisonSlots.slot2;
    
    // Calculate color difference
    const deltaE = calculateColorDifference(shade1, shade2);
    
    // Compare undertones
    const undertoneMatch = shade1.undertone === shade2.undertone;
    
    // Generate recommendation
    const recommendation = generateComparisonRecommendation(deltaE, undertoneMatch, shade1, shade2);
    
    // Update UI
    updateComparisonResults(deltaE, undertoneMatch, recommendation);
}

// Calculate color difference between two shades
function calculateColorDifference(shade1, shade2) {
    // Convert hex to LAB if needed
    const lab1 = shade1.labColor || hexToLAB(shade1.hexColor);
    const lab2 = shade2.labColor || hexToLAB(shade2.hexColor);
    
    // Calculate Delta E
    const deltaL = lab1.L - lab2.L;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Generate comparison recommendation
function generateComparisonRecommendation(deltaE, undertoneMatch, shade1, shade2) {
    let recommendation = '';
    
    if (deltaE < 2) {
        recommendation = 'These shades are nearly identical! You could use either one.';
    } else if (deltaE < 5) {
        recommendation = 'These shades are very similar. The difference is barely noticeable.';
    } else if (deltaE < 10) {
        recommendation = 'These shades have a noticeable but subtle difference.';
    } else if (deltaE < 20) {
        recommendation = 'These shades are moderately different. Choose based on your preference.';
    } else {
        recommendation = 'These shades are quite different. Consider your specific needs.';
    }
    
    // Add undertone advice
    if (!undertoneMatch) {
        recommendation += ' Note: These have different undertones, which may affect how they look on your skin.';
    }
    
    // Add specific advice based on match scores
    if (shade1.matchScore && shade2.matchScore) {
        const score1 = Math.round(shade1.matchScore * 100);
        const score2 = Math.round(shade2.matchScore * 100);
        
        if (Math.abs(score1 - score2) > 10) {
            const better = score1 > score2 ? shade1 : shade2;
            recommendation += ` ${better.productName} in ${better.shadeName} is a better match for your skin tone.`;
        }
    }
    
    return recommendation;
}

// Update comparison results UI
function updateComparisonResults(deltaE, undertoneMatch, recommendation) {
    const resultsSection = document.getElementById('comparison-results');
    resultsSection.style.display = 'block';
    
    // Update Delta E visualization
    const deltaFill = document.getElementById('delta-fill');
    const deltaValue = document.getElementById('delta-value');
    
    // Map Delta E to percentage (0-50 range for visualization)
    const percentage = Math.min((deltaE / 50) * 100, 100);
    deltaFill.style.width = `${percentage}%`;
    deltaValue.textContent = deltaE.toFixed(1);
    
    // Color the bar based on difference
    if (deltaE < 5) {
        deltaFill.style.background = '#4CAF50'; // Green - very similar
    } else if (deltaE < 15) {
        deltaFill.style.background = '#FFC107'; // Yellow - moderate difference
    } else {
        deltaFill.style.background = '#FF5722'; // Red - significant difference
    }
    
    // Update undertone match
    const undertoneMatchElement = document.getElementById('undertone-match');
    if (undertoneMatch) {
        undertoneMatchElement.innerHTML = '✓ Both have the same undertone';
        undertoneMatchElement.style.color = '#4CAF50';
    } else {
        undertoneMatchElement.innerHTML = '✗ Different undertones';
        undertoneMatchElement.style.color = '#FF5722';
    }
    
    // Update recommendation
    document.getElementById('comparison-recommendation').textContent = recommendation;
    
    // Animate results
    resultsSection.classList.add('scale-in');
    setTimeout(() => resultsSection.classList.remove('scale-in'), 400);
}

// Clear comparison
function clearComparison() {
    comparisonSlots.slot1 = null;
    comparisonSlots.slot2 = null;
    
    updateComparisonSlot('slot-1', null);
    updateComparisonSlot('slot-2', null);
    
    document.getElementById('comparison-results').style.display = 'none';
    
    localStorage.removeItem('shadeComparison');
    showToast('Comparison cleared', 'success');
}

// Save comparison to localStorage
function saveComparison() {
    const comparisonData = {
        slot1: comparisonSlots.slot1,
        slot2: comparisonSlots.slot2,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('shadeComparison', JSON.stringify(comparisonData));
}

// Load saved comparison
function loadSavedComparison() {
    const saved = localStorage.getItem('shadeComparison');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Check if comparison is less than 24 hours old
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            if (data.slot1) {
                comparisonSlots.slot1 = data.slot1;
                updateComparisonSlot('slot-1', data.slot1);
            }
            if (data.slot2) {
                comparisonSlots.slot2 = data.slot2;
                updateComparisonSlot('slot-2', data.slot2);
            }
            
            if (data.slot1 && data.slot2) {
                performComparison();
            }
        } else {
            // Clear old comparison
            localStorage.removeItem('shadeComparison');
        }
    }
}

// Handle shade selection from other sources
function handleShadeSelection(event) {
    const { productId, shadeId } = event.detail;
    
    // Find the recommendation
    const recommendation = currentRecommendations.find(rec => 
        rec.productId === productId && rec.shadeId === shadeId
    );
    
    if (recommendation) {
        addToComparison(recommendation);
    }
}

// Create comparison history entry
function saveComparisonHistory(shade1, shade2, deltaE) {
    const history = JSON.parse(localStorage.getItem('comparisonHistory') || '[]');
    
    history.unshift({
        shade1: {
            productName: shade1.productName,
            shadeName: shade1.shadeName,
            hexColor: shade1.hexColor
        },
        shade2: {
            productName: shade2.productName,
            shadeName: shade2.shadeName,
            hexColor: shade2.hexColor
        },
        deltaE: deltaE,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 comparisons
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('comparisonHistory', JSON.stringify(history));
}

// Export comparison as image
function exportComparisonImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 400;
    
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 400);
    
    // Title
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 24px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Shade Comparison', 300, 40);
    
    if (comparisonSlots.slot1 && comparisonSlots.slot2) {
        // Shade 1
        drawShadeInfo(ctx, comparisonSlots.slot1, 50, 80);
        
        // VS
        ctx.font = 'bold 20px Poppins, sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText('VS', 300, 150);
        
        // Shade 2
        drawShadeInfo(ctx, comparisonSlots.slot2, 350, 80);
        
        // Delta E
        const deltaE = calculateColorDifference(comparisonSlots.slot1, comparisonSlots.slot2);
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(`Color Difference (ΔE): ${deltaE.toFixed(1)}`, 300, 250);
        
        // Recommendation
        const recommendation = document.getElementById('comparison-recommendation').textContent;
        wrapText(ctx, recommendation, 300, 300, 500, 20);
    }
    
    // Download
    const link = document.createElement('a');
    link.download = `shade-comparison-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Helper function to draw shade info on canvas
function drawShadeInfo(ctx, shade, x, y) {
    // Color swatch
    ctx.fillStyle = shade.hexColor;
    ctx.fillRect(x - 50, y, 100, 100);
    ctx.strokeStyle = '#CCCCCC';
    ctx.strokeRect(x - 50, y, 100, 100);
    
    // Product name
    ctx.fillStyle = '#333333';
    ctx.font = '14px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shade.productName, x, y + 120);
    
    // Shade name
    ctx.font = 'bold 16px Poppins, sans-serif';
    ctx.fillText(shade.shadeName, x, y + 140);
    
    // Undertone
    ctx.font = '12px Poppins, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`${shade.undertone} undertone`, x, y + 160);
}

// Helper function to wrap text on canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    ctx.textAlign = 'center';
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// Add comparison styles
const comparisonStyles = `
<style>
.comparison-shade-card {
    position: relative;
    text-align: center;
    padding: var(--spacing-md);
}

.remove-from-comparison {
    position: absolute;
    top: 0;
    right: 0;
    background: white;
    border: 1px solid var(--neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs);
    cursor: pointer;
    transition: all 0.3s;
}

.remove-from-comparison:hover {
    background: var(--neutral-100);
    border-color: var(--primary-pink);
}

.comparison-swatch {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
}

.comparison-shade-card h4 {
    font-size: 0.875rem;
    margin-bottom: var(--spacing-xs);
}

.comparison-shade-card .shade-name {
    font-weight: 600;
    color: var(--neutral-900);
    margin-bottom: var(--spacing-xs);
}

.comparison-shade-card .undertone {
    font-size: 0.75rem;
    color: var(--neutral-600);
    margin-bottom: var(--spacing-xs);
}

.comparison-shade-card .match-score {
    font-size: 0.875rem;
    color: var(--primary-pink);
    font-weight: 500;
}

.comparison-metrics {
    text-align: center;
}

#comparison-recommendation {
    line-height: 1.6;
    color: var(--neutral-700);
}

@media (max-width: 768px) {
    .comparison-interface {
        padding: var(--spacing-lg);
    }
    
    .comparison-swatch {
        width: 60px;
        height: 60px;
    }
}
</style>
`;

// Inject styles when module loads
if (!document.getElementById('comparison-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'comparison-styles';
    styleElement.innerHTML = comparisonStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Export functions for use in other modules
window.comparisonModule = {
    initializeComparison,
    addToComparison,
    clearComparison,
    exportComparisonImage
};