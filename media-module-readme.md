# Module 2: Media Capture & Upload Interface

## Overview

The Media Capture module for Pippa of London provides a comprehensive solution for capturing and uploading photos/videos for beauty analysis. Built with vanilla JavaScript and designed for the funding demo prototype, it offers an elegant, mobile-first interface that works across modern browsers.

## Features

### Camera Capture
- **Front/Back Camera Support**: Easy switching between cameras on mobile devices
- **Photo Capture**: High-resolution photo capture with instant preview
- **Video Recording**: Up to 10-second video clips (long-press capture button)
- **Face Guide Overlay**: Visual guide helps users position their face correctly
- **Lighting Detection**: Automatic warnings for poor lighting conditions
- **Real-time Preview**: Live camera feed with mirrored display for selfies

### File Upload
- **Drag & Drop**: Intuitive drag-and-drop zone for desktop users
- **File Picker**: Traditional file selection for all devices
- **Multi-file Support**: Upload multiple files at once
- **Format Support**: JPG, PNG images and MP4, MOV videos
- **Size Limits**: 10MB for images, 50MB for videos
- **Progress Indicators**: Visual feedback during file processing

### Gallery Management
- **Preview Gallery**: View all captured/uploaded media
- **Selection System**: Select media for analysis
- **Delete Function**: Remove unwanted captures
- **Storage Limit**: Maximum 5 items to prevent storage bloat
- **Persistence**: Media survives browser refresh

## Technical Specifications

### Dependencies
- **CompressorJS**: For client-side image compression
- **MediaDevices API**: For camera access
- **MediaRecorder API**: For video recording
- **localStorage**: For media persistence

### Browser Support
- Chrome 88+
- Safari 14+
- Firefox 85+
- Edge 88+
- iOS 14+
- Android 8+

### File Structure
```
media/
├── capture.html          # Main interface
├── camera.js            # Camera functionality
├── upload.js            # Upload handling
├── media-utils.js       # Shared utilities
├── capture.css          # Styling
├── preview.js           # Gallery management
└── ../integration/
    └── state-manager.js # State management
```

## Setup Instructions

1. **Include CompressorJS**:
   The HTML already includes the CDN link:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/compressorjs/1.2.1/compressor.min.js"></script>
   ```

2. **File Organization**:
   Place all files in the correct directory structure as shown above.

3. **Integration**:
   The module integrates with the global state manager. Ensure `state-manager.js` is available.

4. **HTTPS Required**:
   Camera access requires HTTPS. Use a local HTTPS server for development:
   ```bash
   # Using Python
   python -m http.server 8000 --bind 127.0.0.1
   
   # Or use a tool like 'serve' with HTTPS
   npx serve -s . --ssl-cert cert.pem --ssl-key key.pem
   ```

## Usage

### Basic Implementation
```html
<!-- Include in your main app -->
<a href="media/capture.html">Start Analysis</a>
```

### Programmatic Access
```javascript
// Get captured media
const media = await MediaUtils.getStoredMedia();

// Get selected media from state
const selected = window.AppState.media.currentImage;

// Clear all media
await MediaUtils.clearAllMedia();
```

### Data Format
Media objects follow this structure:
```javascript
{
  mediaId: "uuid",
  type: "photo|video",
  file: "data:image/jpeg;base64,...",
  timestamp: "2025-06-06T10:00:00Z",
  metadata: {
    width: 1920,
    height: 1080,
    size: 2048576,
    duration: 5.2 // for videos
  },
  source: "camera|upload"
}
```

## Styling & Branding

The module uses Pippa of London's brand colors:
- Primary Gold: `#D4A574`
- Secondary Pink: `#F8E8E0`
- Accent Rose: `#8B4B6B`
- Neutral Gray: `#F5F5F5`

The design follows a clean, premium beauty brand aesthetic with smooth animations and elegant typography.

## Mobile Considerations

- **Touch-optimized**: All interactive elements are at least 44px for easy tapping
- **Responsive Layout**: Adapts seamlessly from mobile to desktop
- **Performance**: Images are compressed to reduce data usage
- **Orientation**: Handles device rotation gracefully

## Integration with Other Modules

### Module 1 (Authentication)
- Check `window.AppState.user.isAuthenticated` before allowing access
- Redirect to auth if user not logged in

### Module 3 (Product Catalog)
- Selected media is passed for shade matching

### Module 4 (Analysis Engine)
- Access current image via `window.AppState.media.currentImage`
- Only photos are supported for analysis (not videos)

### Module 5 (Results Display)
- Analysis results reference the original media ID

## Error Handling

The module handles various error scenarios:
- Camera permission denied → Suggests using upload instead
- No camera available → Falls back to upload interface
- Storage quota exceeded → Prompts user to delete items
- Unsupported browser → Shows compatibility warning

## Performance Optimization

- Images compressed to 85% quality
- Maximum resolution: 1920x1080
- Lazy loading for gallery items
- Blob URLs cleaned up to prevent memory leaks

## Security Considerations

- No server uploads in prototype (all client-side)
- Media stored as base64 in localStorage
- No personal data transmitted
- Camera permissions requested only when needed

## Future Enhancements (Post-Prototype)

1. **Azure Integration**:
   - Upload to Azure Blob Storage
   - CDN delivery for performance
   - Server-side processing

2. **Advanced Features**:
   - Face detection pre-validation
   - Auto-crop to face region
   - Multiple face handling
   - HDR/lighting optimization

3. **Video Analysis**:
   - Frame extraction for analysis
   - Motion-based quality scoring
   - Automated best-frame selection

## Troubleshooting

### Camera Not Working
1. Check HTTPS is enabled
2. Verify camera permissions in browser
3. Close other apps using camera
4. Try refreshing the page

### Upload Issues
1. Check file format is supported
2. Verify file size is within limits
3. Ensure sufficient storage space
4. Try a different browser

### Storage Problems
1. Clear browser cache
2. Delete old captures
3. Check localStorage limits
4. Use incognito/private mode

## Demo Script

For funding demos, follow this flow:
1. Open the capture interface
2. Show the elegant face guide overlay
3. Capture a photo (note the smooth animation)
4. Demonstrate drag-and-drop upload
5. Show the gallery with multiple captures
6. Select an image for analysis
7. Highlight the mobile-responsive design

## Support

This is a prototype module. For production deployment:
- Add proper error logging
- Implement analytics tracking
- Add accessibility features (ARIA labels)
- Include unit tests
- Add TypeScript definitions