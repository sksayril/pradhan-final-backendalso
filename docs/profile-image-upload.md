# Profile Image Upload System

## Overview

The Profile Image Upload System allows both students and society members to upload profile pictures during signup. The system includes automatic image processing, compression, and secure storage on AWS S3.

## Key Features

- **File Upload Support**: Students and society members can upload profile pictures during signup
- **Image Processing**: Automatic compression and optimization of uploaded images
- **Secure Storage**: Images are stored securely on AWS S3
- **File Validation**: Strict validation for image file types and sizes
- **Error Handling**: Comprehensive error handling for upload failures

## Supported File Types

- **JPG/JPEG**: Standard JPEG format
- **PNG**: Portable Network Graphics format
- **File Size Limit**: 10MB maximum per image
- **Automatic Compression**: Images are automatically compressed for optimal storage

## API Endpoints

### Student Signup with Profile Image

```http
POST /api/student/signup
Content-Type: multipart/form-data
```

**Form Data:**
```
email: student@example.com
password: StudentPassword123
firstName: John
lastName: Doe
department: Computer Science
year: 3rd
phoneNumber: 9876543210
dateOfBirth: 2000-01-15
address: {"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zipCode": "400001"}
interests: ["Programming", "Web Development"]
profilePicture: [FILE] (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "PETF123456",
      "department": "Computer Science",
      "year": "3rd",
      "profilePicture": "https://s3.amazonaws.com/bucket/students/profile_123456.jpg",
      "isActive": true,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Society Member Signup with Profile Image

```http
POST /api/society-member/signup
Content-Type: multipart/form-data
```

**Form Data:**
```
email: member@example.com
password: MemberPassword123
firstName: Jane
lastName: Smith
societyName: Tech Society
position: Member
department: Computer Science
phoneNumber: 9876543211
dateOfBirth: 1999-05-20
address: {"street": "456 Oak Ave", "city": "Delhi", "state": "Delhi", "zipCode": "110001"}
skills: ["Leadership", "Event Management"]
responsibilities: ["Organize tech events", "Manage social media"]
profilePicture: [FILE] (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Society member registered successfully",
  "data": {
    "member": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "email": "member@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "Member",
      "profilePicture": "https://s3.amazonaws.com/bucket/profile-images/profile_789012.jpg",
      "isActive": true,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## File Upload Specifications

### Image Requirements
- **Format**: JPG, JPEG, PNG only
- **Size**: Maximum 10MB
- **Dimensions**: No specific requirements (auto-resized during processing)
- **Quality**: Automatically optimized during upload

### Storage Structure
```
AWS S3 Bucket Structure:
├── students/
│   ├── profile_123456.jpg
│   ├── profile_789012.png
│   └── ...
├── profile-images/
│   ├── profile_345678.jpg
│   ├── profile_901234.png
│   └── ...
└── kyc/
    ├── aadhar_123456.jpg
    └── pan_789012.jpg
```

## Error Handling

### File Size Exceeded
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 10MB for profile pictures."
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "Only JPG, JPEG, and PNG files are allowed for profile pictures."
}
```

### Upload Failure
```json
{
  "success": false,
  "message": "Error uploading profile picture. Please try again."
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
    "First name must be 2-50 characters long and contain only letters and spaces"
  ]
}
```

## Frontend Integration

### HTML Form Example
```html
<form id="studentSignupForm" enctype="multipart/form-data">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <input type="text" name="firstName" placeholder="First Name" required>
  <input type="text" name="lastName" placeholder="Last Name" required>
  <input type="text" name="department" placeholder="Department" required>
  <select name="year" required>
    <option value="1st">1st Year</option>
    <option value="2nd">2nd Year</option>
    <option value="3rd">3rd Year</option>
    <option value="4th">4th Year</option>
  </select>
  <input type="tel" name="phoneNumber" placeholder="Phone Number">
  <input type="date" name="dateOfBirth">
  <textarea name="address" placeholder="Address (JSON format)"></textarea>
  <input type="text" name="interests" placeholder="Interests (comma-separated)">
  
  <!-- Profile Picture Upload -->
  <input type="file" name="profilePicture" accept="image/jpeg,image/jpg,image/png">
  <small>Max size: 10MB, Formats: JPG, JPEG, PNG</small>
  
  <button type="submit">Sign Up</button>
