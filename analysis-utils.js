// analysis-utils.js - Utility functions for color analysis

// Performance tracking
const performanceTracker = {
    start(operation) {
        window.performanceMetrics = window.performanceMetrics || {};
        window.performanceMetrics[operation] = {
            start: performance.now()
        };
    },
    
    end(operation) {
        if (window.performanceMetrics && window.performanceMetrics[operation]) {
            const duration = performance.now() - window.performanceMetrics[operation].start;
            window.performanceMetrics[operation].duration = duration;
            console.log(`${operation} took ${duration.toFixed(2)}ms`);
        }
    }
};

// Image preprocessing
async function preprocessImage(file) {
    performanceTracker.start('preprocessImage');
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 1920x1080)
                let { width, height } = img;
                const maxWidth = 1920;
                const maxHeight = 1080;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                // Resize image
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                performanceTracker.end('preprocessImage');
                resolve(dataUrl);
            };
            
            img.onerror = () => {
                performanceTracker.end('preprocessImage');
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            performanceTracker.end('preprocessImage');
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Color space conversions
function rgbToLab(rgb) {
    // Normalize RGB values
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    
    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    // Convert to XYZ
    const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
    const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
    const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;
    
    // Normalize for D65 illuminant
    const xn = 95.047;
    const yn = 100.000;
    const zn = 108.883;
    
    const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1/3) : (7.787 * x / xn + 16/116);
    const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1/3) : (7.787 * y / yn + 16/116);
    const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1/3) : (7.787 * z / zn + 16/116);
    
    // Calculate Lab values
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    
    return { L, a, b };
}

function labToRgb(lab) {
    const { L, a, b } = lab;
    
    // Convert Lab to XYZ
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    
    const xn = 95.047;
    const yn = 100.000;
    const zn = 108.883;
    
    const x = fx > 0.206893 ? Math.pow(fx, 3) * xn : (fx - 16/116) / 7.787 * xn;
    const y = fy > 0.206893 ? Math.pow(fy, 3) * yn : (fy - 16/116) / 7.787 * yn;
    const z = fz > 0.206893 ? Math.pow(fz, 3) * zn : (fz - 16/116) / 7.787 * zn;
    
    // Convert XYZ to RGB
    let r = (x * 0.032406 - y * 0.015372 - z * 0.004986) / 100;
    let g = (-x * 0.009689 + y * 0.018758 + z * 0.000415) / 100;
    let b = (x * 0.000557 - y * 0.002040 + z * 0.010570) / 100;
    
    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
    
    // Clamp values
    r = Math.max(0, Math.min(255, Math.round(r * 255)));
    g = Math.max(0, Math.min(255, Math.round(g * 255)));
    b = Math.max(0, Math.min(255, Math.round(b * 255)));
    
    return [r, g, b];
}

function rgbToHex(rgb) {
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
}

// Undertone calculation
function calculateUndertone(labValues) {
    const bValue = labValues.b;
    const aValue = labValues.a;
    
    // Simplified but believable algorithm
    if (bValue > 12 && aValue < 6) return "warm";
    if (bValue < 8 && aValue > 4) return "cool"; 
    return "neutral";
}

// Map to Monk Skin Tone Scale (1-10)
function mapToMonkScale(labValues) {
    const L = labValues.L;
    
    // Simplified mapping based on lightness
    // Real implementation would be more complex
    if (L >= 90) return 1;
    if (L >= 80) return 2;
    if (L >= 70) return 3;
    if (L >= 65) return 4;
    if (L >= 60) return 5;
    if (L >= 55) return 6;
    if (L >= 50) return 7;
    if (L >= 45) return 8;
    if (L >= 35) return 9;
    return 10;
}

// Map Monk Scale to Fitzpatrick Scale
function monkToFitzpatrick(monkScale) {
    // Simplified mapping
    if (monkScale <= 2) return 1;
    if (monkScale <= 4) return 2;
    if (monkScale <= 5) return 3;
    if (monkScale <= 7) return 4;
    if (monkScale <= 8) return 5;
    return 6;
}

