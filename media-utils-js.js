// Pippa of London - Media Processing Utilities

// Storage key for media
const MEDIA_STORAGE_KEY = 'pippa_media_captures';
const MAX_STORAGE_ITEMS = 5;

// Generate UUID for media items
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Convert blob to base64
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Convert base64 to blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// Compress image using CompressorJS
async function compressImage(blob, quality = 0.85) {
    return new Promise((resolve, reject) => {
        new Compressor(blob, {
            quality: quality,
            maxWidth: 1920,
            maxHeight: 1080,
            success(result) {
                resolve(result);
            },
            error(err) {
                console.error('Compression error:', err);
                resolve(blob); // Return original if compression fails
            }
        });
    });
}

// Save media to localStorage
async function saveMediaToStorage(mediaData) {
    try {
        // Get existing media
        const existingMedia = await getStoredMedia();
        
        // Check storage limit
        if (existingMedia.length >= MAX_STORAGE_ITEMS) {
            throw new Error('Storage limit reached');
        }
        
        // Add new media to beginning of array
        existingMedia.unshift(mediaData);
        
        // Save to localStorage
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(existingMedia));
        
        // Update global state if available
        if (window.AppState) {
            window.AppState.media.currentImage = mediaData;
            window.AppState.media.analysisHistory = existingMedia;
        }
        
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
            showToast('Storage quota exceeded. Please delete some items.', 'error');
        } else {
            showToast('Failed to save media', 'error');
        }
        
        return false;
    }
}

// Get stored media from localStorage
async function getStoredMedia() {
    try {
        const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error retrieving media:', error);
        return [];
    }
}

// Delete media from storage
async function deleteMediaFromStorage(mediaId) {
    try {
        const media = await getStoredMedia();
        const filtered = media.filter(item => item.mediaId !== mediaId);
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(filtered));
        
        // Update global state
        if (window.AppState) {
            window.AppState.media.analysisHistory = filtered;
            
            // Clear current image if it was deleted
            if (window.AppState.media.currentImage?.mediaId === mediaId) {
                window.AppState.media.currentImage = null;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
}

// Clear all media from storage
async function clearAllMedia() {
    try {
        localStorage.removeItem(MEDIA_STORAGE_KEY);
        
        // Update global state
        if (window.AppState) {
            window.AppState.media.currentImage = null;
            window.AppState.media.analysisHistory = [];
        }
        
        return true;
    } catch (error) {
        console.error('Clear error:', error);
        return false;
    }
}

// Update gallery count badge
function updateGalleryCount() {
    getStoredMedia().then(media => {
        const galleryCount = document.getElementById('gallery-count');
        const count = media.length;
        
        if (count > 0) {
            galleryCount.textContent = count;
            galleryCount.classList.remove('hidden');
        } else {
            galleryCount.classList.add('hidden');
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#27AE60"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#E74C3C"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#F39C12"><path d="M1 19h18L10 1 1 19zm9-3h0v-2h0v2zm0-4h0V8h0v4z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#3498DB"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15h-2v-6h2v6zm0-8h-2V5h2v2z"/></svg>'
    };
    
    toast.innerHTML = `
        ${icons[type] || icons.info}
        <span>${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Check browser compatibility
function checkBrowserCompatibility() {
    const issues = [];
    
    // Check for required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        issues.push('Camera API not supported');
    }
    
    if (!window.MediaRecorder) {
        issues.push('Video recording not supported');
    }
    
    if (!window.FileReader) {
        issues.push('File upload not supported');
    }
    
    if (!window.localStorage) {
        issues.push('Local storage not supported');
    }
    
    // Show warning if issues found
    if (issues.length > 0) {
        const message = 'Your browser may not support all features: ' + issues.join(', ');
        showToast(message, 'warning');
        
        // Log detailed browser info
        console.warn('Browser compatibility issues:', {
            userAgent: navigator.userAgent,
            issues: issues
        });
    }
    
    return issues.length === 0;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check browser compatibility
    checkBrowserCompatibility();
    
    // Update gallery count
    updateGalleryCount();
    
    // Clean up old blob URLs on page load
    performance.getEntriesByType('resource').forEach(resource => {
        if (resource.name.startsWith('blob:')) {
            URL.revokeObjectURL(resource.name);
        }
    });
});

// MediaRecorder polyfill check
if (!window.MediaRecorder) {
    console.warn('MediaRecorder not supported. Video recording will be disabled.');
    
    // Hide video recording UI elements
    document.addEventListener('DOMContentLoaded', () => {
        const captureButton = document.getElementById('capture-photo');
        if (captureButton) {
            captureButton.removeEventListener('mousedown', startLongPress);
            captureButton.removeEventListener('touchstart', startLongPress);
        }
    });
}

// Export utilities for use in other modules
window.MediaUtils = {
    generateUUID,
    blobToBase64,
    base64ToBlob,
    compressImage,
    saveMediaToStorage,
    getStoredMedia,
    deleteMediaFromStorage,
    clearAllMedia,
    updateGalleryCount,
    showToast
};