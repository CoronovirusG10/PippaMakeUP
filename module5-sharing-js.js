// sharing.js - Social sharing functionality for Pippa of London results

// Global variables
let currentAnalysisData = null;
let shareableLink = '';

// Initialize sharing module
function initializeSharing() {
    // Get current analysis data
    currentAnalysisData = JSON.parse(
        sessionStorage.getItem('currentAnalysis') || 
        localStorage.getItem('lastAnalysis') || 
        'null'
    );
    
    // Set up share button listeners
    setupShareListeners();
    
    // Generate shareable link
    generateShareableLink();
}

// Set up share button event listeners
function setupShareListeners() {
    // Share platform buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', handleSocialShare);
    });
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', handleCopyLink);
    }
}

// Generate shareable preview image
function generateSharePreview() {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, '#FFC0CB');
    gradient.addColorStop(1, '#FFB6C1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);
    
    // Add brand logo/text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pippa of London', 200, 50);
    
    ctx.font = '16px Poppins, sans-serif';
    ctx.fillText('AI Color Match Results', 200, 80);
    
    if (currentAnalysisData && currentAnalysisData.skinTone) {
        // Draw skin tone circle
        const centerX = 200;
        const centerY = 180;
        const radius = 60;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Skin tone circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = currentAnalysisData.skinTone.hex;
        ctx.fill();
        
        // Undertone label
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 18px Poppins, sans-serif';
        ctx.fillText(`${currentAnalysisData.skinTone.undertone.charAt(0).toUpperCase() + 
                      currentAnalysisData.skinTone.undertone.slice(1)} Undertone`, 200, 270);
        
        // Monk scale
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText(`Monk Scale: ${currentAnalysisData.skinTone.monkScale}/10`, 200, 300);
        
        // Top matches
        if (currentRecommendations && currentRecommendations.length > 0) {
            ctx.fillStyle = '#666666';
            ctx.font = '14px Poppins, sans-serif';
            ctx.fillText('Perfect Matches Found:', 200, 340);
            
            // Show top 3 categories
            const categories = ['Foundation', 'Concealer', 'Lipstick'];
            categories.forEach((cat, index) => {
                const matches = currentRecommendations.filter(r => 
                    r.category === cat.toLowerCase()
                ).length;
                if (matches > 0) {
                    ctx.fillText(`${cat}: ${matches} shades`, 200, 365 + (index * 20));
                }
            });
        }
    }
    
    // Add watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Poppins, sans-serif';
    ctx.fillText('pippaof london.com', 200, 390);
}

