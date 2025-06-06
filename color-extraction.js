// color-extraction.js - Extract and analyze skin tone colors

// Color extraction configuration
const COLOR_EXTRACTION_CONFIG = {
    samplesPerRegion: 25,
    outlierThreshold: 2.5, // Standard deviations
    minSampleQuality: 0.7
};

// Main skin tone extraction function
async function extractSkinTone(imageElement, faceDetectionData) {
    const { performanceTracker } = window.ColorAnalysisUtils;
    performanceTracker.start('extractSkinTone');
    
    try {
        window.showProgress('Analyzing skin tone...', 40);
        
        // Create canvas for pixel sampling
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx.drawImage(imageElement, 0, 0);
        
        // Extract colors from each skin region
        const regionColors = [];
        
        for (const region of faceDetectionData.skinRegions) {
            const colors = extractRegionColors(ctx, region);
            regionColors.push({
                colors,
                weight: region.weight,
                name: region.name
            });
        }
        
        window.showProgress('Processing color data...', 60);
        
        // Calculate weighted average color
        const averageColor = calculateWeightedAverageColor(regionColors);
        
        // Remove outliers
        const cleanedColor = removeColorOutliers(regionColors, averageColor);
        
        // Convert to different color spaces
        const labColor = window.ColorAnalysisUtils.rgbToLab(cleanedColor);
        const hexColor = window.ColorAnalysisUtils.rgbToHex(cleanedColor);
        
        // Calculate skin tone properties
        const undertone = window.ColorAnalysisUtils.calculateUndertone(labColor);
        const monkScale = window.ColorAnalysisUtils.mapToMonkScale(labColor);
        const fitzpatrickScale = window.ColorAnalysisUtils.monkToFitzpatrick(monkScale);
        
        window.showProgress('Finalizing analysis...', 70);
        
        performanceTracker.end('extractSkinTone');
        
        return {
            rgb: cleanedColor,
            lab: labColor,
            hex: hexColor,
            undertone,
            monkScale,
            fitzpatrickScale,
            sampleQuality: assessSampleQuality(regionColors)
        };
        
    } catch (error) {
        performanceTracker.end('extractSkinTone');
        console.error('Skin tone extraction error:', error);
        throw new Error('Failed to analyze skin tone');
    }
}

// Extract colors from a specific region
function extractRegionColors(ctx, region) {
    const colors = [];
    const { x, y, width, height } = region;
    
    // Calculate sample points
    const samplesPerRow = Math.ceil(Math.sqrt(COLOR_EXTRACTION_CONFIG.samplesPerRegion));
    const stepX = width / samplesPerRow;
    const stepY = height / samplesPerRow;
    
    for (let i = 0; i < samplesPerRow; i++) {
        for (let j = 0; j < samplesPerRow; j++) {
            const sampleX = Math.round(x + (i * stepX) + (stepX / 2));
            const sampleY = Math.round(y + (j * stepY) + (stepY / 2));
            
            // Get pixel data
            const pixelData = ctx.getImageData(sampleX, sampleY, 1, 1).data;
            
            // Filter out likely non-skin pixels
            if (isSkinColor(pixelData)) {
                colors.push([pixelData[0], pixelData[1], pixelData[2]]);
            }
        }
    }
    
    return colors;
}

// Basic skin color detection
function isSkinColor(rgb) {
    const [r, g, b] = rgb;
    
    // Simple heuristic for skin color detection
    // In production, would use more sophisticated methods
    
    // Check if it's not too dark or too bright
    const brightness = (r + g + b) / 3;
    if (brightness < 50 || brightness > 240) return false;
    
    // Check color ratios typical of skin
    const rg_ratio = r / g;
    const rb_ratio = r / b;
    
    // Skin typically has higher red values
    if (r <= g || r <= b) return false;
    
    // Check ratios are within typical skin ranges
    if (rg_ratio < 1.0 || rg_ratio > 1.5) return false;
    if (rb_ratio < 1.2 || rb_ratio > 2.0) return false;
    
    return true;
}

// Calculate weighted average color from multiple regions
function calculateWeightedAverageColor(regionColors) {
    let totalR = 0, totalG = 0, totalB = 0;
    let totalWeight = 0;
    
    regionColors.forEach(region => {
        if (region.colors.length === 0) return;
        
        // Calculate average for this region
        const regionAvg = calculateAverageColor(region.colors);
        
        // Add weighted contribution
        totalR += regionAvg[0] * region.weight;
        totalG += regionAvg[1] * region.weight;
        totalB += regionAvg[2] * region.weight;
        totalWeight += region.weight;
    });
    
    // Normalize by total weight
    return [
        Math.round(totalR / totalWeight),
        Math.round(totalG / totalWeight),
        Math.round(totalB / totalWeight)
    ];
}

