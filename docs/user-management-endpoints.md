# User Management API Endpoints

This document describes the user management endpoints that allow admins to retrieve and manage all users in the system.

## Authentication

All user management endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: Admin role only

```http
Authorization: Bearer <admin_jwt_token>
```

## Endpoints

### 1. Get All Students

Retrieve all students with pagination and filtering options.

**Endpoint:** `GET /api/user-management/students`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of students per page (default: 10)
- `search` (optional): Search by name, email, or student ID
- `department` (optional): Filter by department
- `year` (optional): Filter by academic year
- `kycStatus` (optional): Filter by KYC status (`not_submitted`, `pending`, `approved`, `rejected`)
- `isActive` (optional): Filter by active status (`true`/`false`)
- `isVerified` (optional): Filter by verification status (`true`/`false`)

**Example Request:**
```http
GET /api/user-management/students?page=1&limit=10&department=Computer Science&kycStatus=approved
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123456",
        "department": "Computer Science",
        "year": "3rd",
        "phoneNumber": "+1234567890",
        "dateOfBirth": "2000-01-15T00:00:00.000Z",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "India"
        },
        "isActive": true,
        "isVerified": true,
        "kycStatus": "approved",
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "profilePicture": "https://example.com/profile.jpg",
        "interests": ["Programming", "AI"],
        "achievements": [],
        "registeredSocieties": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStudents": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get All Society Members

Retrieve all society members with pagination and filtering options.

**Endpoint:** `GET /api/user-management/society-members`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of members per page (default: 10)
- `search` (optional): Search by name, email, or member ID
- `societyName` (optional): Filter by society name
- `position` (optional): Filter by position
- `kycStatus` (optional): Filter by KYC status (`not_submitted`, `pending`, `approved`, `rejected`)
- `isActive` (optional): Filter by active status (`true`/`false`)
- `isVerified` (optional): Filter by verification status (`true`/`false`)

**Example Request:**
```http
GET /api/user-management/society-members?page=1&limit=10&societyName=Tech Club&position=President
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society members retrieved successfully",
  "data": {
    "societyMembers": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67891",
        "email": "jane.smith@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "memberId": "MEM123456",
        "societyName": "Tech Club",
        "position": "President",
        "phoneNumber": "+1234567891",
        "dateOfBirth": "1999-05-20T00:00:00.000Z",
        "address": {
          "street": "456 Oak Ave",
          "city": "Los Angeles",
          "state": "CA",
          "zipCode": "90210",
          "country": "India"
        },
        "isActive": true,
        "isVerified": true,
        "kycStatus": "approved",
        "lastLogin": "2024-01-15T09:15:00.000Z",
        "profilePicture": "https://example.com/profile2.jpg",
        "skills": ["Leadership", "Event Management"],
        "responsibilities": ["Organize events", "Manage team"],
        "achievements": [],
        "eventsOrganized": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T09:15:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMembers": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Get All Admins

Retrieve all admin users with pagination and filtering options.

**Endpoint:** `GET /api/user-management/admins`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of admins per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by admin role
- `isActive` (optional): Filter by active status (`true`/`false`)
- `isVerified` (optional): Filter by verification status (`true`/`false`)

**Example Request:**
```http
GET /api/user-management/admins?page=1&limit=10&role=super_admin
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67892",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin",
        "permissions": ["read", "write", "delete", "manage_users"],
        "isActive": true,
        "isVerified": true,
        "lastLogin": "2024-01-15T11:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalAdmins": 3,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 4. Get User Statistics

Retrieve comprehensive statistics about all users in the system.

**Endpoint:** `GET /api/user-management/statistics`

**Example Request:**
```http
GET /api/user-management/statistics
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totals": {
      "students": 150,
      "societyMembers": 45,
      "admins": 5,
      "total": 200
    },
    "active": {
      "students": 140,
      "societyMembers": 42,
      "admins": 5
    },
    "verified": {
      "students": 120,
      "societyMembers": 40,
      "admins": 5
    },
    "kyc": {
      "students": 100,
      "societyMembers": 35
    }
  }
}
```

## Error Responses

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
  "message": "Access denied. Admin role required."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve students",
  "error": "Database connection error"
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Get all students with filtering
const response = await fetch('/api/user-management/students?department=Computer Science&kycStatus=approved', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.students);
```

### cURL
```bash
# Get all society members
curl -X GET "http://localhost:3000/api/user-management/society-members?page=1&limit=20" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get user statistics
curl -X GET "http://localhost:3000/api/user-management/statistics" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

### 5. Get Student by ID

Retrieve a specific student by their MongoDB ObjectId with complete KYC information. **Note:** This endpoint includes the student's original password for admin access.

**Endpoint:** `GET /api/user-management/students/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the student

