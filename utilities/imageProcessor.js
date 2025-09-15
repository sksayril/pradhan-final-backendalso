const sharp = require('sharp');

/**
 * Image processing utilities for KYC document uploads
 * Provides compression, resizing, and format optimization
 */

// Default compression settings
const DEFAULT_SETTINGS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  format: 'jpeg',
  progressive: true
};

// KYC-specific settings (optimized for document clarity)
const KYC_SETTINGS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 90,
  format: 'jpeg',
  progressive: true,
  preserveMetadata: false
};

/**
 * Compress and optimize image for KYC documents
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Compression options
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
const compressKycImage = async (imageBuffer, options = {}) => {
  try {
    const settings = { ...KYC_SETTINGS, ...options };
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length
    });

    // Process image with sharp
    let processor = sharp(imageBuffer)
      .resize(settings.maxWidth, settings.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: settings.quality,
        progressive: settings.progressive,
        mozjpeg: true
      });

    // Remove metadata for privacy
    if (!settings.preserveMetadata) {
      processor = processor.withMetadata(false);
    }

    const compressedBuffer = await processor.toBuffer();
    
    console.log('Compressed image info:', {
      originalSize: imageBuffer.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: ((imageBuffer.length - compressedBuffer.length) / imageBuffer.length * 100).toFixed(2) + '%',
      format: 'jpeg'
    });

    return compressedBuffer;
    
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Compress and optimize image for general use
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Compression options
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
const compressImage = async (imageBuffer, options = {}) => {
  try {
    const settings = { ...DEFAULT_SETTINGS, ...options };
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length
    });

    // Process image with sharp
    let processor = sharp(imageBuffer)
      .resize(settings.maxWidth, settings.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: settings.quality,
        progressive: settings.progressive,
        mozjpeg: true
      });

    // Remove metadata for privacy
    if (!settings.preserveMetadata) {
      processor = processor.withMetadata(false);
    }

    const compressedBuffer = await processor.toBuffer();
    
    console.log('Compressed image info:', {
      originalSize: imageBuffer.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: ((imageBuffer.length - compressedBuffer.length) / imageBuffer.length * 100).toFixed(2) + '%',
      format: 'jpeg'
    });

    return compressedBuffer;
    
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result
 */
const validateImage = (file) => {
  const errors = [];
  
  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('Image file is too large. Maximum size is 10MB.');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
  }
  
  // Check if it's actually an image
  if (!file.mimetype.startsWith('image/')) {
    errors.push('File must be an image.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get optimal compression settings based on file size and type
 * @param {Object} file - Multer file object
 * @returns {Object} - Compression settings
 */
const getOptimalSettings = (file) => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // For large files, use more aggressive compression
  if (fileSizeMB > 5) {
    return {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 80,
      format: 'jpeg'
    };
  } else if (fileSizeMB > 2) {
    return {
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 85,
      format: 'jpeg'
    };
  } else {
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 90,
      format: 'jpeg'
    };
  }
};

/**
 * Process image for KYC upload with validation and compression
 * @param {Object} file - Multer file object
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processed file object
 */
const processKycImage = async (file, options = {}) => {
  try {
    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }
    
    // Get optimal settings
    const settings = getOptimalSettings(file);
    
    // Compress image
    const compressedBuffer = await compressKycImage(file.buffer, settings);
    
    // Create new file object with compressed data
    const processedFile = {
      ...file,
      buffer: compressedBuffer,
      size: compressedBuffer.length,
      mimetype: 'image/jpeg',
      originalname: file.originalname.replace(/\.[^/.]+$/, '.jpg')
    };
    
    return processedFile;
    
  } catch (error) {
    console.error('KYC image processing error:', error);
    throw error;
  }
};

/**
 * Process image for general upload with validation and compression
 * @param {Object} file - Multer file object
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processed file object
 */
const processImage = async (file, options = {}) => {
  try {
    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }
    
    // Get optimal settings
    const settings = getOptimalSettings(file);
    
    // Compress image
    const compressedBuffer = await compressImage(file.buffer, settings);
    
    // Create new file object with compressed data
    const processedFile = {
      ...file,
      buffer: compressedBuffer,
      size: compressedBuffer.length,
      mimetype: 'image/jpeg',
      originalname: file.originalname.replace(/\.[^/.]+$/, '.jpg')
    };
    
    return processedFile;
    
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

/**
 * Batch process multiple images
 * @param {Array} files - Array of multer file objects
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of processed file objects
 */
const processMultipleImages = async (files, options = {}) => {
  try {
    const processedFiles = await Promise.all(
      files.map(file => processKycImage(file, options))
    );
    
    return processedFiles;
    
  } catch (error) {
    console.error('Batch image processing error:', error);
    throw error;
  }
};

module.exports = {
  compressKycImage,
  compressImage,
  validateImage,
  getOptimalSettings,
  processKycImage,
  processImage,
  processMultipleImages,
  DEFAULT_SETTINGS,
  KYC_SETTINGS
};
