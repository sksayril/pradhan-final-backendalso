# Course and Batch Management API Documentation

This document describes the course and batch management endpoints that allow admins to create, manage, and organize educational courses and their batches.

## Authentication

All course and batch management endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: Admin role only

```http
Authorization: Bearer <admin_jwt_token>
```

## Course Management

### Course Types

The system supports two types of courses:

1. **Online Courses**:
   - Require course thumbnail (image)
   - Require course PDF material
   - Optional video URL
   - No venue or max students limit

2. **Offline Courses**:
   - Require course thumbnail (image)
   - Require venue and address
   - Require maximum students limit
   - No PDF or video requirements

### 1. Create Course

Create a new course with file uploads.

**Endpoint:** `POST /api/courses/create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

**Required Fields:**
- `title` (string): Course title
- `description` (string): Course description
- `type` (string): Course type (`online` or `offline`)
- `category` (string): Course category
- `instructor.name` (string): Instructor name
- `instructor.email` (string): Instructor email
- `price` (number): Course price
- `duration` (number): Course duration
- `thumbnail` (file): Course thumbnail image

**Online Course Additional Fields:**
- `coursePdf` (file): Course PDF material
- `videoUrl` (string, optional): Video URL

**Offline Course Additional Fields:**
- `venue` (string): Course venue
- `address.street` (string): Street address
- `address.city` (string): City
- `address.state` (string): State
- `address.zipCode` (string): ZIP code
- `maxStudents` (number): Maximum students

**Optional Fields:**
- `currency` (string): Currency (default: INR)
- `durationUnit` (string): Duration unit (default: hours)
- `instructor.phone` (string): Instructor phone
- `instructor.bio` (string): Instructor bio
- `tags` (string): Comma-separated tags
- `prerequisites` (string): Comma-separated prerequisites
- `learningObjectives` (string): Comma-separated learning objectives

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/courses/create" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -F "title=Advanced JavaScript Programming" \
  -F "description=Learn advanced JavaScript concepts and modern frameworks" \
  -F "type=online" \
  -F "category=Programming" \
  -F "instructor.name=John Doe" \
  -F "instructor.email=john@example.com" \
  -F "price=2999" \
  -F "duration=40" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "coursePdf=@course-material.pdf" \
  -F "videoUrl=https://youtube.com/watch?v=example"
```

**Response:**
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
        "phone": "",
        "bio": ""
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
      "tags": [],
      "prerequisites": [],
      "learningObjectives": [],
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

### 2. Get All Courses

Retrieve all courses with pagination and filtering.

**Endpoint:** `GET /api/courses`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of courses per page (default: 10)
- `search` (optional): Search by title, description, or category
- `type` (optional): Filter by course type (`online` or `offline`)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (`draft`, `published`, `archived`)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `isActive` (optional): Filter by active status

**Example Request:**
```http
GET /api/courses?page=1&limit=10&type=online&category=Programming
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "title": "Advanced JavaScript Programming",
        "description": "Learn advanced JavaScript concepts and modern frameworks",
        "type": "online",
        "category": "Programming",
        "price": 2999,
        "status": "published",
        "isActive": true,
        "enrollmentCount": 25,
        "rating": {
          "average": 4.5,
          "count": 20
        },
        "createdBy": {
          "_id": "64f8b2c1a1b2c3d4e5f67891",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCourses": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Get Course by ID

Retrieve a specific course with its batches.

**Endpoint:** `GET /api/courses/:id`

**Response:**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
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
      "status": "published",
      "isActive": true,
      "tags": ["javascript", "programming", "web-development"],
      "prerequisites": ["Basic HTML", "Basic CSS"],
      "learningObjectives": ["Master ES6+ features", "Build modern web apps"],
      "createdBy": {
        "_id": "64f8b2c1a1b2c3d4e5f67891",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "enrollmentCount": 25,
      "rating": {
        "average": 4.5,
        "count": 20
      }
    },
    "batches": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67892",
        "name": "JavaScript Batch 1",
        "description": "First batch of JavaScript course",
        "status": "scheduled",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-02-28T00:00:00.000Z",
        "maxStudents": 30,
        "enrollmentCount": 15,
        "availableSpots": 15,
        "price": 2999
      }
    ]
  }
}
```

### 4. Update Course

Update an existing course.

**Endpoint:** `PUT /api/courses/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body:** Same as create course (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "course": {
      // Updated course object
    }
  }
}
```

### 5. Delete Course

Delete a course (only if no active batches exist).

**Endpoint:** `DELETE /api/courses/:id`

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### 6. Get Course Statistics

Get comprehensive course statistics.

**Endpoint:** `GET /api/courses/statistics`

