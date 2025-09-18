const mongoose = require('mongoose');
const Thumbnail = require('../models/thumbnail.model');
require('dotenv').config();

// Test thumbnail creation without S3
const testThumbnailCreation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society-management');
    console.log('Connected to MongoDB');

    // Create a test thumbnail with placeholder URLs
    const testThumbnail = new Thumbnail({
      title: 'Test Image',
      description: 'Test thumbnail for development',
      originalImageUrl: 'https://via.placeholder.com/800x600/cccccc/666666?text=Test+Image',
      thumbnailUrl: 'https://via.placeholder.com/300x300/cccccc/666666?text=Thumbnail',
      fileName: 'test-image.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 800,
        height: 600
      },
      category: 'gallery',
      tags: ['test', 'development'],
      isPublic: true,
      isFeatured: false,
      altText: 'Test image for development',
      uploadedBy: new mongoose.Types.ObjectId() // Use a dummy ObjectId for testing
    });

    await testThumbnail.save();
    console.log('✅ Test thumbnail created successfully:', testThumbnail.thumbnailId);

    // Test retrieval
    const retrievedThumbnail = await Thumbnail.findOne({ thumbnailId: testThumbnail.thumbnailId });
    console.log('✅ Test thumbnail retrieved successfully:', retrievedThumbnail.title);

    // Clean up
    await Thumbnail.findByIdAndDelete(testThumbnail._id);
    console.log('✅ Test thumbnail deleted successfully');

    console.log('🎉 All tests passed! Thumbnail model is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testThumbnailCreation();
