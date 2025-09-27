const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-profile-picture.jpg');

// Create a test image if it doesn't exist
const createTestImage = () => {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image...');
    // Create a simple 1x1 pixel JPEG image
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
    ]);
    fs.writeFileSync(TEST_IMAGE_PATH, jpegHeader);
    console.log('Test image created successfully');
  }
};

// Test society member signup with profile picture
const testSocietyMemberSignupWithProfilePicture = async () => {
  try {
    console.log('Testing Society Member Signup with Profile Picture...\n');

    // Create test image
    createTestImage();

    // Create form data
    const formData = new FormData();
    
    // Add text fields
    formData.append('email', `test.member.${Date.now()}@example.com`);
    formData.append('password', 'TestMember123');
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('societyName', 'Tech Society');
    formData.append('position', 'President');
    formData.append('department', 'Computer Science');
    formData.append('phoneNumber', '+1234567890');
    formData.append('dateOfBirth', '1999-01-01');
    formData.append('address', JSON.stringify({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }));
    formData.append('skills', JSON.stringify(['Leadership', 'Event Management']));
    formData.append('responsibilities', JSON.stringify(['Organize events', 'Manage members']));
    
    // Add profile picture file
    formData.append('profilePicture', fs.createReadStream(TEST_IMAGE_PATH), {
      filename: 'test-profile-picture.jpg',
      contentType: 'image/jpeg'
    });

    console.log('Sending signup request with profile picture...');
    
    // Make the request
    const response = await axios.post(`${API_BASE_URL}/society-member/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('✅ Signup successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.member) {
      const member = response.data.data.member;
      console.log('\n📋 Member Details:');
      console.log(`- ID: ${member.id}`);
      console.log(`- Email: ${member.email}`);
      console.log(`- Name: ${member.firstName} ${member.lastName}`);
      console.log(`- Member ID: ${member.memberId}`);
      console.log(`- Society: ${member.societyName}`);
      console.log(`- Position: ${member.position}`);
      console.log(`- Profile Picture: ${member.profilePicture || 'Not uploaded'}`);
    }

    return response.data;

  } catch (error) {
    console.error('❌ Signup failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    
    throw error;
  }
};

// Test society member signup without profile picture
const testSocietyMemberSignupWithoutProfilePicture = async () => {
  try {
    console.log('\nTesting Society Member Signup without Profile Picture...\n');

    // Create form data
    const formData = new FormData();
    
    // Add text fields only
    formData.append('email', `test.member.no.pic.${Date.now()}@example.com`);
    formData.append('password', 'TestMember123');
    formData.append('firstName', 'Jane');
    formData.append('lastName', 'Smith');
    formData.append('societyName', 'Art Society');
    formData.append('position', 'Secretary');
    formData.append('department', 'Fine Arts');
    formData.append('phoneNumber', '+1234567891');
    formData.append('dateOfBirth', '1998-05-15');
    formData.append('address', JSON.stringify({
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }));
    formData.append('skills', JSON.stringify(['Art', 'Design']));
    formData.append('responsibilities', JSON.stringify(['Organize exhibitions', 'Manage social media']));

    console.log('Sending signup request without profile picture...');
    
    // Make the request
    const response = await axios.post(`${API_BASE_URL}/society-member/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('✅ Signup successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.member) {
      const member = response.data.data.member;
      console.log('\n📋 Member Details:');
      console.log(`- ID: ${member.id}`);
      console.log(`- Email: ${member.email}`);
      console.log(`- Name: ${member.firstName} ${member.lastName}`);
      console.log(`- Member ID: ${member.memberId}`);
      console.log(`- Society: ${member.societyName}`);
      console.log(`- Position: ${member.position}`);
      console.log(`- Profile Picture: ${member.profilePicture || 'Not uploaded'}`);
    }

    return response.data;

  } catch (error) {
    console.error('❌ Signup failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    
    throw error;
  }
};

// Test invalid file type
const testInvalidFileType = async () => {
  try {
    console.log('\nTesting Society Member Signup with Invalid File Type...\n');

    // Create a test text file
    const testTextPath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testTextPath, 'This is a test text file');

    // Create form data
    const formData = new FormData();
    
    // Add text fields
    formData.append('email', `test.member.invalid.${Date.now()}@example.com`);
    formData.append('password', 'TestMember123');
    formData.append('firstName', 'Invalid');
    formData.append('lastName', 'File');
    formData.append('societyName', 'Test Society');
    formData.append('position', 'Member');
    formData.append('department', 'Test Department');
    formData.append('phoneNumber', '+1234567892');
    formData.append('dateOfBirth', '1997-12-25');
    formData.append('address', JSON.stringify({
      street: '789 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA'
    }));
    
    // Add invalid file type
    formData.append('profilePicture', fs.createReadStream(testTextPath), {
      filename: 'test-file.txt',
      contentType: 'text/plain'
    });

    console.log('Sending signup request with invalid file type...');
    
    // Make the request
    const response = await axios.post(`${API_BASE_URL}/society-member/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('❌ Unexpected success - should have failed!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected invalid file type');
      console.log('Error message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:');
      console.error('Status:', error.response?.status);
      console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
  } finally {
    // Clean up test file
    const testTextPath = path.join(__dirname, 'test-file.txt');
    if (fs.existsSync(testTextPath)) {
      fs.unlinkSync(testTextPath);
    }
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Society Member Signup Tests with Profile Picture Upload\n');
    console.log('=' * 60);

    // Test 1: Signup with profile picture
    await testSocietyMemberSignupWithProfilePicture();

    // Test 2: Signup without profile picture
    await testSocietyMemberSignupWithoutProfilePicture();

    // Test 3: Invalid file type
    await testInvalidFileType();

    console.log('\n' + '=' * 60);
    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up test image
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      fs.unlinkSync(TEST_IMAGE_PATH);
      console.log('\n🧹 Cleaned up test files');
    }
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testSocietyMemberSignupWithProfilePicture,
  testSocietyMemberSignupWithoutProfilePicture,
  testInvalidFileType,
  runTests
};