**Response:**
```json
{
  "success": true,
  "message": "Course statistics retrieved successfully",
  "data": {
    "totalCourses": 50,
    "onlineCourses": 35,
    "offlineCourses": 15,
    "publishedCourses": 40,
    "draftCourses": 10,
    "totalEnrollments": 500,
    "averageRating": 4.2
  }
}
```

## Batch Management

### 1. Create Batch

Create a new batch for a course with multiple time slots.

**Endpoint:** `POST /api/batches/create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "JavaScript Batch 1",
  "description": "First batch of JavaScript course",
  "courseId": "64f8b2c1a1b2c3d4e5f67890",
  "timeSlots": [
    {
      "date": "2024-02-01",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "date": "2024-02-03",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "date": "2024-02-05",
      "startTime": "09:00",
      "endTime": "12:00"
    }
  ],
  "maxStudents": 30,
  "price": 2999,
  "currency": "INR",
  "startDate": "2024-02-01",
  "endDate": "2024-02-28",
  "registrationStartDate": "2024-01-15",
  "registrationEndDate": "2024-01-31",
  "allowLateRegistration": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batch": {
      "_id": "64f8b2c1a1b2c3d4e5f67892",
      "name": "JavaScript Batch 1",
      "description": "First batch of JavaScript course",
      "courseId": {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "title": "Advanced JavaScript Programming",
        "type": "online",
        "category": "Programming"
      },
      "timeSlots": [
        {
          "date": "2024-02-01T00:00:00.000Z",
          "startTime": "09:00",
          "endTime": "12:00",
          "duration": 180,
          "isActive": true
        },
        {
          "date": "2024-02-03T00:00:00.000Z",
          "startTime": "09:00",
          "endTime": "12:00",
          "duration": 180,
          "isActive": true
        },
        {
          "date": "2024-02-05T00:00:00.000Z",
          "startTime": "09:00",
          "endTime": "12:00",
          "duration": 180,
          "isActive": true
        }
      ],
      "status": "scheduled",
      "maxStudents": 30,
      "enrolledStudents": [],
      "price": 2999,
      "currency": "INR",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-28T00:00:00.000Z",
      "registrationStartDate": "2024-01-15T00:00:00.000Z",
      "registrationEndDate": "2024-01-31T00:00:00.000Z",
      "createdBy": "64f8b2c1a1b2c3d4e5f67891",
      "isActive": true,
      "allowLateRegistration": false,
      "enrollmentCount": 0,
      "availableSpots": 30,
      "durationInDays": 28
    }
  }
}
```

### 2. Get All Batches

Retrieve all batches with pagination and filtering.

