// Pippa of London - Camera Functionality

// Camera state management
const cameraState = {
    stream: null,
    facingMode: 'user', // 'user' for front camera, 'environment' for back
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingStartTime: null,
    recordingTimer: null
};

// DOM Elements
const cameraPreview = document.getElementById('camera-preview');
const captureCanvas = document.getElementById('capture-canvas');
const captureButton = document.getElementById('capture-photo');
const switchCameraButton = document.getElementById('switch-camera');
const cameraSection = document.getElementById('camera-section');
const videoControls = document.getElementById('video-controls');
const recordingTimer = document.querySelector('.recording-timer');
const stopRecordingButton = document.getElementById('stop-recording');
const lightingWarning = document.getElementById('lighting-warning');

// Initialize camera when tab is activated
document.addEventListener('DOMContentLoaded', () => {
    const cameraTab = document.querySelector('[data-tab="camera"]');
    if (cameraTab && cameraTab.classList.contains('active')) {
        initializeCamera('user');
    }
});

// Initialize camera with specified facing mode
async function initializeCamera(facingMode = 'user') {
    try {
        // Stop existing stream if any
        if (cameraState.stream) {
            stopCamera();
        }

        // Request camera permissions
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 }
            },
            audio: false // No audio needed for skin analysis
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraState.stream = stream;
        cameraState.facingMode = facingMode;
        
        // Set video source
        cameraPreview.srcObject = stream;
        
        // Check if device has multiple cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Hide switch button if only one camera
        if (videoDevices.length <= 1) {
            switchCameraButton.style.display = 'none';
        }
        
        // Start lighting check
        startLightingCheck();
        
        showToast('Camera ready', 'success');
        
    } catch (error) {
        console.error('Camera initialization error:', error);
        handleCameraError(error);
    }
}

// Stop camera stream
function stopCamera() {
    if (cameraState.stream) {
        const tracks = cameraState.stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraState.stream = null;
        cameraPreview.srcObject = null;
    }
}

// Handle camera errors
function handleCameraError(error) {
    let message = 'Camera access failed';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        message = 'Camera is already in use by another application.';
    }
    
    showToast(message, 'error');
    
    // Show upload section as fallback
    document.querySelector('[data-tab="upload"]').click();
}

// Switch between front and back camera
switchCameraButton.addEventListener('click', async () => {
    const newFacingMode = cameraState.facingMode === 'user' ? 'environment' : 'user';
    await initializeCamera(newFacingMode);
});

