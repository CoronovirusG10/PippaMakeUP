// face-detection.js - Face detection using face-api.js

// Face detection configuration
const FACE_DETECTION_CONFIG = {
    modelPath: 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
    minConfidence: 0.5,
    inputSize: 416, // Smaller for faster detection
    scoreThreshold: 0.5
};

// Initialize face-api.js models
async function initializeFaceDetection() {
    const { performanceTracker } = window.ColorAnalysisUtils;
    performanceTracker.start('initializeFaceDetection');
    
    try {
        // Load only the models we need for skin tone analysis
        await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_DETECTION_CONFIG.modelPath);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(FACE_DETECTION_CONFIG.modelPath);
        
        console.log('Face detection models loaded successfully');
        performanceTracker.end('initializeFaceDetection');
        return true;
    } catch (error) {
        console.error('Failed to load face detection models:', error);
        performanceTracker.end('initializeFaceDetection');
        throw new Error('Failed to initialize face detection');
    }
}

// Detect face in image
async function detectFace(imageElement) {
    const { performanceTracker, errorMessages } = window.ColorAnalysisUtils;
    performanceTracker.start('detectFace');
    
    try {
        // Update progress
        window.showProgress('Detecting face...', 10);
        
        // Configure detection options
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: FACE_DETECTION_CONFIG.inputSize,
            scoreThreshold: FACE_DETECTION_CONFIG.scoreThreshold
        });
        
        // Detect faces with landmarks
        const detections = await faceapi
            .detectAllFaces(imageElement, options)
            .withFaceLandmarks(true);
        
        window.showProgress('Face detection complete', 30);
        
        if (detections.length === 0) {
            performanceTracker.end('detectFace');
            throw new Error(errorMessages.NO_FACE);
        }
        
        if (detections.length > 1) {
            console.log(`${detections.length} faces detected, using the largest`);
            // Use the largest face
            const largestFace = detections.reduce((prev, current) => {
                const prevArea = prev.detection.box.width * prev.detection.box.height;
                const currentArea = current.detection.box.width * current.detection.box.height;
                return currentArea > prevArea ? current : prev;
            });
            
            performanceTracker.end('detectFace');
            return processFaceDetection(largestFace, imageElement);
        }
        
        performanceTracker.end('detectFace');
        return processFaceDetection(detections[0], imageElement);
        
    } catch (error) {
        performanceTracker.end('detectFace');
        console.error('Face detection error:', error);
        throw error;
    }
}

// Process face detection results
function processFaceDetection(detection, imageElement) {
    const { box } = detection.detection;
    const landmarks = detection.landmarks;
    
    // Get face bounding box
    const faceBox = {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, imageElement.width - box.x),
        height: Math.min(box.height, imageElement.height - box.y)
    };
    
    // Extract skin sampling regions from landmarks
    const skinRegions = extractSkinRegions(landmarks, faceBox, imageElement);
    
    // Show face overlay on preview
    showFaceOverlay(faceBox);
    
    return {
        faceBox,
        landmarks: landmarks.positions,
        confidence: detection.detection.score,
        skinRegions,
        imageWidth: imageElement.width,
        imageHeight: imageElement.height
    };
}

// Extract optimal skin regions for color sampling
function extractSkinRegions(landmarks, faceBox, imageElement) {
    const positions = landmarks.positions;
    
    // Define regions based on facial landmarks
    // Using indices from 68-point face model
    const regions = {
        leftCheek: {
            points: positions.slice(1, 5), // Left cheek area
            weight: 0.4
        },
        rightCheek: {
            points: positions.slice(12, 16), // Right cheek area
            weight: 0.4
        },
        forehead: {
            points: [
                positions[19], // Left eyebrow
                positions[24], // Right eyebrow
                { x: positions[27].x, y: positions[19].y - 20 } // Above nose bridge
            ],
            weight: 0.2
        }
    };
    
    // Convert landmark points to sampling regions
    const samplingRegions = [];
    
    for (const [name, region] of Object.entries(regions)) {
        const bounds = calculateRegionBounds(region.points);
        
        // Ensure region is within image bounds
        const validBounds = {
            x: Math.max(0, Math.min(bounds.x, imageElement.width - 50)),
            y: Math.max(0, Math.min(bounds.y, imageElement.height - 50)),
            width: Math.min(50, imageElement.width - bounds.x),
            height: Math.min(50, imageElement.height - bounds.y),
            weight: region.weight,
            name: name
        };
        
        samplingRegions.push(validBounds);
    }
    
    return samplingRegions;
}

