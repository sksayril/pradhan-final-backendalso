const multer = require('multer');
const { uploadToS3, generateFileKey, deleteFromS3, extractKeyFromUrl } = require('../config/aws');
const { processKycImage, processImage, processMultipleImages } = require('../utilities/imageProcessor');

// Configure multer for memory storage (for S3 upload)
const storage = multer.memoryStorage();

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for profile picture uploads (JPG, JPEG, PNG only)
const profilePictureFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed for profile pictures'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware for multiple file uploads
const uploadMultiple = (fieldName, maxCount = 2) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for society member KYC uploads (specific field names)
const uploadSocietyMemberKyc = () => {
  return upload.fields([
    { name: 'aadharCardImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 }
  ]);
};

// Middleware for profile picture uploads (10MB limit, JPG/JPEG/PNG only)
const uploadProfilePicture = () => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: profilePictureFilter
  }).single('profilePicture');
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB for profile pictures.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  
  if (err.message === 'Only JPG, JPEG, and PNG files are allowed for profile pictures') {
    return res.status(400).json({
      success: false,
      message: 'Only JPG, JPEG, and PNG files are allowed for profile pictures.'
    });
  }
  
  next(err);
};

// Helper function to upload file to S3 and get URL
const uploadFileToS3 = async (file, prefix = 'kyc') => {
  try {
    const key = generateFileKey(file.originalname, prefix);
    const url = await uploadToS3(file, key, file.mimetype);
    return { url, key };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Helper function to process and upload KYC image to S3
const uploadKycImageToS3 = async (file, prefix = 'kyc') => {
  try {
    console.log('Processing KYC image for upload...');
    
    // Process and compress the image
    const processedFile = await processKycImage(file);
    
    // Generate unique key for S3
    const key = generateFileKey(processedFile.originalname, prefix);
    
    // Upload to S3
    const url = await uploadToS3(processedFile, key, processedFile.mimetype);
    
    console.log('KYC image uploaded successfully:', {
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(2) + '%',
      url: url
    });
    
    return { url, key, originalSize: file.size, compressedSize: processedFile.size };
  } catch (error) {
    console.error('Error processing and uploading KYC image to S3:', error);
    throw error;
  }
};

// Helper function to process and upload general image to S3
const uploadImageToS3 = async (file, prefix = 'images') => {
  try {
    console.log('Processing image for upload...');
    
    // Process and compress the image
    const processedFile = await processImage(file);
    
    // Generate unique key for S3
    const key = generateFileKey(processedFile.originalname, prefix);
    
    // Upload to S3
    const url = await uploadToS3(processedFile, key, processedFile.mimetype);
    
    console.log('Image uploaded successfully:', {
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(2) + '%',
      url: url
    });
    
    return { url, key, originalSize: file.size, compressedSize: processedFile.size };
  } catch (error) {
    console.error('Error processing and uploading image to S3:', error);
    throw error;
  }
};

// Helper function to upload profile picture to S3
const uploadProfilePictureToS3 = async (file) => {
  try {
    console.log('Processing profile picture for upload...');
    
    // Process and compress the image
    const processedFile = await processImage(file);
    
    // Generate unique key for S3 with profile-images prefix
    const key = generateFileKey(processedFile.originalname, 'profile-images');
    
    // Upload to S3
    const url = await uploadToS3(processedFile, key, processedFile.mimetype);
    
    console.log('Profile picture uploaded successfully:', {
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(2) + '%',
      url: url
    });
    
    return { url, key, originalSize: file.size, compressedSize: processedFile.size };
  } catch (error) {
    console.error('Error processing and uploading profile picture to S3:', error);
    throw error;
  }
};

// Helper function to upload student profile picture to S3 (under students/ folder)
const uploadStudentProfilePictureToS3 = async (file) => {
  try {
    console.log('Processing student profile picture for upload...');
    
    // Process and compress the image
    const processedFile = await processImage(file);
    
    // Generate unique key for S3 with students prefix
    const key = generateFileKey(processedFile.originalname, 'students');
    
    // Upload to S3
    const url = await uploadToS3(processedFile, key, processedFile.mimetype);
    
    console.log('Student profile picture uploaded successfully:', {
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(2) + '%',
      url: url
    });
    
    return { url, key, originalSize: file.size, compressedSize: processedFile.size };
  } catch (error) {
    console.error('Error processing and uploading student profile picture to S3:', error);
    throw error;
  }
};

// Helper function to process and upload multiple KYC images to S3
const uploadMultipleKycImagesToS3 = async (files, prefix = 'kyc') => {
  try {
    console.log(`Processing ${files.length} KYC images for upload...`);
    
    // Process and compress all images
    const processedFiles = await processMultipleImages(files);
    
    // Upload all processed images to S3
    const uploadResults = await Promise.all(
      processedFiles.map(async (processedFile) => {
        const key = generateFileKey(processedFile.originalname, prefix);
        const url = await uploadToS3(processedFile, key, processedFile.mimetype);
        return { url, key, originalSize: processedFile.size, compressedSize: processedFile.size };
      })
    );
    
    console.log('Multiple KYC images uploaded successfully');
    
    return uploadResults;
  } catch (error) {
    console.error('Error processing and uploading multiple KYC images to S3:', error);
    throw error;
  }
};

// Helper function to delete file from S3
const deleteFileFromS3 = async (url) => {
  try {
    const key = extractKeyFromUrl(url);
    if (key) {
      await deleteFromS3(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// File type validation for course materials
const validateCourseFileType = (file, allowedTypes) => {
  const fileType = file.mimetype;
  return allowedTypes.includes(fileType);
};

// Course file upload middleware
const uploadCourseFiles = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for course materials
      files: 3, // Maximum 3 files (thumbnail + coursePdf + syllabus)
      fieldSize: 10 * 1024 * 1024, // 10MB for field data
    },
    fileFilter: (req, file, cb) => {
      console.log('File upload attempt:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Allow images for thumbnails
      if (file.fieldname === 'thumbnail') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Thumbnail must be an image file (JPEG, PNG, GIF, WebP)'), false);
        }
      }
      // Allow PDFs for course materials (both coursePdf and syllabus)
      else if (file.fieldname === 'coursePdf' || file.fieldname === 'syllabus') {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Course material must be a PDF file'), false);
        }
      }
      else {
        cb(new Error(`Invalid file type for field: ${file.fieldname}. Allowed fields: thumbnail, coursePdf, syllabus`), false);
      }
    }
  });

  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'coursePdf', maxCount: 1 },
    { name: 'syllabus', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 100MB per file.'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 3 files allowed (thumbnail + coursePdf + syllabus).'
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Only thumbnail, coursePdf, and syllabus are allowed.'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    
    next();
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadSocietyMemberKyc,
  uploadProfilePicture,
  handleUploadError,
  uploadFileToS3,
  uploadKycImageToS3,
  uploadImageToS3,
  uploadProfilePictureToS3,
  uploadStudentProfilePictureToS3,
  uploadMultipleKycImagesToS3,
  deleteFileFromS3,
  uploadCourseFiles,
  validateCourseFileType
};
