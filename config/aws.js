const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// S3 configuration
const s3Config = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION
};

// Debug: Log configuration (remove in production)
console.log('AWS Configuration:', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_S3_BUCKET_NAME
});

// Upload file to S3
const uploadToS3 = async (file, key, contentType) => {
  try {
    if (!s3Config.bucketName) {
      throw new Error('AWS S3 bucket name is not configured');
    }
    
    const uploadParams = {
      Bucket: s3Config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
      ACL: 'public-read' // Make files publicly accessible
    };

    console.log('Uploading to S3 with params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType
    });

    const result = await s3.upload(uploadParams).promise();
    console.log('S3 upload successful:', result.Location);
    return result.Location; // Return the public URL
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: s3Config.bucketName,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// Generate unique key for file
const generateFileKey = (originalName, prefix = 'kyc') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
};

// Extract key from S3 URL
const extractKeyFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // Remove protocol, domain, and bucket name
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
};

module.exports = {
  s3,
  s3Config,
  uploadToS3,
  deleteFromS3,
  generateFileKey,
  extractKeyFromUrl
};