**Example Request:**
```http
GET /api/user-management/students/64f8b2c1a1b2c3d4e5f67890
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "student": {
      "_id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123456",
      "department": "Computer Science",
      "year": "3rd",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "2000-01-15T00:00:00.000Z",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "India"
      },
      "isActive": true,
      "isVerified": true,
      "kycStatus": "approved",
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "profilePicture": "https://example.com/profile.jpg",
      "interests": ["Programming", "AI"],
      "achievements": [],
      "originalPassword": "student123",
      "registeredSocieties": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "kyc": {
        "status": "approved",
        "submittedAt": "2024-01-10T09:00:00.000Z",
        "reviewedAt": "2024-01-12T14:30:00.000Z",
        "reviewedBy": {
          "_id": "64f8b2c1a1b2c3d4e5f67892",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "rejectionReason": null,
        "aadharNumber": "123456789012",
        "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg"
      }
    }
  }
}
```

### 6. Get Student by Student ID

Retrieve a specific student by their custom student ID (e.g., STU123456) with complete KYC information. **Note:** This endpoint includes the student's original password for admin access.

**Endpoint:** `GET /api/user-management/students/by-student-id/:studentId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `studentId` (required): Custom student ID (e.g., STU123456)

**Example Request:**
```http
GET /api/user-management/students/by-student-id/STU123456
Authorization: Bearer <admin_jwt_token>
```

**Response:** Same as above student response format, including the `originalPassword` field for admin access.

### 7. Get Society Member by ID

Retrieve a specific society member by their MongoDB ObjectId with complete KYC information.

**Endpoint:** `GET /api/user-management/society-members/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the society member

**Example Request:**
```http
GET /api/user-management/society-members/64f8b2c1a1b2c3d4e5f67891
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society member retrieved successfully",
  "data": {
    "societyMember": {
      "_id": "64f8b2c1a1b2c3d4e5f67891",
      "email": "jane.smith@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "memberId": "MEM123456",
      "societyName": "Tech Club",
      "position": "President",
      "phoneNumber": "+1234567891",
      "dateOfBirth": "1999-05-20T00:00:00.000Z",
      "address": {
        "street": "456 Oak Ave",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210",
        "country": "India"
      },
      "isActive": true,
      "isVerified": true,
      "kycStatus": "approved",
      "lastLogin": "2024-01-15T09:15:00.000Z",
      "profilePicture": "https://example.com/profile2.jpg",
      "skills": ["Leadership", "Event Management"],
      "responsibilities": ["Organize events", "Manage team"],
      "achievements": [],
      "eventsOrganized": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T09:15:00.000Z",
      "kyc": {
        "status": "approved",
        "submittedAt": "2024-01-08T11:00:00.000Z",
        "reviewedAt": "2024-01-10T16:45:00.000Z",
        "reviewedBy": {
          "_id": "64f8b2c1a1b2c3d4e5f67892",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "rejectionReason": null,
        "aadharNumber": "987654321098",
        "panNumber": "ABCDE1234F",
        "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar456.jpg",
        "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan789.jpg"
      }
    }
  }
}
```

### 8. Get Society Member by Member ID

Retrieve a specific society member by their custom member ID (e.g., MEM123456) with complete KYC information.

**Endpoint:** `GET /api/user-management/society-members/by-member-id/:memberId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `memberId` (required): Custom member ID (e.g., MEM123456)

**Example Request:**
```http
GET /api/user-management/society-members/by-member-id/MEM123456
Authorization: Bearer <admin_jwt_token>
```

**Response:** Same as above society member response format.

### 9. Get Admin by ID

Retrieve a specific admin by their MongoDB ObjectId.

**Endpoint:** `GET /api/user-management/admins/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the admin