// Handle social media sharing
function handleSocialShare(e) {
    const platform = e.currentTarget.dataset.platform;
    const shareUrl = shareableLink || window.location.href;
    const shareText = generateShareText();
    
    let url = '';
    
    switch (platform) {
        case 'instagram':
            // Instagram doesn't have direct web sharing, show instructions
            showInstagramShareInstructions();
            return;
            
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
            
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    // Track share event
    trackShareEvent(platform);
}

// Generate share text based on results
function generateShareText() {
    if (!currentAnalysisData || !currentAnalysisData.skinTone) {
        return 'I just found my perfect makeup shades with Pippa of London\'s AI color matching! 💄✨';
    }
    
    const undertone = currentAnalysisData.skinTone.undertone;
    const matchCount = currentRecommendations ? currentRecommendations.length : 0;
    
    return `Just discovered I have ${undertone} undertones and found ${matchCount}+ perfect makeup matches with @PippaofLondon's AI color analysis! 💄✨ #AIBeauty #ColorMatch`;
}

// Show Instagram sharing instructions
function showInstagramShareInstructions() {
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="instagram-share-instructions">
            <h3>Share on Instagram</h3>
            <div class="instruction-steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <p>Save the image below to your device</p>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <p>Open Instagram and create a new post</p>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <p>Upload the saved image</p>
                </div>
                <div class="step">
                    <span class="step-number">4</span>
                    <p>Copy and paste this caption:</p>
                </div>
            </div>
            <div class="instagram-caption">
                <textarea id="instagram-caption" readonly>${generateInstagramCaption()}</textarea>
                <button class="btn-secondary" onclick="copyInstagramCaption()">Copy Caption</button>
            </div>
            <div class="share-image-container">
                <canvas id="instagram-canvas" width="400" height="400"></canvas>
                <button class="btn-primary" onclick="downloadShareImage()">Download Image</button>
            </div>
        </div>
    `;
    
    // Show the modal
    document.getElementById('product-modal').classList.add('active');
    
    // Generate Instagram-specific image
    generateInstagramImage();
}

// Generate Instagram caption
function generateInstagramCaption() {
    const undertone = currentAnalysisData?.skinTone?.undertone || 'my';
    return `Just discovered my perfect shades! 💄✨

I have ${undertone} undertones and found my ideal makeup matches using AI color analysis by @pippaof london

No more guessing games when shopping for foundation! 🎯

#AIBeauty #ColorMatch #MakeupTech #PippaofLondon #BeautyTech #FoundationMatch #MakeupLovers #BeautyCommunity`;
}

// Copy Instagram caption to clipboard
function copyInstagramCaption() {
    const textarea = document.getElementById('instagram-caption');
    textarea.select();
    document.execCommand('copy');
    showToast('Caption copied to clipboard!', 'success');
}

// Generate Instagram-friendly square image
function generateInstagramImage() {
    const canvas = document.getElementById('instagram-canvas');
    const ctx = canvas.getContext('2d');
    
    // Similar to share preview but optimized for Instagram
    generateSharePreview(); // Reuse the share preview generation
    
    // Copy from share canvas to Instagram canvas
    const shareCanvas = document.getElementById('share-canvas');
    ctx.drawImage(shareCanvas, 0, 0);
}

// Download share image
function downloadShareImage() {
    const canvas = document.getElementById('instagram-canvas') || document.getElementById('share-canvas');
    const link = document.createElement('a');
    
    link.download = `pippa-color-match-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showToast('Image downloaded!', 'success');
}

// Generate shareable link
function generateShareableLink() {
    // In a real app, this would create a unique URL for sharing
    const baseUrl = window.location.origin;
    const resultsId = currentAnalysisData?.analysisId || 'demo';
    
    shareableLink = `${baseUrl}/shared-results/${resultsId}`;
    
    // Update share link input
    const shareLinkInput = document.getElementById('share-link-input');
    if (shareLinkInput) {
        shareLinkInput.value = shareableLink;
    }
}

// Handle copy link
function handleCopyLink() {
    const input = document.getElementById('share-link-input');
    input.select();
    document.execCommand('copy');
    
    showToast('Link copied to clipboard!', 'success');
}

// Track share events
function trackShareEvent(platform) {
    // Analytics tracking
    const shareData = {
        platform: platform,
        timestamp: new Date().toISOString(),
        analysisId: currentAnalysisData?.analysisId,
        userId: JSON.parse(sessionStorage.getItem('currentUser'))?.userId
    };
    
    // Save to localStorage for prototype analytics
    const shares = JSON.parse(localStorage.getItem('shareAnalytics') || '[]');
    shares.push(shareData);
    localStorage.setItem('shareAnalytics', JSON.stringify(shares));
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('resultsShared', {
        detail: shareData
    }));
}

// Create shareable results summary
function createShareableSummary() {
    if (!currentAnalysisData) return null;
    
    return {
        skinTone: {
            hex: currentAnalysisData.skinTone.hex,
            undertone: currentAnalysisData.skinTone.undertone,
            monkScale: currentAnalysisData.skinTone.monkScale
        },
        topMatches: currentRecommendations.slice(0, 5).map(rec => ({
            productName: rec.productName,
            shadeName: rec.shadeName,
            matchScore: rec.matchScore
        })),
        timestamp: new Date().toISOString()
    };
}

// Share via Web Share API (if available)
function shareViaWebAPI() {
    if (navigator.share) {
        const shareData = {
            title: 'My Pippa Color Match Results',
            text: generateShareText(),
            url: shareableLink
        };
        
        navigator.share(shareData)
            .then(() => {
                showToast('Shared successfully!', 'success');
                trackShareEvent('web-share-api');
            })
            .catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to modal
        document.getElementById('share-modal').classList.add('active');
        generateSharePreview();
    }
}

// Email share functionality
function shareViaEmail() {
    const subject = 'My Pippa of London Color Match Results';
    const body = `Hi!

I just discovered my perfect makeup shades using Pippa of London's AI color matching technology.

Here are my results:
- Undertone: ${currentAnalysisData?.skinTone?.undertone || 'Not analyzed'}
- Monk Scale: ${currentAnalysisData?.skinTone?.monkScale || 'Not analyzed'}/10

Top Matches:
${currentRecommendations.slice(0, 3).map(rec => 
    `- ${rec.productName} in ${rec.shadeName}`
).join('\n')}

Try it yourself at: ${shareableLink}

Best,
[Your name]`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

// Add share styles
const shareStyles = `
<style>
.instagram-share-instructions {
    padding: var(--spacing-lg);
}

.instruction-steps {
    margin: var(--spacing-lg) 0;
}

.step {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--primary-pink);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
}

.instagram-caption {
    margin-bottom: var(--spacing-lg);
}

#instagram-caption {
    width: 100%;
    height: 120px;
    padding: var(--spacing-md);
    border: 1px solid var(--neutral-300);
    border-radius: var(--radius-md);
    resize: none;
    font-family: var(--font-primary);
    margin-bottom: var(--spacing-sm);
}

.share-image-container {
    text-align: center;
}

#instagram-canvas {
    max-width: 100%;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-md);
}

.share-link {
    margin-top: var(--spacing-md);
}

.share-preview {
    background: var(--neutral-100);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
}
</style>
`;

// Inject styles when module loads
if (!document.getElementById('share-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'share-styles';
    styleElement.innerHTML = shareStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Export functions for use in other modules
window.sharingModule = {
    initializeSharing,
    shareViaWebAPI,
    shareViaEmail,
    generateSharePreview,
    createShareableSummary
};