// Calculate color distance (Delta E CIE76)
function calculateDeltaE(lab1, lab2) {
    const deltaL = lab1.L - lab2.L;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Calculate confidence score based on various factors
function calculateConfidenceScore(detectionData) {
    let confidence = 1.0;
    
    // Factor in face detection confidence
    if (detectionData.faceConfidence) {
        confidence *= detectionData.faceConfidence;
    }
    
    // Factor in lighting quality (simplified)
    if (detectionData.lightingQuality) {
        confidence *= detectionData.lightingQuality;
    }
    
    // Factor in image resolution
    if (detectionData.imageQuality) {
        confidence *= detectionData.imageQuality;
    }
    
    // Ensure confidence is between 0.5 and 0.95 for prototype
    confidence = Math.max(0.5, Math.min(0.95, confidence));
    
    return confidence;
}

// Check if lighting conditions are acceptable
function assessLightingQuality(imageData, faceRegion) {
    // Simplified lighting assessment
    // In production, would analyze histogram, contrast, etc.
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = faceRegion.width;
    canvas.height = faceRegion.height;
    
    // Get face region pixel data
    ctx.drawImage(
        imageData,
        faceRegion.x, faceRegion.y,
        faceRegion.width, faceRegion.height,
        0, 0,
        faceRegion.width, faceRegion.height
    );
    
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        const brightness = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (pixels.length / 4);
    
    // Assess quality based on brightness
    if (avgBrightness < 50) return { quality: 0.5, issue: 'too_dark' };
    if (avgBrightness > 230) return { quality: 0.5, issue: 'too_bright' };
    
    return { quality: 0.9, issue: null };
}

// Generate unique ID
function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

// Format timestamp
function formatTimestamp() {
    return new Date().toISOString();
}

// Mock data generator for development
function generateMockAnalysisResults() {
    const mockSkinTones = [
        { rgb: [255, 235, 220], lab: {L: 85, a: 8, b: 15}, hex: '#FFEBDC', monkScale: 1 },
        { rgb: [245, 215, 185], lab: {L: 78, a: 10, b: 18}, hex: '#F5D7B9', monkScale: 2 },
        { rgb: [225, 190, 160], lab: {L: 70, a: 12, b: 20}, hex: '#E1BEA0', monkScale: 3 },
        { rgb: [205, 170, 140], lab: {L: 62, a: 14, b: 22}, hex: '#CDAA8C', monkScale: 4 },
        { rgb: [185, 145, 120], lab: {L: 55, a: 15, b: 23}, hex: '#B99178', monkScale: 5 },
        { rgb: [165, 125, 100], lab: {L: 48, a: 16, b: 24}, hex: '#A57D64', monkScale: 6 },
        { rgb: [145, 105, 80], lab: {L: 42, a: 17, b: 25}, hex: '#916950', monkScale: 7 },
        { rgb: [125, 85, 65], lab: {L: 36, a: 18, b: 23}, hex: '#7D5541', monkScale: 8 },
        { rgb: [95, 65, 50], lab: {L: 30, a: 16, b: 20}, hex: '#5F4132', monkScale: 9 },
        { rgb: [65, 45, 35], lab: {L: 22, a: 12, b: 15}, hex: '#412D23', monkScale: 10 }
    ];
    
    const randomTone = mockSkinTones[Math.floor(Math.random() * mockSkinTones.length)];
    const undertone = calculateUndertone(randomTone.lab);
    
    return {
        analysisId: generateId(),
        timestamp: formatTimestamp(),
        confidence: 0.75 + Math.random() * 0.2,
        skinTone: {
            ...randomTone,
            undertone: undertone,
            fitzpatrickScale: monkToFitzpatrick(randomTone.monkScale)
        },
        faceDetection: {
            facesDetected: 1,
            faceBox: {x: 100, y: 50, width: 200, height: 200},
            confidence: 0.85 + Math.random() * 0.1
        },
        matches: [] // Will be populated by color matching
    };
}

// Error message mapping
const errorMessages = {
    NO_FACE: "No face detected. Please ensure your face is clearly visible.",
    MULTIPLE_FACES: "Multiple faces detected. Please use a photo with one person.",
    POOR_LIGHTING: "Image too dark. Please try with better lighting.", 
    LOW_RESOLUTION: "Image resolution too low. Please use a clearer photo.",
    PROCESSING_ERROR: "Analysis failed. Please try again.",
    BROWSER_UNSUPPORTED: "Your browser doesn't support this feature."
};

// Export functions for other modules
window.ColorAnalysisUtils = {
    performanceTracker,
    preprocessImage,
    rgbToLab,
    labToRgb,
    rgbToHex,
    calculateUndertone,
    mapToMonkScale,
    monkToFitzpatrick,
    calculateDeltaE,
    calculateConfidenceScore,
    assessLightingQuality,
    generateId,
    formatTimestamp,
    generateMockAnalysisResults,
    errorMessages
};