# DataHarbour Image Upload System

## Overview
The DataHarbour application now includes a comprehensive image upload system that allows users to upload, manage, and delete images. This system is built with security, performance, and user experience in mind.

## Features

### ✅ Core Functionality
- **Single Image Upload**: Upload one image at a time
- **Multiple Image Upload**: Upload up to 5 images simultaneously
- **Drag & Drop Support**: Intuitive drag and drop interface
- **File Validation**: Automatic validation of file types and sizes
- **Image Preview**: Real-time preview of uploaded images
- **Delete Functionality**: Remove uploaded images
- **Progress Indicators**: Visual feedback during uploads

### ✅ Security Features
- **File Type Validation**: Only allows image files (JPG, PNG, GIF, WebP)
- **File Size Limits**: Maximum 5MB per file
- **Secure File Storage**: Files stored in protected directory
- **Unique Filenames**: Prevents filename conflicts and overwrites

### ✅ User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Visual Feedback**: Progress bars, success/error messages
- **Intuitive Interface**: Clean, modern design consistent with DataHarbour branding
- **Accessibility**: Proper ARIA labels and keyboard navigation

## API Endpoints

### Upload Single Image
```
POST /api/upload/image
Content-Type: multipart/form-data

Body: FormData with 'image' field
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "file": {
    "filename": "image-1234567890-123456789.jpg",
    "originalname": "my-photo.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "url": "/uploads/image-1234567890-123456789.jpg"
  }
}
```

### Upload Multiple Images
```
POST /api/upload/images
Content-Type: multipart/form-data

Body: FormData with 'images' field (array)
```

**Response:**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "files": [
    {
      "filename": "images-1234567890-123456789.jpg",
      "originalname": "photo1.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "url": "/uploads/images-1234567890-123456789.jpg"
    }
    // ... more files
  ]
}
```

### Delete Image
```
DELETE /api/upload/image/:filename
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## File Structure

```
DataHarbour/
├── routes/
│   └── upload.js              # Upload API routes
├── public/
│   ├── uploads/               # Uploaded images directory
│   ├── upload.html           # Upload page
│   ├── upload-utils.js       # Reusable upload utilities
│   └── style.css            # Includes upload styling
└── package.json             # Updated with multer dependency
```

## Usage Examples

### Basic Upload Page
Visit `/upload.html` for a full-featured upload interface with:
- Single and multiple file upload options
- Drag and drop areas
- Image previews
- Delete functionality
- Progress indicators

### Using the Upload Utilities

#### Include the utilities:
```html
<script src="upload-utils.js"></script>
```

#### Simple upload:
```javascript
// Quick upload function
const fileInput = document.getElementById('myFileInput');
fileInput.addEventListener('change', async (e) => {
  const result = await quickUpload(e.target.files[0], {
    onSuccess: (result) => console.log('Upload successful:', result),
    onError: (error) => console.error('Upload failed:', error),
    onProgress: (inProgress) => console.log('Uploading:', inProgress)
  });
});
```

#### Advanced usage with ImageUploader class:
```javascript
const uploader = new ImageUploader({
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  onSuccess: (result) => {
    console.log('Upload successful:', result);
    // Handle success
  },
  onError: (error) => {
    console.error('Upload error:', error);
    // Show error message
  },
  onProgress: (inProgress) => {
    // Show/hide progress indicator
    document.getElementById('progressBar').style.display = inProgress ? 'block' : 'none';
  }
});

// Upload single file
await uploader.uploadSingle(file);

// Upload multiple files
await uploader.uploadMultiple(files);

// Delete file
await uploader.deleteImage(filename);
```

#### Create drag and drop area:
```javascript
const dropArea = document.getElementById('dropArea');
uploader.setupDragAndDrop(dropArea, async (files) => {
  await uploader.uploadMultiple(files);
});
```

## Integration with Existing Pages

