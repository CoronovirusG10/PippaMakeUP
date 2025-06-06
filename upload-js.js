// Pippa of London - File Upload Handling

// DOM Elements
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// File validation settings
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Initialize upload handlers
document.addEventListener('DOMContentLoaded', () => {
    setupDropZone();
    setupFileInput();
});

// Setup drop zone
function setupDropZone() {
    // Click to open file picker
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Prevent default drag behavior on document
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

// Setup file input
function setupFileInput() {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFiles(files);
        }
        // Reset input to allow selecting same file again
        fileInput.value = '';
    });
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Only remove class if leaving the drop zone entirely
    const rect = dropZone.getBoundingClientRect();
    if (e.clientX <= rect.left || e.clientX >= rect.right ||
        e.clientY <= rect.top || e.clientY >= rect.bottom) {
        dropZone.classList.remove('drag-over');
    }
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        handleFiles(files);
    }
}

// Handle multiple files
async function handleFiles(files) {
    // Check current storage count
    const currentMedia = await getStoredMedia();
    if (currentMedia.length >= 5) {
        showToast('Gallery is full. Please delete some items first.', 'warning');
        return;
    }
    
    // Process files one by one
    for (const file of files) {
        // Check if we've reached the limit
        const updatedMedia = await getStoredMedia();
        if (updatedMedia.length >= 5) {
            showToast('Gallery limit reached. Some files were not uploaded.', 'warning');
            break;
        }
        
        await processFile(file);
    }
    
    // Update gallery count
    updateGalleryCount();
}

// Process single file
async function processFile(file) {
    try {
        // Validate file
        const validationResult = validateFile(file);
        if (!validationResult.valid) {
            showToast(validationResult.error, 'error');
            return;
        }
        
        // Show progress
        showUploadProgress(file.name);
        
        // Process based on file type
        let processedFile;
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            processedFile = await processImage(file);
        } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
            processedFile = await processVideo(file);
        }
        
        // Create media object
        const mediaData = await createUploadMediaObject(processedFile, file.type);
        
        // Save to storage
        await saveMediaToStorage(mediaData);
        
        // Hide progress
        hideUploadProgress();
        
        showToast(`${file.name} uploaded successfully!`, 'success');
        
    } catch (error) {
        console.error('File processing error:', error);
        hideUploadProgress();
        showToast(`Failed to process ${file.name}`, 'error');
    }
}

// Validate file
function validateFile(file) {
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported file type. Please upload JPG, PNG, MP4, or MOV files.`
        };
    }
    
    // Check file size
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);
    
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'videos'}.`
        };
    }
    
    return { valid: true };
}

// Process image file
async function processImage(file) {
    return new Promise((resolve, reject) => {
        // Update progress
        updateProgress(30, 'Compressing image...');
        
        // Use CompressorJS
        new Compressor(file, {
            quality: 0.85,
            maxWidth: 1920,
            maxHeight: 1080,
            success(result) {
                updateProgress(100, 'Complete!');
                resolve(result);
            },
            error(err) {
                reject(err);
            }
        });
    });
}

// Process video file
async function processVideo(file) {
    // For prototype, just validate and return original file
    updateProgress(50, 'Validating video...');
    
    // Check video duration (simplified for prototype)
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
            updateProgress(100, 'Complete!');
            
            if (video.duration > 10) {
                showToast('Video is longer than 10 seconds. It will be trimmed.', 'warning');
            }
            
            resolve(file);
        };
        
        video.onerror = () => {
            reject(new Error('Invalid video file'));
        };
        
        video.src = URL.createObjectURL(file);
    });
}

// Create media object for uploaded file
async function createUploadMediaObject(file, mimeType) {
    const mediaId = generateUUID();
    const base64 = await blobToBase64(file);
    const type = mimeType.startsWith('image/') ? 'photo' : 'video';
    
    // Get metadata
    let metadata = {
        size: file.size
    };
    
    if (type === 'photo') {
        const dimensions = await getImageDimensions(file);
        metadata = { ...metadata, ...dimensions };
    } else {
        // For video, use default dimensions
        metadata.width = 1280;
        metadata.height = 720;
        metadata.duration = 10; // Default to 10 seconds
    }
    
    // Generate thumbnail for videos
    let thumbnail = null;
    if (type === 'video') {
        thumbnail = await generateVideoThumbnail(file);
    }
    
    return {
        mediaId: mediaId,
        type: type,
        file: base64,
        thumbnail: thumbnail,
        timestamp: new Date().toISOString(),
        metadata: metadata,
        source: 'upload'
    };
}

// Generate video thumbnail
async function generateVideoThumbnail(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        video.onloadeddata = () => {
            video.currentTime = 1; // Seek to 1 second
        };
        
        video.onseeked = () => {
            canvas.width = 320;
            canvas.height = 180;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                blobToBase64(blob).then(resolve);
            }, 'image/jpeg', 0.7);
        };
        
        video.onerror = () => {
            resolve(null); // Return null if thumbnail generation fails
        };
        
        video.src = URL.createObjectURL(file);
    });
}

// Show upload progress
function showUploadProgress(fileName) {
    uploadProgress.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = `Processing ${fileName}...`;
}

// Update progress
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    if (text) {
        progressText.textContent = text;
    }
}

// Hide upload progress
function hideUploadProgress() {
    setTimeout(() => {
        uploadProgress.classList.add('hidden');
        progressFill.style.width = '0%';
    }, 500);
}

// Utility: Get image dimensions
async function getImageDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        };
        img.onerror = () => {
            resolve({ width: 0, height: 0 });
        };
        img.src = URL.createObjectURL(file);
    });
}

// Integration with gallery
document.querySelector('[data-tab="upload"]').addEventListener('click', () => {
    // Reset upload UI when switching to upload tab
    hideUploadProgress();
    dropZone.classList.remove('drag-over');
});