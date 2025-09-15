# Course Creation API Fixes

This document describes the fixes applied to resolve the course creation API issues, particularly for handling large file uploads.

## Issues Fixed

### 1. File Upload Size Limits
- **Previous Limit**: 50MB per file
- **New Limit**: 100MB per file
- **Additional Limits**: 
  - Maximum 2 files (thumbnail + PDF)
  - 10MB for field data

### 2. Enhanced Error Handling
- Better error messages for file upload failures
- Detailed logging for debugging
- Automatic cleanup of uploaded files on errors

### 3. Multiple File Upload Support
- Support for both single file and multiple file uploads
- Flexible file handling for different client implementations

## Available Endpoints

### 1. Create Course with File Uploads
**Endpoint:** `POST /api/courses/create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "Course Title"
description: "Course Description"
type: "online" or "offline"
category: "Programming"
instructor[name]: "Instructor Name"
instructor[email]: "instructor@example.com"
instructor[phone]: "+1234567890" (optional)
instructor[bio]: "Instructor Bio" (optional)
price: "2999"
currency: "INR" (optional, default: INR)
duration: "40"
durationUnit: "hours" (optional, default: hours)
thumbnail: [file] (required - image file)
coursePdf: [file] (required for online courses - PDF file)
syllabus: [file] (alternative to coursePdf for online courses - PDF file)
videoUrl: "https://youtube.com/watch?v=example" (optional for online courses)
venue: "Venue Name" (required for offline courses)
address[street]: "Street Address" (optional for offline courses)
address[city]: "City" (optional for offline courses)
address[state]: "State" (optional for offline courses)
address[zipCode]: "ZIP Code" (optional for offline courses)
maxStudents: "30" (required for offline courses)
tags: "javascript,programming,web-development" (optional, comma-separated)
prerequisites: "Basic HTML,Basic CSS" (optional, comma-separated)
learningObjectives: "Learn JavaScript,Build web apps" (optional, comma-separated)
```

**File Requirements:**
- **Thumbnail**: Image file (JPEG, PNG, GIF, WebP) - up to 100MB
- **Course PDF**: PDF file - up to 100MB (online courses only)
- **Syllabus**: PDF file - up to 100MB (alternative to coursePdf for online courses)

**Example cURL:**
```bash
curl -X POST "http://localhost:3100/api/courses/create" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -F "title=Advanced JavaScript Programming" \
  -F "description=Learn advanced JavaScript concepts and modern frameworks" \
  -F "type=online" \
  -F "category=Programming" \
  -F "instructor[name]=John Doe" \
  -F "instructor[email]=john@example.com" \
  -F "price=2999" \
  -F "duration=40" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "coursePdf=@course-material.pdf"
```

### 2. Create Simple Course (No File Uploads)
**Endpoint:** `POST /api/courses/create-simple`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "title": "Advanced JavaScript Programming",
  "description": "Learn advanced JavaScript concepts and modern frameworks",
  "type": "online",
  "category": "Programming",
  "instructor": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "bio": "Senior JavaScript Developer with 10+ years experience"
  },
  "price": 2999,
  "currency": "INR",
  "duration": 40,
  "durationUnit": "hours",
  "videoUrl": "https://youtube.com/watch?v=example",
  "tags": "javascript,programming,web-development",
  "prerequisites": "Basic HTML,Basic CSS",
  "learningObjectives": "Learn JavaScript,Build web apps"
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:3100/api/courses/create-simple" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript Programming",
    "description": "Learn advanced JavaScript concepts and modern frameworks",
    "type": "online",
    "category": "Programming",
    "instructor": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "price": 2999,
    "duration": 40
  }'
```

### 3. Create Sample Courses
**Endpoint:** `POST /api/courses/create-sample`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Description:** Creates 3 sample courses for testing purposes.

**Example cURL:**
```bash
curl -X POST "http://localhost:3100/api/courses/create-sample" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

## Error Responses

### File Upload Errors

#### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 100MB per file."
}
```

#### Too Many Files
```json
{
  "success": false,
  "message": "Too many files. Maximum 3 files allowed (thumbnail + coursePdf + syllabus)."
}
```

#### Invalid File Type
```json
{
  "success": false,
  "message": "Thumbnail must be an image file (JPEG, PNG, GIF, WebP)"
}
```

#### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields: title, description, type, category, instructor, price, duration"
}
```

#### Instructor Validation Error
```json
{
  "success": false,
  "message": "Instructor name and email are required"
}
```

#### Course Type Validation Error
```json
{
  "success": false,
  "message": "Venue is required for offline courses"
}
```

### Network/Server Errors

#### Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create course",
  "error": "Detailed error message in development mode",
  "details": "Stack trace in development mode"
}
```

## File Upload Specifications

### Supported File Types
- **Thumbnails**: JPEG, PNG, GIF, WebP
- **Course Materials**: PDF only

### File Size Limits
- **Maximum file size**: 100MB per file
- **Maximum files**: 3 files (thumbnail + coursePdf + syllabus)
- **Field data limit**: 10MB

### File Storage
- Files are uploaded to AWS S3
- Automatic cleanup on upload failures
- Secure file URLs generated

## Testing Steps

### 1. Test Simple Course Creation
```bash
# Test without file uploads
POST /api/courses/create-simple
```

### 2. Test File Upload Course Creation
```bash
# Test with file uploads
POST /api/courses/create
```

### 3. Test Sample Courses
```bash
# Create sample data
POST /api/courses/create-sample
```

### 4. Test Course Retrieval
```bash
# Get all courses
GET /api/courses?page=1&limit=10&sortBy=createdAt&sortOrder=asc
```

## Debug Information

The API now provides detailed debug information:

### Console Logs
- File upload attempts with details
- Course creation request details
- Error details with stack traces
- File cleanup operations

### Response Debug Info
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [...],
    "pagination": {...},
    "filters": {
      "applied": "none",
      "sortBy": "createdAt",
      "sortOrder": "asc"
    }
  }
}
```

## Best Practices

### 1. File Upload
- Use appropriate file sizes (compress images if needed)
- Ensure proper file types
- Test with different file sizes

### 2. Error Handling
- Check response status codes
- Handle file upload errors gracefully
- Provide user-friendly error messages

### 3. Testing
- Start with simple course creation
- Test file uploads with different file sizes
- Verify course retrieval after creation

## Troubleshooting

### Common Issues

1. **Network Error**: Check file size limits and network connection
2. **File Upload Error**: Verify file type and size
3. **Validation Error**: Check required fields
4. **Authentication Error**: Verify admin token

### Debug Steps

1. Check console logs for detailed error information
2. Verify file upload limits and types
3. Test with simple course creation first
4. Use sample courses endpoint for testing

## Success Response

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course": {
      "_id": "64f8b2c1a1b2c3d4e5f67890",
      "title": "Advanced JavaScript Programming",
      "description": "Learn advanced JavaScript concepts and modern frameworks",
      "type": "online",
      "category": "Programming",
      "instructor": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "bio": "Senior JavaScript Developer with 10+ years experience"
      },
      "price": 2999,
      "currency": "INR",
      "duration": 40,
      "durationUnit": "hours",
      "thumbnail": "https://s3.amazonaws.com/bucket/course-thumbnails/thumbnail.jpg",
      "coursePdf": "https://s3.amazonaws.com/bucket/course-materials/course-material.pdf",
      "videoUrl": "https://youtube.com/watch?v=example",
      "status": "draft",
      "isActive": true,
      "tags": ["javascript", "programming", "web-development"],
      "prerequisites": ["Basic HTML", "Basic CSS"],
      "learningObjectives": ["Learn JavaScript", "Build web apps"],
      "createdBy": "64f8b2c1a1b2c3d4e5f67891",
      "enrollmentCount": 0,
      "rating": {
        "average": 0,
        "count": 0
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```