**Example Request:**
```http
GET /api/user-management/admins/64f8b2c1a1b2c3d4e5f67892
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin retrieved successfully",
  "data": {
    "admin": {
      "_id": "64f8b2c1a1b2c3d4e5f67892",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "permissions": ["read", "write", "delete", "manage_users"],
      "isActive": true,
      "isVerified": true,
      "lastLogin": "2024-01-15T11:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

## KYC Information Structure

When retrieving individual users, the response includes comprehensive KYC information:

### Student KYC Structure
```json
{
  "kyc": {
    "status": "approved|pending|rejected|not_submitted",
    "submittedAt": "2024-01-10T09:00:00.000Z",
    "reviewedAt": "2024-01-12T14:30:00.000Z",
    "reviewedBy": {
      "_id": "admin_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "rejectionReason": "Reason for rejection (if applicable)",
    "aadharNumber": "123456789012",
    "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg"
  }
}
```

### Society Member KYC Structure
```json
{
  "kyc": {
    "status": "approved|pending|rejected|not_submitted",
    "submittedAt": "2024-01-08T11:00:00.000Z",
    "reviewedAt": "2024-01-10T16:45:00.000Z",
    "reviewedBy": {
      "_id": "admin_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "rejectionReason": "Reason for rejection (if applicable)",
    "aadharNumber": "987654321098",
    "panNumber": "ABCDE1234F",
    "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar456.jpg",
    "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan789.jpg"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid student ID format"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Get student by MongoDB ObjectId
const response = await fetch('/api/user-management/students/64f8b2c1a1b2c3d4e5f67890', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.student.kyc);

// Get student by custom student ID
const response2 = await fetch('/api/user-management/students/by-student-id/STU123456', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});
```

### cURL
```bash
# Get student by ObjectId
curl -X GET "http://localhost:3000/api/user-management/students/64f8b2c1a1b2c3d4e5f67890" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get student by custom student ID
curl -X GET "http://localhost:3000/api/user-management/students/by-student-id/STU123456" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get society member by ObjectId
curl -X GET "http://localhost:3000/api/user-management/society-members/64f8b2c1a1b2c3d4e5f67891" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get all approved KYC students
curl -X GET "http://localhost:3000/api/user-management/students/approved-kyc?page=1&limit=20" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get all approved KYC society members
curl -X GET "http://localhost:3000/api/user-management/society-members/approved-kyc?page=1&limit=20" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

### 10. Get All Approved KYC Students

Retrieve all students with approved KYC status with complete KYC information.

**Endpoint:** `GET /api/user-management/students/approved-kyc`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of students per page (default: 10)
- `search` (optional): Search by name, email, or student ID
- `department` (optional): Filter by department
- `year` (optional): Filter by academic year

**Example Request:**
```http
GET /api/user-management/students/approved-kyc?page=1&limit=10&department=Computer Science
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Approved KYC students retrieved successfully",
  "data": {
    "students": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123456",
        "department": "Computer Science",
        "year": "3rd",
        "kycStatus": "approved",
        "kyc": {
          "status": "approved",
          "submittedAt": "2024-01-10T09:00:00.000Z",
          "reviewedAt": "2024-01-12T14:30:00.000Z",
          "reviewedBy": {
            "_id": "64f8b2c1a1b2c3d4e5f67892",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
          "rejectionReason": null,
          "remarks": "Documents verified successfully",
          "aadharNumber": "123456789012",
          "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalStudents": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 11. Get All Approved KYC Society Members

Retrieve all society members with approved KYC status with complete KYC information.

**Endpoint:** `GET /api/user-management/society-members/approved-kyc`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of members per page (default: 10)
- `search` (optional): Search by name, email, or member ID
- `societyName` (optional): Filter by society name
- `position` (optional): Filter by position

**Example Request:**
```http
GET /api/user-management/society-members/approved-kyc?page=1&limit=10&societyName=Tech Club
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Approved KYC society members retrieved successfully",
  "data": {
    "societyMembers": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67891",
        "email": "jane.smith@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "memberId": "MEM123456",
        "societyName": "Tech Club",
        "position": "President",
        "kycStatus": "approved",
        "kyc": {
          "status": "approved",
          "submittedAt": "2024-01-08T11:00:00.000Z",
          "reviewedAt": "2024-01-10T16:45:00.000Z",
          "reviewedBy": {
            "_id": "64f8b2c1a1b2c3d4e5f67892",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
          "rejectionReason": null,
          "remarks": "All documents verified successfully",
          "aadharNumber": "987654321098",
          "panNumber": "ABCDE1234F",
          "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar456.jpg",
          "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan789.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalMembers": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 12. Get All Enrollments

Retrieve a comprehensive list of all student enrollments, including details about the student, course, and batch.

**Endpoint:** `GET /api/user-management/enrollments`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of enrollments per page (default: 10)
- `sortBy` (optional): Field to sort by (e.g., `enrollmentDate`, `status`). Default: `enrollmentDate`
- `sortOrder` (optional): Sort order (`asc` or `desc`). Default: `desc`

**Example Request:**
```http
GET /api/user-management/enrollments?page=1&limit=5&sortBy=enrollmentDate&sortOrder=asc
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollments retrieved successfully",
  "data": {
    "enrollments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "studentId": "STU123"
        },
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z"
        },
        "enrollmentDate": "2025-09-15T10:00:00.000Z",
        "status": "enrolled",
        "paymentStatus": "paid"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalEnrollments": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 13. Get Enrollments by Student ID

Retrieve a list of all course enrollments for a specific student, including details about the course and batch.

**Endpoint:** `GET /api/user-management/enrollments/student/:studentId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `studentId` (required): The MongoDB ObjectId of the student.

**Example Request:**
```http
GET /api/user-management/enrollments/student/60d0fe4f5b9f9b2b4c8b456a
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollments retrieved successfully for student 60d0fe4f5b9f9b2b4c8b456a",
  "data": {
    "enrollments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z"
        },
        "enrollmentDate": "2025-09-15T10:00:00.000Z",
        "status": "enrolled",
        "paymentStatus": "paid"
      }
    ]
  }
}
```

## Notes

1. **Password Security**: All endpoints exclude password fields from responses for security
2. **Pagination**: All list endpoints support pagination with configurable page size
3. **Filtering**: Multiple filter options are available for each endpoint
4. **Search**: Text search is case-insensitive and searches across multiple fields
5. **Admin Only**: All endpoints require admin authentication and authorization
6. **Performance**: Queries are optimized with database indexes for better performance
7. **KYC Integration**: Individual user endpoints include complete KYC information
8. **Dual ID Support**: Users can be retrieved by both MongoDB ObjectId and custom IDs
9. **Comprehensive Data**: Individual endpoints provide complete user profiles with KYC status
10. **Approved KYC Filter**: Approved KYC endpoints only return users with approved KYC status
11. **Complete KYC Data**: Approved KYC endpoints include full KYC information for each user

## Original Password Storage

As requested, the system now stores the original password in text format in the `originalPassword` field for all user types (students, society members, and admins). This field is:

- **Required**: Must be provided during registration
- **Hidden**: Excluded from all API responses for security
- **Stored**: Saved in plain text format alongside the hashed password
- **Used**: For administrative purposes and password recovery

**Important Security Note**: The `originalPassword` field is stored in plain text and should only be accessible to authorized administrators. It's included in admin-only API responses (like `getStudentById` and `getStudentByStudentId`) but excluded from public API responses and should be handled with extreme care.

---

## 14. Get All Students with Complete Enrollment Data

Retrieve all students with their complete enrollment information including courses and batches. This API returns all data without pagination.

**Endpoint:** `GET /api/user-management/students/with-enrollments`

**Note:** This endpoint must be called before any dynamic student ID routes to avoid routing conflicts.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example Request:**
```http
GET /api/user-management/students/with-enrollments
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "All students with enrollment data retrieved successfully",
  "data": {
    "overallStats": {
      "totalStudents": 25,
      "totalEnrollments": 45,
      "studentsWithEnrollments": 20,
      "studentsWithoutEnrollments": 5,
      "totalCourses": 8,
      "totalBatches": 12
    },
    "students": [
      {
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "studentDetails": {
          "firstName": "John",
          "lastName": "Doe",
          "fullName": "John Doe",
          "email": "john.doe@example.com",
          "studentId": "STU001",
          "phoneNumber": "+1234567890",
          "dateOfBirth": "1995-05-15T00:00:00.000Z",
          "address": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zipCode": "10001",
            "country": "USA"
          },
          "kycStatus": "approved",
          "createdAt": "2025-09-01T10:00:00.000Z"
        },
        "enrollmentStats": {
          "totalEnrollments": 2,
          "activeEnrollments": 1,
          "completedEnrollments": 1,
          "totalCourses": 2,
          "totalBatches": 2
        },
        "enrollments": [
          {
            "enrollmentId": "60d0fe4f5b9f9b2b4c8b4569",
            "enrollmentDate": "2025-09-15T10:00:00.000Z",
            "status": "enrolled",
            "paymentStatus": "paid",
            "progress": 25,
            "course": {
              "id": "60d0fe4f5b9f9b2b4c8b4567",
              "title": "Python Programming",
              "category": "Programming",
              "type": "online",
              "price": 5000,
              "currency": "INR",
              "duration": 8,
              "durationUnit": "weeks",
              "instructor": "Dr. Smith"
            },
            "batch": {
              "id": "60d0fe4f5b9f9b2b4c8b4568",
              "name": "Python Morning Batch",
              "startDate": "2025-10-01T00:00:00.000Z",
              "endDate": "2025-11-01T00:00:00.000Z",
              "maxStudents": 30,
              "price": 5000,
              "currency": "INR",
              "timeSlots": [
                {
                  "date": "2025-10-01T00:00:00.000Z",
                  "startTime": "09:00",
                  "endTime": "11:00",
                  "duration": 120,
                  "isActive": true
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

**Response Structure:**
- `overallStats`: Summary statistics for all students and enrollments
- `students`: Array of all students with their complete data
  - `studentId`: MongoDB ObjectId of the student
  - `studentDetails`: Complete student information
  - `enrollmentStats`: Statistics for this student's enrollments
  - `enrollments`: Array of all enrollments for this student
    - `enrollmentId`: MongoDB ObjectId of the enrollment
    - `enrollmentDate`: Date when student enrolled
    - `status`: Enrollment status (enrolled, completed, etc.)
    - `paymentStatus`: Payment status (paid, pending, etc.)
    - `progress`: Course progress percentage
    - `course`: Complete course information
    - `batch`: Complete batch information with time slots