// Calculate bounding box for a set of points
function calculateRegionBounds(points) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    });
    
    // Add padding
    const padding = 10;
    return {
        x: minX - padding,
        y: minY - padding,
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2)
    };
}

// Show face detection overlay on preview
function showFaceOverlay(faceBox) {
    const overlay = document.getElementById('faceOverlay');
    const canvas = document.getElementById('previewCanvas');
    
    if (!overlay || !canvas) return;
    
    // Calculate overlay position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    overlay.style.left = `${faceBox.x * scaleX}px`;
    overlay.style.top = `${faceBox.y * scaleY}px`;
    overlay.style.width = `${faceBox.width * scaleX}px`;
    overlay.style.height = `${faceBox.height * scaleY}px`;
    
    overlay.classList.add('visible');
    
    // Hide after 2 seconds
    setTimeout(() => {
        overlay.classList.remove('visible');
    }, 2000);
}

// Validate face detection quality
function validateFaceDetection(detectionData) {
    const { faceBox, confidence, imageWidth, imageHeight } = detectionData;
    
    // Check confidence
    if (confidence < FACE_DETECTION_CONFIG.minConfidence) {
        return {
            valid: false,
            reason: 'Low detection confidence'
        };
    }
    
    // Check face size (should be at least 10% of image)
    const faceArea = faceBox.width * faceBox.height;
    const imageArea = imageWidth * imageHeight;
    const facePercentage = (faceArea / imageArea) * 100;
    
    if (facePercentage < 5) {
        return {
            valid: false,
            reason: 'Face too small in image'
        };
    }
    
    if (facePercentage > 80) {
        return {
            valid: false,
            reason: 'Face too close to camera'
        };
    }
    
    return {
        valid: true,
        quality: confidence
    };
}

// Mock face detection for development
function mockFaceDetection(imageElement) {
    console.log('Using mock face detection');
    
    // Simulate processing delay
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = {
                faceBox: {
                    x: imageElement.width * 0.3,
                    y: imageElement.height * 0.2,
                    width: imageElement.width * 0.4,
                    height: imageElement.height * 0.5
                },
                landmarks: generateMockLandmarks(imageElement),
                confidence: 0.85 + Math.random() * 0.1,
                skinRegions: generateMockSkinRegions(imageElement),
                imageWidth: imageElement.width,
                imageHeight: imageElement.height
            };
            
            showFaceOverlay(mockData.faceBox);
            resolve(mockData);
        }, 1000);
    });
}

// Generate mock landmarks for testing
function generateMockLandmarks(imageElement) {
    const centerX = imageElement.width / 2;
    const centerY = imageElement.height / 2;
    const positions = [];
    
    // Generate 68 mock landmark points
    for (let i = 0; i < 68; i++) {
        positions.push({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 200
        });
    }
    
    return positions;
}

// Generate mock skin regions for testing
function generateMockSkinRegions(imageElement) {
    const centerX = imageElement.width / 2;
    const centerY = imageElement.height / 2;
    
    return [
        {
            x: centerX - 100,
            y: centerY - 20,
            width: 50,
            height: 50,
            weight: 0.4,
            name: 'leftCheek'
        },
        {
            x: centerX + 50,
            y: centerY - 20,
            width: 50,
            height: 50,
            weight: 0.4,
            name: 'rightCheek'
        },
        {
            x: centerX - 25,
            y: centerY - 100,
            width: 50,
            height: 30,
            weight: 0.2,
            name: 'forehead'
        }
    ];
}

// Export functions
window.FaceDetection = {
    initializeFaceDetection,
    detectFace,
    validateFaceDetection,
    mockFaceDetection
};