// Pippa of London - Media Preview Handling

// State management
let selectedMediaId = null;

// DOM Elements
const previewGallery = document.getElementById('preview-gallery');
const addMoreButton = document.getElementById('add-more');
const useSelectedButton = document.getElementById('use-selected');

// Initialize preview handlers
document.addEventListener('DOMContentLoaded', () => {
    setupPreviewHandlers();
});

// Setup preview handlers
function setupPreviewHandlers() {
    // Add more button
    addMoreButton.addEventListener('click', () => {
        // Switch to camera tab
        document.querySelector('[data-tab="camera"]').click();
    });
    
    // Use selected button
    useSelectedButton.addEventListener('click', async () => {
        if (!selectedMediaId) {
            showToast('Please select a photo first', 'warning');
            return;
        }
        
        await useSelectedMedia();
    });
}

// Load and display previews
async function loadPreviews() {
    const media = await getStoredMedia();
    
    // Clear gallery
    previewGallery.innerHTML = '';
    
    if (media.length === 0) {
        // Show empty state
        previewGallery.innerHTML = `
            <div class="empty-gallery">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p>No captures yet</p>
                <p>Take a photo or upload an image to get started</p>
            </div>
        `;
        useSelectedButton.disabled = true;
        return;
    }
    
    // Create preview items
    media.forEach((item, index) => {
        const previewItem = createPreviewItem(item, index);
        previewGallery.appendChild(previewItem);
    });
    
    // Select first item by default
    if (media.length > 0 && !selectedMediaId) {
        selectMedia(media[0].mediaId);
    }
}

// Create preview item element
function createPreviewItem(mediaData, index) {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.dataset.mediaId = mediaData.mediaId;
    
    // Create media element
    if (mediaData.type === 'photo') {
        const img = document.createElement('img');
        img.src = mediaData.file;
        img.alt = `Capture ${index + 1}`;
        div.appendChild(img);
    } else if (mediaData.type === 'video') {
        // For videos, show thumbnail if available, otherwise show video
        if (mediaData.thumbnail) {
            const img = document.createElement('img');
            img.src = mediaData.thumbnail;
            img.alt = `Video ${index + 1}`;
            div.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = mediaData.file;
            video.muted = true;
            video.loop = true;
            video.playsinline = true;
            div.appendChild(video);
            
            // Play on hover
            div.addEventListener('mouseenter', () => video.play());
            div.addEventListener('mouseleave', () => video.pause());
        }
        
        // Add video type indicator
        const typeIndicator = document.createElement('span');
        typeIndicator.className = 'preview-type';
        typeIndicator.textContent = 'Video';
        div.appendChild(typeIndicator);
    }
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'preview-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteMedia(mediaData.mediaId);
    };
    div.appendChild(deleteBtn);
    
    // Add click handler for selection
    div.addEventListener('click', () => {
        selectMedia(mediaData.mediaId);
    });
    
    return div;
}

// Select media item
function selectMedia(mediaId) {
    // Remove previous selection
    document.querySelectorAll('.preview-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    const selectedItem = document.querySelector(`[data-media-id="${mediaId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedMediaId = mediaId;
        useSelectedButton.disabled = false;
        
        // Update global state
        if (window.AppState) {
            getStoredMedia().then(media => {
                const selectedMedia = media.find(m => m.mediaId === mediaId);
                if (selectedMedia) {
                    window.AppState.media.currentImage = selectedMedia;
                }
            });
        }
    }
}

// Delete media item
async function deleteMedia(mediaId) {
    // Confirm deletion
    if (!confirm('Delete this capture?')) {
        return;
    }
    
    // Delete from storage
    const success = await deleteMediaFromStorage(mediaId);
    
    if (success) {
        // Remove from DOM with animation
        const item = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.remove();
                
                // Reload previews
                loadPreviews();
                
                // Update gallery count
                updateGalleryCount();
                
                // If this was the selected item, clear selection
                if (selectedMediaId === mediaId) {
                    selectedMediaId = null;
                    useSelectedButton.disabled = true;
                }
            }, 300);
        }
        
        showToast('Capture deleted', 'success');
    } else {
        showToast('Failed to delete capture', 'error');
    }
}

// Use selected media for analysis
async function useSelectedMedia() {
    if (!selectedMediaId) return;
    
    const media = await getStoredMedia();
    const selectedMedia = media.find(m => m.mediaId === selectedMediaId);
    
    if (!selectedMedia) {
        showToast('Selected media not found', 'error');
        return;
    }
    
    // Check if it's a photo (videos not supported for analysis in prototype)
    if (selectedMedia.type !== 'photo') {
        showToast('Please select a photo for analysis. Video analysis coming soon!', 'warning');
        return;
    }
    
    // Update global state
    if (window.AppState) {
        window.AppState.media.currentImage = selectedMedia;
        window.AppState.ui.currentPage = 'analyze';
    }
    
    // Show loading state
    useSelectedButton.disabled = true;
    useSelectedButton.textContent = 'Preparing...';
    
    // Simulate navigation to analysis (would be actual routing in full app)
    setTimeout(() => {
        // Reset button
        useSelectedButton.disabled = false;
        useSelectedButton.textContent = 'Use Selected Photo';
        
        // Navigate to analysis
        if (window.location.pathname.includes('capture.html')) {
            // Store selected media ID in session storage for analysis page
            sessionStorage.setItem('selectedMediaId', selectedMediaId);
            
            // Navigate to analysis page (adjust path as needed)
            window.location.href = '../analysis/analyzer.html';
        } else {
            showToast('Analysis module will process this image', 'success');
        }
    }, 1000);
}

// Gallery tab click handler
document.addEventListener('DOMContentLoaded', () => {
    const galleryTab = document.querySelector('[data-tab="gallery"]');
    if (galleryTab) {
        galleryTab.addEventListener('click', () => {
            loadPreviews();
        });
    }
});

// Add styles for empty gallery state
const style = document.createElement('style');
style.textContent = `
    .empty-gallery {
        text-align: center;
        padding: 3rem;
        color: #999;
    }
    
    .empty-gallery svg {
        margin-bottom: 1rem;
    }
    
    .empty-gallery p {
        margin: 0.5rem 0;
        font-size: 0.875rem;
    }
    
    .empty-gallery p:first-of-type {
        font-size: 1rem;
        font-weight: 500;
        color: #666;
    }
`;
document.head.appendChild(style);

// Export preview functions
window.PreviewManager = {
    loadPreviews,
    selectMedia,
    deleteMedia,
    useSelectedMedia
};