### Adding Upload to Navigation
The upload functionality has been added to the main navigation:
```html
<li class="nav-item">
  <a href="upload.html" class="nav-link">
    <i class="fas fa-cloud-upload-alt"></i>
    <span class="nav-tooltip">Upload Images</span>
  </a>
</li>
```

### Adding Quick Upload to Any Page
```html
<!-- Add to any page -->
<script src="upload-utils.js"></script>
<input type="file" id="quickUpload" accept="image/*" style="display: none;">
<button onclick="document.getElementById('quickUpload').click()">
  <i class="fas fa-upload"></i> Upload Image
</button>

<script>
document.getElementById('quickUpload').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const result = await quickUpload(e.target.files[0]);
    if (result) {
      alert('Image uploaded successfully!');
    }
  }
});
</script>
```

## Configuration

### File Size Limits
- **Default**: 5MB per file
- **Configurable**: Modify in `routes/upload.js`

### File Type Restrictions
- **Allowed**: JPG, PNG, GIF, WebP
- **Configurable**: Modify `fileFilter` in `routes/upload.js`

### Upload Directory
- **Location**: `public/uploads/`
- **Permissions**: Automatically created if doesn't exist
- **Access**: Served as static files via `/uploads/` URL

## Security Considerations

### File Validation
- ✅ MIME type checking
- ✅ File extension validation
- ✅ File size limits
- ✅ Unique filename generation

### Storage Security
- ✅ Files stored outside web root initially, then moved to public/uploads
- ✅ Unique filenames prevent conflicts
- ✅ No executable file uploads allowed

### Access Control
- ✅ Upload endpoints are accessible to all users
- ✅ Delete endpoints require proper filename
- ✅ No directory traversal vulnerabilities

## Error Handling

### Client-Side Errors
- Invalid file types
- File size exceeded
- Network errors
- Upload failures

### Server-Side Errors
- Disk space issues
- Permission problems
- Invalid requests
- File system errors

## Browser Compatibility

### Supported Features
- ✅ File API
- ✅ FormData
- ✅ Drag and Drop API
- ✅ Fetch API
- ✅ ES6+ JavaScript

### Fallbacks
- Progressive enhancement for older browsers
- Graceful degradation of drag and drop
- Standard file input fallback

## Performance Considerations

### File Size Optimization
- 5MB limit per file
- Client-side validation before upload
- Progress indicators for large files

### Server Performance
- Multer streaming for efficient memory usage
- Automatic cleanup of temporary files
- Error handling prevents memory leaks

## Troubleshooting

### Common Issues

1. **"Only image files are allowed" error**
   - Ensure file has proper image MIME type
   - Check file extension is .jpg, .png, .gif, or .webp

2. **"File too large" error**
   - Reduce image file size to under 5MB
   - Use image compression tools

3. **Upload fails silently**
   - Check browser console for errors
   - Verify server is running
   - Check network connectivity

4. **Images not displaying**
   - Verify `/uploads/` directory exists
   - Check file permissions
   - Ensure static file serving is configured

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment.

## Future Enhancements

### Planned Features
- [ ] Image resizing/compression
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image editing capabilities
- [ ] Batch operations
- [ ] User-specific upload folders
- [ ] Image metadata extraction
- [ ] Thumbnail generation

### Integration Opportunities
- Profile picture uploads
- Product image management
- Receipt/document uploads
- Marketing material uploads

## Installation

1. **Install Dependencies**:
   ```bash
   npm install multer
   ```

2. **Create Upload Directory**:
   ```bash
   mkdir public/uploads
   ```

3. **Update Server Configuration**:
   The upload routes are automatically included in `server.js`

4. **Test Upload Functionality**:
   Visit `/upload.html` to test the upload system

## Support

For issues or questions regarding the image upload system:
1. Check this documentation
2. Review browser console for errors
3. Check server logs for backend issues
4. Verify file permissions and disk space

---

**DataHarbour Image Upload System** - Built with security, performance, and user experience in mind.