**Endpoint:** `GET /api/batches`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of batches per page (default: 10)
- `search` (optional): Search by batch name or description
- `courseId` (optional): Filter by course ID
- `status` (optional): Filter by status (`scheduled`, `ongoing`, `completed`, `cancelled`)
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Batches retrieved successfully",
  "data": {
    "batches": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67892",
        "name": "JavaScript Batch 1",
        "description": "First batch of JavaScript course",
        "courseId": {
          "_id": "64f8b2c1a1b2c3d4e5f67890",
          "title": "Advanced JavaScript Programming",
          "type": "online",
          "category": "Programming",
          "price": 2999
        },
        "status": "scheduled",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-02-28T00:00:00.000Z",
        "maxStudents": 30,
        "enrollmentCount": 15,
        "availableSpots": 15,
        "price": 2999,
        "createdBy": {
          "_id": "64f8b2c1a1b2c3d4e5f67891",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBatches": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Get Batch by ID

Retrieve a specific batch with detailed information.

**Endpoint:** `GET /api/batches/:id`

**Response:**
```json
{
  "success": true,
  "message": "Batch retrieved successfully",
  "data": {
    "batch": {
      "_id": "64f8b2c1a1b2c3d4e5f67892",
      "name": "JavaScript Batch 1",
      "description": "First batch of JavaScript course",
      "courseId": {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "title": "Advanced JavaScript Programming",
        "type": "online",
        "category": "Programming",
        "price": 2999,
        "description": "Learn advanced JavaScript concepts and modern frameworks"
      },
      "timeSlots": [
        {
          "date": "2024-02-01T00:00:00.000Z",
          "startTime": "09:00",
          "endTime": "12:00",
          "duration": 180,
          "isActive": true
        }
      ],
      "status": "scheduled",
      "maxStudents": 30,
      "enrolledStudents": [
        {
          "studentId": {
            "_id": "64f8b2c1a1b2c3d4e5f67893",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@example.com",
            "studentId": "STU001"
          },
          "enrolledAt": "2024-01-20T10:30:00.000Z",
          "status": "enrolled"
        }
      ],
      "price": 2999,
      "currency": "INR",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-28T00:00:00.000Z",
      "registrationStartDate": "2024-01-15T00:00:00.000Z",
      "registrationEndDate": "2024-01-31T00:00:00.000Z",
      "createdBy": {
        "_id": "64f8b2c1a1b2c3d4e5f67891",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "isActive": true,
      "allowLateRegistration": false,
      "enrollmentCount": 1,
      "availableSpots": 29,
      "durationInDays": 28
    }
  }
}
```

### 4. Get Batches by Course

Get all batches for a specific course.

**Endpoint:** `GET /api/batches/course/:courseId`

**Response:**
```json
{
  "success": true,
  "message": "Batches retrieved successfully",
  "data": {
    "course": {
      "_id": "64f8b2c1a1b2c3d4e5f67890",
      "title": "Advanced JavaScript Programming",
      "type": "online"
    },
    "batches": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67892",
        "name": "JavaScript Batch 1",
        "description": "First batch of JavaScript course",
        "status": "scheduled",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-02-28T00:00:00.000Z",
        "maxStudents": 30,
        "enrollmentCount": 15,
        "availableSpots": 15,
        "price": 2999,
        "timeSlots": [
          {
            "date": "2024-02-01T00:00:00.000Z",
            "startTime": "09:00",
            "endTime": "12:00",
            "duration": 180,
            "isActive": true
          }
        ]
      }
    ]
  }
}
```

### 5. Update Batch

Update an existing batch.

**Endpoint:** `PUT /api/batches/:id`

**Request Body:** Same as create batch (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Batch updated successfully",
  "data": {
    "batch": {
      // Updated batch object
    }
  }
}
```

### 6. Delete Batch

Delete a batch (only if no students are enrolled).

**Endpoint:** `DELETE /api/batches/:id`

**Response:**
```json
{
  "success": true,
  "message": "Batch deleted successfully"
}
```

### 7. Get Batch Statistics

Get comprehensive batch statistics.

**Endpoint:** `GET /api/batches/statistics`

**Response:**
```json
{
  "success": true,
  "message": "Batch statistics retrieved successfully",
  "data": {
    "totalBatches": 25,
    "scheduledBatches": 10,
    "ongoingBatches": 8,
    "completedBatches": 7,
    "totalEnrollments": 300,
    "averageEnrollment": 12
  }
}
```

## File Upload Specifications

### Course Thumbnail
- **Format**: Image files (JPEG, PNG, GIF, WebP)
- **Size Limit**: 10MB
- **Field Name**: `thumbnail`
- **Storage**: AWS S3 bucket

### Course PDF (Online Courses Only)
- **Format**: PDF files
- **Size Limit**: 50MB
- **Field Name**: `coursePdf`
- **Storage**: AWS S3 bucket

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Venue is required for offline courses"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only update courses you created"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create course",
  "error": "Database connection error"
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Create a new online course
const formData = new FormData();
formData.append('title', 'Advanced JavaScript Programming');
formData.append('description', 'Learn advanced JavaScript concepts');
formData.append('type', 'online');
formData.append('category', 'Programming');
formData.append('instructor.name', 'John Doe');
formData.append('instructor.email', 'john@example.com');
formData.append('price', '2999');
formData.append('duration', '40');
formData.append('thumbnail', thumbnailFile);
formData.append('coursePdf', pdfFile);

const response = await fetch('/api/courses/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
});

const data = await response.json();
console.log(data.data.course);
```

### cURL
```bash
# Create a new batch
curl -X POST "http://localhost:3000/api/batches/create" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript Batch 1",
    "description": "First batch of JavaScript course",
    "courseId": "64f8b2c1a1b2c3d4e5f67890",
    "timeSlots": [
      {
        "date": "2024-02-01",
        "startTime": "09:00",
        "endTime": "12:00"
      }
    ],
    "maxStudents": 30,
    "startDate": "2024-02-01",
    "endDate": "2024-02-28",
    "registrationStartDate": "2024-01-15",
    "registrationEndDate": "2024-01-31"
  }'
```

## Notes

1. **Admin Only**: All endpoints require admin authentication and authorization
2. **File Uploads**: Course thumbnails and PDFs are stored in AWS S3
3. **Time Format**: All times must be in HH:MM format (24-hour)
4. **Date Format**: All dates must be in ISO format (YYYY-MM-DD)
5. **Validation**: Comprehensive validation for all input fields
6. **Error Handling**: Detailed error messages for debugging
7. **Pagination**: All list endpoints support pagination
8. **Search & Filter**: Advanced search and filtering capabilities
9. **Statistics**: Comprehensive statistics for courses and batches
10. **File Cleanup**: Automatic cleanup of uploaded files on errors