// Calculate simple average color
function calculateAverageColor(colors) {
    if (colors.length === 0) return [0, 0, 0];
    
    const sum = colors.reduce((acc, color) => {
        return [
            acc[0] + color[0],
            acc[1] + color[1],
            acc[2] + color[2]
        ];
    }, [0, 0, 0]);
    
    return [
        Math.round(sum[0] / colors.length),
        Math.round(sum[1] / colors.length),
        Math.round(sum[2] / colors.length)
    ];
}

// Remove outlier colors for more accurate results
function removeColorOutliers(regionColors, averageColor) {
    const allColors = [];
    
    // Collect all colors with weights
    regionColors.forEach(region => {
        region.colors.forEach(color => {
            allColors.push({
                color,
                weight: region.weight / region.colors.length
            });
        });
    });
    
    if (allColors.length === 0) return averageColor;
    
    // Convert average to LAB for better distance calculation
    const avgLab = window.ColorAnalysisUtils.rgbToLab(averageColor);
    
    // Calculate distances and statistics
    const distances = allColors.map(item => {
        const lab = window.ColorAnalysisUtils.rgbToLab(item.color);
        return {
            ...item,
            distance: window.ColorAnalysisUtils.calculateDeltaE(avgLab, lab)
        };
    });
    
    // Calculate mean and standard deviation
    const meanDistance = distances.reduce((sum, d) => sum + d.distance, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d.distance - meanDistance, 2), 0) / distances.length;
    const stdDev = Math.sqrt(variance);
    
    // Filter out outliers
    const threshold = meanDistance + (stdDev * COLOR_EXTRACTION_CONFIG.outlierThreshold);
    const filteredColors = distances.filter(d => d.distance <= threshold);
    
    // Recalculate average without outliers
    if (filteredColors.length > 0) {
        let totalR = 0, totalG = 0, totalB = 0;
        let totalWeight = 0;
        
        filteredColors.forEach(item => {
            totalR += item.color[0] * item.weight;
            totalG += item.color[1] * item.weight;
            totalB += item.color[2] * item.weight;
            totalWeight += item.weight;
        });
        
        return [
            Math.round(totalR / totalWeight),
            Math.round(totalG / totalWeight),
            Math.round(totalB / totalWeight)
        ];
    }
    
    return averageColor;
}

// Assess the quality of color samples
function assessSampleQuality(regionColors) {
    let totalSamples = 0;
    let validSamples = 0;
    
    regionColors.forEach(region => {
        totalSamples += COLOR_EXTRACTION_CONFIG.samplesPerRegion;
        validSamples += region.colors.length;
    });
    
    const sampleRatio = validSamples / totalSamples;
    
    // Calculate color consistency
    const allColors = regionColors.flatMap(r => r.colors);
    const consistency = calculateColorConsistency(allColors);
    
    // Combined quality score
    const quality = (sampleRatio * 0.5) + (consistency * 0.5);
    
    return Math.max(COLOR_EXTRACTION_CONFIG.minSampleQuality, quality);
}

// Calculate how consistent the color samples are
function calculateColorConsistency(colors) {
    if (colors.length < 2) return 1.0;
    
    // Calculate average color
    const avgColor = calculateAverageColor(colors);
    const avgLab = window.ColorAnalysisUtils.rgbToLab(avgColor);
    
    // Calculate average distance from mean
    let totalDistance = 0;
    colors.forEach(color => {
        const lab = window.ColorAnalysisUtils.rgbToLab(color);
        totalDistance += window.ColorAnalysisUtils.calculateDeltaE(avgLab, lab);
    });
    
    const avgDistance = totalDistance / colors.length;
    
    // Convert to consistency score (lower distance = higher consistency)
    // Using exponential decay for smooth transition
    const consistency = Math.exp(-avgDistance / 10);
    
    return Math.max(0.5, Math.min(1.0, consistency));
}

// Apply color correction based on lighting assessment
function applyColorCorrection(skinToneData, lightingQuality) {
    // Simplified color correction
    // In production, would use more sophisticated algorithms
    
    const correctedLab = { ...skinToneData.lab };
    
    if (lightingQuality.issue === 'too_dark') {
        // Increase lightness slightly
        correctedLab.L = Math.min(100, correctedLab.L * 1.1);
    } else if (lightingQuality.issue === 'too_bright') {
        // Decrease lightness slightly
        correctedLab.L = Math.max(0, correctedLab.L * 0.9);
    }
    
    // Convert back to RGB
    const correctedRgb = window.ColorAnalysisUtils.labToRgb(correctedLab);
    const correctedHex = window.ColorAnalysisUtils.rgbToHex(correctedRgb);
    
    return {
        ...skinToneData,
        rgb: correctedRgb,
        lab: correctedLab,
        hex: correctedHex,
        correctionApplied: lightingQuality.issue !== null
    };
}

// Export functions
window.ColorExtraction = {
    extractSkinTone,
    applyColorCorrection,
    assessSampleQuality
};