</form>
```

### JavaScript Implementation
```javascript
// Student Signup with Profile Image
const studentSignup = async (formData) => {
  try {
    const response = await fetch('/api/student/signup', {
      method: 'POST',
      body: formData, // FormData object with file
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Student registered successfully:', result.data.student);
      // Handle successful registration
      if (result.data.student.profilePicture) {
        console.log('Profile picture uploaded:', result.data.student.profilePicture);
      }
    } else {
      console.error('Registration failed:', result.message);
      if (result.errors) {
        console.error('Validation errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Society Member Signup with Profile Image
const societyMemberSignup = async (formData) => {
  try {
    const response = await fetch('/api/society-member/signup', {
      method: 'POST',
      body: formData, // FormData object with file
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Society member registered successfully:', result.data.member);
      // Handle successful registration
      if (result.data.member.profilePicture) {
        console.log('Profile picture uploaded:', result.data.member.profilePicture);
      }
    } else {
      console.error('Registration failed:', result.message);
      if (result.errors) {
        console.error('Validation errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Form submission handler
document.getElementById('studentSignupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  // Validate file size before upload
  const profilePicture = formData.get('profilePicture');
  if (profilePicture && profilePicture.size > 10 * 1024 * 1024) {
    alert('Profile picture size must be less than 10MB');
    return;
  }
  
  await studentSignup(formData);
});
```

### React Component Example
```jsx
import React, { useState } from 'react';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
    year: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    interests: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add profile picture if selected
      if (profilePicture) {
        submitData.append('profilePicture', profilePicture);
      }

      const response = await fetch('/api/student/signup', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        console.log('Registration successful:', result.data.student);
        // Handle success (redirect, show message, etc.)
      } else {
        console.error('Registration failed:', result.message);
        // Handle errors
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        required
      />
      
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleInputChange}
        required
      />
      
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleInputChange}
        required
      />
      
      <input
        type="text"
        name="department"
        placeholder="Department"
        value={formData.department}
        onChange={handleInputChange}
        required
      />
      
      <select
        name="year"
        value={formData.year}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Year</option>
        <option value="1st">1st Year</option>
        <option value="2nd">2nd Year</option>
        <option value="3rd">3rd Year</option>
        <option value="4th">4th Year</option>
      </select>
      
      <input
        type="tel"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleInputChange}
      />
      
      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleInputChange}
      />
      
      <textarea
        name="address"
        placeholder="Address (JSON format)"
        value={formData.address}
        onChange={handleInputChange}
      />
      
      <input
        type="text"
        name="interests"
        placeholder="Interests (comma-separated)"
        value={formData.interests}
        onChange={handleInputChange}
      />
      
      {/* Profile Picture Upload */}
      <div>
        <label htmlFor="profilePicture">Profile Picture (Optional)</label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
        />
        <small>Max size: 10MB, Formats: JPG, JPEG, PNG</small>
        {profilePicture && (
          <div>
            <p>Selected: {profilePicture.name}</p>
            <p>Size: {(profilePicture.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default StudentSignup;
```

## Security Features

### File Validation
- **MIME Type Checking**: Validates actual file type, not just extension
- **File Size Limits**: Prevents oversized uploads
- **File Type Restrictions**: Only allows image files
- **Virus Scanning**: Can be integrated with antivirus scanning

### Storage Security
- **AWS S3**: Secure cloud storage with encryption
- **Access Control**: Proper IAM policies for bucket access
- **HTTPS**: All uploads and downloads use secure connections
- **Unique Keys**: Generated unique file names to prevent conflicts

### Data Protection
- **No Local Storage**: Files are not stored on the server
- **Automatic Cleanup**: Failed uploads are automatically cleaned up
- **Error Logging**: Comprehensive logging for security monitoring

## Performance Optimization

### Image Processing
- **Automatic Compression**: Images are compressed during upload
- **Format Optimization**: Images are optimized for web delivery
- **Size Reduction**: Typical 60-80% size reduction
- **Quality Preservation**: Maintains visual quality while reducing file size

### Upload Optimization
- **Streaming Upload**: Direct upload to S3 without server storage
- **Parallel Processing**: Multiple images can be processed simultaneously
- **Progress Tracking**: Real-time upload progress (can be implemented)
- **Retry Logic**: Automatic retry for failed uploads

## Monitoring and Logging

### Upload Logs
```javascript
// Example log entry
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "action": "profile_picture_upload",
  "userType": "student",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "fileSize": 2048576,
  "compressedSize": 512000,
  "compressionRatio": "75%",
  "uploadTime": 1.2,
  "status": "success",
  "s3Url": "https://s3.amazonaws.com/bucket/students/profile_123456.jpg"
}
```

### Error Monitoring
- **Upload Failures**: Track failed uploads and reasons
- **File Validation Errors**: Monitor validation failures
- **Storage Errors**: Track S3 upload failures
- **Performance Metrics**: Monitor upload times and success rates

## Best Practices

### Frontend
1. **File Validation**: Always validate files on the frontend before upload
2. **Progress Indicators**: Show upload progress to users
3. **Error Handling**: Provide clear error messages
4. **File Preview**: Show image preview before upload
5. **Size Limits**: Display file size limits clearly

### Backend
1. **Input Validation**: Validate all inputs thoroughly
2. **Error Handling**: Handle all possible error scenarios
3. **Logging**: Log all upload attempts and results
4. **Security**: Implement proper security measures
5. **Performance**: Optimize for speed and efficiency

### Storage
1. **Backup Strategy**: Implement proper backup procedures
2. **Access Control**: Use proper IAM policies
3. **Monitoring**: Monitor storage usage and costs
4. **Cleanup**: Implement cleanup for unused files
5. **CDN**: Consider using CDN for faster delivery

## Troubleshooting

### Common Issues

#### File Upload Fails
- Check file size (must be < 10MB)
- Verify file type (JPG, JPEG, PNG only)
- Check network connection
- Verify AWS S3 configuration

#### Image Not Displaying
- Check S3 URL accessibility
- Verify CORS configuration
- Check image format compatibility
- Verify CDN configuration (if used)

#### Slow Uploads
- Check file size
- Verify network speed
- Check S3 region configuration
- Consider implementing chunked uploads

### Debug Information
```javascript
// Enable debug logging
console.log('Upload debug info:', {
  fileSize: file.size,
  fileType: file.type,
  fileName: file.name,
  uploadStart: Date.now()
});
```

## Future Enhancements

1. **Multiple Image Support**: Allow multiple profile pictures
2. **Image Editing**: Basic image editing capabilities
3. **Avatar Generation**: Automatic avatar generation from uploaded images
4. **CDN Integration**: Global CDN for faster image delivery
5. **Advanced Compression**: More sophisticated compression algorithms
6. **Image Recognition**: Automatic image content validation
7. **Batch Upload**: Support for batch image uploads
8. **Mobile Optimization**: Optimized mobile upload experience