// Capture photo
captureButton.addEventListener('click', async () => {
    if (!cameraState.stream) {
        showToast('Camera not initialized', 'error');
        return;
    }
    
    try {
        // Set canvas dimensions to video dimensions
        const videoTrack = cameraState.stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        captureCanvas.width = settings.width;
        captureCanvas.height = settings.height;
        
        // Draw video frame to canvas
        const context = captureCanvas.getContext('2d');
        
        // Flip horizontally if front camera (to match preview)
        if (cameraState.facingMode === 'user') {
            context.translate(captureCanvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(cameraPreview, 0, 0);
        
        // Convert to blob
        captureCanvas.toBlob(async (blob) => {
            if (!blob) {
                showToast('Failed to capture photo', 'error');
                return;
            }
            
            // Compress image
            const compressedBlob = await compressImage(blob, 0.85);
            
            // Create media object
            const mediaData = await createMediaObject(compressedBlob, 'photo');
            
            // Save to storage
            await saveMediaToStorage(mediaData);
            
            // Provide haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            showToast('Photo captured!', 'success');
            
            // Update gallery count
            updateGalleryCount();
            
            // Show preview after short delay
            setTimeout(() => {
                document.querySelector('[data-tab="gallery"]').click();
            }, 500);
            
        }, 'image/jpeg', 0.95);
        
    } catch (error) {
        console.error('Capture error:', error);
        showToast('Failed to capture photo', 'error');
    }
});

// Long press for video recording
let longPressTimer;
captureButton.addEventListener('mousedown', startLongPress);
captureButton.addEventListener('touchstart', startLongPress);
captureButton.addEventListener('mouseup', endLongPress);
captureButton.addEventListener('touchend', endLongPress);
captureButton.addEventListener('mouseleave', endLongPress);
captureButton.addEventListener('touchcancel', endLongPress);

function startLongPress(e) {
    e.preventDefault();
    longPressTimer = setTimeout(() => {
        startVideoRecording();
    }, 500); // Start recording after 500ms hold
}

function endLongPress(e) {
    e.preventDefault();
    clearTimeout(longPressTimer);
}

// Start video recording
async function startVideoRecording() {
    if (!cameraState.stream || cameraState.isRecording) return;
    
    try {
        // Check for MediaRecorder support
        if (!MediaRecorder || !MediaRecorder.isTypeSupported('video/webm')) {
            showToast('Video recording not supported on this device', 'error');
            return;
        }
        
        // Initialize MediaRecorder
        const options = {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
        };
        
        cameraState.mediaRecorder = new MediaRecorder(cameraState.stream, options);
        cameraState.recordedChunks = [];
        
        // Handle data available
        cameraState.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                cameraState.recordedChunks.push(event.data);
            }
        };
        
        // Handle recording stop
        cameraState.mediaRecorder.onstop = async () => {
            const blob = new Blob(cameraState.recordedChunks, { type: 'video/webm' });
            await handleRecordedVideo(blob);
        };
        
        // Start recording
        cameraState.mediaRecorder.start(1000); // Collect data every second
        cameraState.isRecording = true;
        cameraState.recordingStartTime = Date.now();
        
        // Update UI
        captureButton.style.display = 'none';
        switchCameraButton.style.display = 'none';
        videoControls.classList.remove('hidden');
        
        // Start timer
        startRecordingTimer();
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Auto-stop after 10 seconds
        setTimeout(() => {
            if (cameraState.isRecording) {
                stopVideoRecording();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Video recording error:', error);
        showToast('Failed to start video recording', 'error');
    }
}

// Stop video recording
async function stopVideoRecording() {
    if (!cameraState.isRecording || !cameraState.mediaRecorder) return;
    
    try {
        cameraState.mediaRecorder.stop();
        cameraState.isRecording = false;
        
        // Reset UI
        captureButton.style.display = 'flex';
        switchCameraButton.style.display = 'flex';
        videoControls.classList.add('hidden');
        
        // Stop timer
        clearInterval(cameraState.recordingTimer);
        recordingTimer.textContent = '00:00';
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
    } catch (error) {
        console.error('Stop recording error:', error);
        showToast('Failed to stop recording', 'error');
    }
}

// Handle recorded video
async function handleRecordedVideo(blob) {
    try {
        // Validate video size (50MB limit)
        if (blob.size > 50 * 1024 * 1024) {
            showToast('Video too large. Maximum size is 50MB.', 'error');
            return;
        }
        
        // Create media object
        const mediaData = await createMediaObject(blob, 'video');
        
        // Save to storage
        await saveMediaToStorage(mediaData);
        
        showToast('Video captured!', 'success');
        
        // Update gallery count
        updateGalleryCount();
        
        // Show preview
        setTimeout(() => {
            document.querySelector('[data-tab="gallery"]').click();
        }, 500);
        
    } catch (error) {
        console.error('Video processing error:', error);
        showToast('Failed to process video', 'error');
    }
}

// Recording timer
function startRecordingTimer() {
    cameraState.recordingTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - cameraState.recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        recordingTimer.textContent = `${minutes}:${seconds}`;
    }, 100);
}

// Stop recording button
stopRecordingButton.addEventListener('click', stopVideoRecording);

// Lighting check
function startLightingCheck() {
    if (!cameraState.stream) return;
    
    // Check lighting every 2 seconds
    setInterval(() => {
        if (cameraState.stream && !cameraState.isRecording) {
            checkLighting();
        }
    }, 2000);
}

// Check if lighting is adequate
function checkLighting() {
    // Create temporary canvas for analysis
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 320;
    tempCanvas.height = 240;
    const context = tempCanvas.getContext('2d');
    
    // Draw current frame
    context.drawImage(cameraPreview, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Get image data
    const imageData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate perceived brightness
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
        totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Show warning if too dark (threshold: 60)
    if (avgBrightness < 60) {
        lightingWarning.classList.remove('hidden');
    } else {
        lightingWarning.classList.add('hidden');
    }
}

// Create media object with metadata
async function createMediaObject(blob, type) {
    const mediaId = generateUUID();
    const base64 = await blobToBase64(blob);
    
    // Get dimensions for images
    let metadata = {
        size: blob.size
    };
    
    if (type === 'photo') {
        const dimensions = await getImageDimensions(blob);
        metadata = { ...metadata, ...dimensions };
    } else if (type === 'video') {
        // For video, we'll use default dimensions
        metadata.width = 1280;
        metadata.height = 720;
        metadata.duration = (Date.now() - cameraState.recordingStartTime) / 1000;
    }
    
    return {
        mediaId: mediaId,
        type: type,
        file: base64,
        timestamp: new Date().toISOString(),
        metadata: metadata,
        source: 'camera'
    };
}

// Tab switching logic
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        
        // Update active states
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Hide all sections
        cameraSection.classList.remove('active');
        document.getElementById('upload-section').classList.remove('active');
        document.getElementById('preview-section').classList.add('hidden');
        
        // Show selected section
        if (tab === 'camera') {
            cameraSection.classList.add('active');
            if (!cameraState.stream) {
                initializeCamera('user');
            }
        } else if (tab === 'upload') {
            document.getElementById('upload-section').classList.add('active');
            stopCamera(); // Stop camera when switching away
        } else if (tab === 'gallery') {
            document.getElementById('preview-section').classList.remove('hidden');
            stopCamera(); // Stop camera when switching away
            loadPreviews();
        }
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopCamera();
});