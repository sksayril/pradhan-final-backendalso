const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Create a test image if it doesn't exist
const createTestImage = () => {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image...');
    // Create a simple 1x1 pixel JPEG image
    const jpegData = Buffer.from([
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
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
      0x07, 0xFF, 0xD9
    ]);
    fs.writeFileSync(TEST_IMAGE_PATH, jpegData);
    console.log('Test image created successfully');
  }
};

// Test student signup with profile image
const testStudentSignupWithImage = async () => {
  try {
    console.log('\n=== Testing Student Signup with Profile Image ===');
    
    createTestImage();
    
    const formData = new FormData();
    
    // Add form fields
    formData.append('email', `student${Date.now()}@example.com`);
    formData.append('password', 'StudentPassword123');
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('department', 'Computer Science');
    formData.append('year', '3rd');
    formData.append('phoneNumber', '9876543210');
    formData.append('dateOfBirth', '2000-01-15');
    formData.append('address', JSON.stringify({
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001'
    }));
    formData.append('interests', 'Programming, Web Development');
    
    // Add profile picture
    formData.append('profilePicture', fs.createReadStream(TEST_IMAGE_PATH), {
      filename: 'profile.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${BASE_URL}/student/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Student signup with profile image successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data.student.profilePicture) {
      console.log('✅ Profile picture uploaded successfully!');
      console.log('Profile picture URL:', response.data.data.student.profilePicture);
    }
    
    return response.data.data.student;
    
  } catch (error) {
    console.error('❌ Student signup with profile image failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Test society member signup with profile image
const testSocietyMemberSignupWithImage = async () => {
  try {
    console.log('\n=== Testing Society Member Signup with Profile Image ===');
    
    createTestImage();
    
    const formData = new FormData();
    
    // Add form fields
    formData.append('email', `member${Date.now()}@example.com`);
    formData.append('password', 'MemberPassword123');
    formData.append('firstName', 'Jane');
    formData.append('lastName', 'Smith');
    formData.append('societyName', 'Tech Society');
    formData.append('position', 'Member');
    formData.append('department', 'Computer Science');
    formData.append('phoneNumber', '9876543211');
    formData.append('dateOfBirth', '1999-05-20');
    formData.append('address', JSON.stringify({
      street: '456 Oak Ave',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001'
    }));
    formData.append('skills', 'Leadership, Event Management');
    formData.append('responsibilities', 'Organize tech events, Manage social media');
    
    // Add profile picture
    formData.append('profilePicture', fs.createReadStream(TEST_IMAGE_PATH), {
      filename: 'profile.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${BASE_URL}/society-member/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Society member signup with profile image successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data.member.profilePicture) {
      console.log('✅ Profile picture uploaded successfully!');
      console.log('Profile picture URL:', response.data.data.member.profilePicture);
    }
    
    return response.data.data.member;
    
  } catch (error) {
    console.error('❌ Society member signup with profile image failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Test student signup without profile image
const testStudentSignupWithoutImage = async () => {
  try {
    console.log('\n=== Testing Student Signup without Profile Image ===');
    
    const formData = new FormData();
    
    // Add form fields
    formData.append('email', `student${Date.now()}@example.com`);
    formData.append('password', 'StudentPassword123');
    formData.append('firstName', 'Alice');
    formData.append('lastName', 'Johnson');
    formData.append('department', 'Electronics');
    formData.append('year', '2nd');
    formData.append('phoneNumber', '9876543212');
    formData.append('dateOfBirth', '2001-03-10');
    formData.append('address', JSON.stringify({
      street: '789 Pine St',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001'
    }));
    formData.append('interests', 'Electronics, Robotics');
    
    const response = await axios.post(`${BASE_URL}/student/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Student signup without profile image successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (!response.data.data.student.profilePicture) {
      console.log('✅ No profile picture (as expected)');
    }
    
    return response.data.data.student;
    
  } catch (error) {
    console.error('❌ Student signup without profile image failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Test invalid file type
const testInvalidFileType = async () => {
  try {
    console.log('\n=== Testing Invalid File Type ===');
    
    // Create a text file instead of image
    const textFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(textFilePath, 'This is not an image file');
    
    const formData = new FormData();
    
    // Add form fields
    formData.append('email', `student${Date.now()}@example.com`);
    formData.append('password', 'StudentPassword123');
    formData.append('firstName', 'Bob');
    formData.append('lastName', 'Wilson');
    formData.append('department', 'Mechanical');
    formData.append('year', '4th');
    
    // Add invalid file type
    formData.append('profilePicture', fs.createReadStream(textFilePath), {
      filename: 'test.txt',
      contentType: 'text/plain'
    });
    
    const response = await axios.post(`${BASE_URL}/student/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('❌ Invalid file type test failed - should have been rejected');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(textFilePath);
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Invalid file type correctly rejected!');
      console.log('Error message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
    
    // Clean up
    const textFilePath = path.join(__dirname, 'test-file.txt');
    if (fs.existsSync(textFilePath)) {
      fs.unlinkSync(textFilePath);
    }
  }
};

// Test large file size
const testLargeFileSize = async () => {
  try {
    console.log('\n=== Testing Large File Size ===');
    
    // Create a large file (simulate > 10MB)
    const largeFilePath = path.join(__dirname, 'large-image.jpg');
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    fs.writeFileSync(largeFilePath, largeBuffer);
    
    const formData = new FormData();
    
    // Add form fields
    formData.append('email', `student${Date.now()}@example.com`);
    formData.append('password', 'StudentPassword123');
    formData.append('firstName', 'Charlie');
    formData.append('lastName', 'Brown');
    formData.append('department', 'Civil');
    formData.append('year', '1st');
    
    // Add large file
    formData.append('profilePicture', fs.createReadStream(largeFilePath), {
      filename: 'large-image.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${BASE_URL}/student/signup`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('❌ Large file size test failed - should have been rejected');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    fs.unlinkSync(largeFilePath);
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Large file size correctly rejected!');
      console.log('Error message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
    
    // Clean up
    const largeFilePath = path.join(__dirname, 'large-image.jpg');
    if (fs.existsSync(largeFilePath)) {
      fs.unlinkSync(largeFilePath);
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Profile Image Upload Tests...\n');
  
  try {
    // Test 1: Student signup with profile image
    await testStudentSignupWithImage();
    
    // Test 2: Society member signup with profile image
    await testSocietyMemberSignupWithImage();
    
    // Test 3: Student signup without profile image
    await testStudentSignupWithoutImage();
    
    // Test 4: Invalid file type
    await testInvalidFileType();
    
    // Test 5: Large file size
    await testLargeFileSize();
    
    console.log('\n🎉 All profile image upload tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    // Clean up test files
    const testFiles = [
      path.join(__dirname, 'test-image.jpg'),
      path.join(__dirname, 'test-file.txt'),
      path.join(__dirname, 'large-image.jpg')
    ];
    
    testFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up: ${filePath}`);
      }
    });
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testStudentSignupWithImage,
  testSocietyMemberSignupWithImage,
  testStudentSignupWithoutImage,
  testInvalidFileType,
  testLargeFileSize,
  runTests
};
