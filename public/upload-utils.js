/**
 * DataHarbour Image Upload Utilities
 * Reusable functions for handling image uploads across the application
 */

class ImageUploader {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB default
    this.maxFiles = options.maxFiles || 5;
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.onProgress = options.onProgress || (() => {});
  }

  /**
   * Upload a single image file
   * @param {File} file - The image file to upload
   * @returns {Promise} Upload result
   */
  async uploadSingle(file) {
    if (!this.validateFile(file)) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      this.onProgress(true);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        this.onSuccess(result);
        return result;
      } else {
        this.onError(result.error);
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.onError('Upload failed. Please try again.');
      return null;
    } finally {
      this.onProgress(false);
    }
  }

  /**
   * Upload multiple image files
   * @param {FileList|Array} files - The image files to upload
   * @returns {Promise} Upload result
   */
  async uploadMultiple(files) {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => this.validateFile(file, false));
    
    if (validFiles.length === 0) {
      this.onError('No valid image files selected.');
      return null;
    }

    if (validFiles.length > this.maxFiles) {
      this.onError(`Maximum ${this.maxFiles} files allowed.`);
      return null;
    }

    const formData = new FormData();
    validFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      this.onProgress(true);
      
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        this.onSuccess(result);
        return result;
      } else {
        this.onError(result.error);
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.onError('Upload failed. Please try again.');
      return null;
    } finally {
      this.onProgress(false);
    }
  }

  /**
   * Delete an uploaded image
   * @param {string} filename - The filename to delete
   * @returns {Promise} Delete result
   */
  async deleteImage(filename) {
    try {
      const response = await fetch(`/api/upload/image/${filename}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        this.onSuccess(result);
        return result;
      } else {
        this.onError(result.error);
        return null;
      }
    } catch (error) {
      console.error('Delete error:', error);
      this.onError('Delete failed. Please try again.');
      return null;
    }
  }

  /**
   * Validate a file before upload
   * @param {File} file - The file to validate
   * @param {boolean} showError - Whether to show error messages
   * @returns {boolean} Whether the file is valid
   */
  validateFile(file, showError = true) {
    if (!file) {
      if (showError) this.onError('No file selected.');
      return false;
    }

    if (!this.allowedTypes.includes(file.type)) {
      if (showError) this.onError('Only image files are allowed (JPG, PNG, GIF, WebP).');
      return false;
    }

    if (file.size > this.maxFileSize) {
      if (showError) this.onError(`File too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`);
      return false;
    }

    return true;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create a drag and drop area
   * @param {HTMLElement} element - The element to make droppable
   * @param {Function} onDrop - Callback when files are dropped
   */
  setupDragAndDrop(element, onDrop) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('dragover');
    });

    element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      element.classList.remove('dragover');
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('dragover');
      
      const files = Array.from(e.dataTransfer.files);
      onDrop(files);
    });
  }

  /**
   * Create an image preview element
   * @param {Object} fileInfo - File information from upload response
   * @param {Function} onDelete - Callback when delete button is clicked
   * @returns {HTMLElement} Preview element
   */
  createPreview(fileInfo, onDelete) {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    previewItem.style.cssText = `
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      background: white;
    `;
    
    previewItem.innerHTML = `
      <img src="${fileInfo.url}" alt="${fileInfo.originalname}" style="
        width: 100%;
        height: 200px;
        object-fit: cover;
      ">
      <div style="padding: 15px;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px; font-size: 0.9rem;">
          ${fileInfo.originalname}
        </div>
        <div style="color: #666; font-size: 0.8rem;">
          ${this.formatFileSize(fileInfo.size)}
        </div>
      </div>
      <button class="delete-btn" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(220, 53, 69, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      " title="Delete image">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add delete functionality
    const deleteBtn = previewItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      if (onDelete) {
        onDelete(fileInfo.filename);
      }
    });

    // Add hover effect to delete button
    deleteBtn.addEventListener('mouseenter', () => {
      deleteBtn.style.background = '#dc3545';
      deleteBtn.style.transform = 'scale(1.1)';
    });

    deleteBtn.addEventListener('mouseleave', () => {
      deleteBtn.style.background = 'rgba(220, 53, 69, 0.9)';
      deleteBtn.style.transform = 'scale(1)';
    });
    
    return previewItem;
  }
}

/**
 * Quick upload function for simple use cases
 * @param {File|FileList} files - File(s) to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result
 */
async function quickUpload(files, options = {}) {
  const uploader = new ImageUploader(options);
  
  if (files instanceof FileList || Array.isArray(files)) {
    return await uploader.uploadMultiple(files);
  } else {
    return await uploader.uploadSingle(files);
  }
}

/**
 * Create a simple file input with upload functionality
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} File input element
 */
function createUploadInput(options = {}) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = options.multiple || false;
  input.style.display = 'none';
  
  const uploader = new ImageUploader(options);
  
  input.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      if (options.multiple) {
        await uploader.uploadMultiple(e.target.files);
      } else {
        await uploader.uploadSingle(e.target.files[0]);
      }
    }
  });
  
  return input;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageUploader, quickUpload, createUploadInput };
}