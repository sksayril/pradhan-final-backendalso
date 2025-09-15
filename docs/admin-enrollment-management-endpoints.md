# Admin Enrollment Management API Endpoints

This document describes the admin enrollment management endpoints that allow admins to check, approve, and reject student enrollment requests.

## Authentication

All enrollment management endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: Admin role only

```http
Authorization: Bearer <admin_jwt_token>
```

## Endpoints

### 1. Get All Enrollments

Retrieve all enrollments with comprehensive filtering and pagination options.

**Endpoint:** `GET /api/admin/enrollments`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of enrollments per page (default: 10)
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `status` (optional): Filter by enrollment status (`pending`, `approved`, `rejected`, `enrolled`, `active`, `completed`, `dropped`, `suspended`)
- `approvalStatus` (optional): Filter by approval status (`pending`, `approved`, `rejected`)
- `paymentStatus` (optional): Filter by payment status (`pending`, `paid`, `partial`, `refunded`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `sortBy` (optional): Sort field (default: `enrollmentDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/admin/enrollments?page=1&limit=100&sortBy=enrollmentDate&sortOrder=desc&batchId=68c6ffdc233574e85b0ea1dc
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
          "studentId": "STU123",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890"
        },
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8
        },
        "batchId": {
          "_id": "68c6ffdc233574e85b0ea1dc",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30,
          "enrolledStudents": ["60d0fe4f5b9f9b2b4c8b456a", "60d0fe4f5b9f9b2b4c8b456b"]
        },
        "status": "enrolled",
        "approvalStatus": "approved",
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "paymentStatus": "paid",
        "paymentAmount": 5000,
        "currency": "INR",
        "approvedBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456d",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "statistics": {
      "totalEnrollments": 150,
      "pendingEnrollments": 25,
      "approvedEnrollments": 100,
      "rejectedEnrollments": 10,
      "totalRevenue": 750000
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalEnrollments": 150,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Check Student Enrollment Status

Check the enrollment status of a specific student across all courses and batches.

**Endpoint:** `GET /api/admin/enrollments/student/status`

**Query Parameters:**
- `studentId` (required): Student ID to check
- `courseId` (optional): Filter by specific course ID
- `batchId` (optional): Filter by specific batch ID

**Example Request:**
```http
GET /api/admin/enrollments/student/status?studentId=60d0fe4f5b9f9b2b4c8b456a
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Student enrollment status retrieved successfully",
  "data": {
    "student": {
      "id": "60d0fe4f5b9f9b2b4c8b456a",
      "name": "John Doe",
      "studentId": "STU123",
      "email": "john.doe@example.com"
    },
    "statistics": {
      "total": 3,
      "pending": 1,
      "approved": 1,
      "rejected": 0,
      "enrolled": 1,
      "active": 1,
      "completed": 0,
      "dropped": 0,
      "suspended": 0
    },
    "enrollments": {
      "pending": [
        {
          "_id": "60d0fe4f5b9f9b2b4c8b4569",
          "studentId": {
            "_id": "60d0fe4f5b9f9b2b4c8b456a",
            "firstName": "John",
            "lastName": "Doe",
            "studentId": "STU123",
            "email": "john.doe@example.com"
          },
          "courseId": {
            "_id": "60d0fe4f5b9f9b2b4c8b4567",
            "title": "Advanced Python",
            "category": "Programming",
            "type": "online",
            "price": 8000,
            "currency": "INR"
          },
          "batchId": {
            "_id": "60d0fe4f5b9f9b2b4c8b4568",
            "name": "Python Advanced Batch",
            "startDate": "2024-02-01T00:00:00.000Z",
            "endDate": "2024-04-01T00:00:00.000Z",
            "maxStudents": 25
          },
          "status": "pending",
          "approvalStatus": "pending",
          "enrollmentDate": "2024-01-15T10:00:00.000Z",
          "paymentAmount": 8000,
          "currency": "INR"
        }
      ],
      "approved": [],
      "rejected": [],
      "enrolled": [],
      "active": [],
      "completed": [],
      "dropped": [],
      "suspended": []
    },
    "allEnrollments": [...]
  }
}
```

### 2. Get All Pending Enrollment Requests

Retrieve all pending enrollment requests with filtering and pagination.

**Endpoint:** `GET /api/admin/enrollments/pending`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of enrollments per page (default: 10)
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `sortBy` (optional): Sort field (default: `enrollmentDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/admin/enrollments/pending?page=1&limit=10&courseId=60d0fe4f5b9f9b2b4c8b4567
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pending enrollments retrieved successfully",
  "data": {
    "enrollments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "studentId": "STU123",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890"
        },
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30,
          "enrolledStudents": ["60d0fe4f5b9f9b2b4c8b456a", "60d0fe4f5b9f9b2b4c8b456b"]
        },
        "status": "pending",
        "approvalStatus": "pending",
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "paymentAmount": 5000,
        "currency": "INR",
        "paymentStatus": "pending"
      }
    ],
    "statistics": {
      "totalPending": 15,
      "totalAmount": 75000
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalEnrollments": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Approve Student Enrollment

Approve a pending enrollment request.

**Endpoint:** `PUT /api/admin/enrollments/:enrollmentId/approve`

**Path Parameters:**
- `enrollmentId` (required): Enrollment ID to approve

**Request Body:**
```json
{
  "adminNotes": "Student meets all requirements. Approved for enrollment."
}
```

**Example Request:**
```http
PUT /api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/approve
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "adminNotes": "Student meets all requirements. Approved for enrollment."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment approved successfully",
  "data": {
    "enrollment": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "student": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com"
      },
      "course": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online"
      },
      "batch": {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "name": "Python Morning Batch",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-03-01T00:00:00.000Z",
        "maxStudents": 30,
        "enrolledStudents": ["60d0fe4f5b9f9b2b4c8b456a", "60d0fe4f5b9f9b2b4c8b456b", "60d0fe4f5b9f9b2b4c8b456c"]
      },
      "status": "enrolled",
      "approvalStatus": "approved",
      "approvedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456d",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "approvedAt": "2024-01-15T14:30:00.000Z",
      "adminNotes": "Student meets all requirements. Approved for enrollment.",
      "enrollmentDate": "2024-01-15T10:00:00.000Z",
      "paymentAmount": 5000,
      "currency": "INR"
    }
  }
}
```

### 4. Reject Student Enrollment

Reject a pending enrollment request.

**Endpoint:** `PUT /api/admin/enrollments/:enrollmentId/reject`

**Path Parameters:**
- `enrollmentId` (required): Enrollment ID to reject

**Request Body:**
```json
{
  "rejectionReason": "Insufficient prerequisites",
  "rejectionNotes": "Student needs to complete basic programming course first."
}
```

**Example Request:**
```http
PUT /api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/reject
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient prerequisites",
  "rejectionNotes": "Student needs to complete basic programming course first."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment rejected successfully",
  "data": {
    "enrollment": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "student": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com"
      },
      "course": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online"
      },
      "batch": {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "name": "Python Morning Batch",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-03-01T00:00:00.000Z",
        "maxStudents": 30
      },
      "status": "rejected",
      "approvalStatus": "rejected",
      "approvedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456d",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "approvedAt": "2024-01-15T14:30:00.000Z",
      "rejectionReason": "Insufficient prerequisites",
      "rejectionNotes": "Student needs to complete basic programming course first.",
      "enrollmentDate": "2024-01-15T10:00:00.000Z",
      "paymentAmount": 5000,
      "currency": "INR"
    }
  }
}
```

### 5. Get Enrollment Statistics

Retrieve comprehensive enrollment statistics.

**Endpoint:** `GET /api/admin/enrollments/statistics`

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID

**Example Request:**
```http
GET /api/admin/enrollments/statistics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment statistics retrieved successfully",
  "data": {
    "overall": {
      "totalEnrollments": 150,
      "pendingEnrollments": 25,
      "approvedEnrollments": 100,
      "rejectedEnrollments": 10,
      "activeEnrollments": 80,
      "completedEnrollments": 20,
      "totalRevenue": 750000,
      "averageRating": 4.2
    },
    "byCourse": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "courseName": "Introduction to Python",
        "courseType": "online",
        "totalEnrollments": 50,
        "pendingEnrollments": 8,
        "approvedEnrollments": 35,
        "rejectedEnrollments": 3,
        "totalRevenue": 175000
      }
    ],
    "byBatch": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "batchName": "Python Morning Batch",
        "courseName": "Introduction to Python",
        "totalEnrollments": 25,
        "pendingEnrollments": 3,
        "approvedEnrollments": 20,
        "rejectedEnrollments": 1,
        "totalRevenue": 100000
      }
    ],
    "recentEnrollments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "studentId": "STU123",
          "email": "john.doe@example.com"
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
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z"
        },
        "status": "enrolled",
        "approvalStatus": "approved",
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "paymentAmount": 5000,
        "currency": "INR"
      }
    ]
  }
}
```

### 6. Get Enrollment Details

Retrieve detailed information about a specific enrollment.

**Endpoint:** `GET /api/admin/enrollments/:enrollmentId`

**Path Parameters:**
- `enrollmentId` (required): Enrollment ID

**Example Request:**
```http
GET /api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment details retrieved successfully",
  "data": {
    "enrollment": {
      "_id": "60d0fe4f5b9f9b2b4c8b4569",
      "studentId": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com",
        "phoneNumber": "+1234567890",
        "dateOfBirth": "1995-05-15T00:00:00.000Z",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        }
      },
      "courseId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online",
        "price": 5000,
        "currency": "INR",
        "duration": 8,
        "durationUnit": "weeks",
        "instructor": "Dr. Smith",
        "description": "Learn Python programming from basics to advanced concepts"
      },
      "batchId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "name": "Python Morning Batch",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-03-01T00:00:00.000Z",
        "maxStudents": 30,
        "enrolledStudents": ["60d0fe4f5b9f9b2b4c8b456a", "60d0fe4f5b9f9b2b4c8b456b"],
        "timeSlots": [
          {
            "date": "2024-01-01T00:00:00.000Z",
            "startTime": "09:00",
            "endTime": "11:00",
            "duration": 120,
            "isActive": true
          }
        ],
        "venue": "Online"
      },
      "status": "enrolled",
      "approvalStatus": "approved",
      "enrollmentDate": "2024-01-15T10:00:00.000Z",
      "paymentStatus": "pending",
      "paymentAmount": 5000,
      "currency": "INR",
      "approvedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456d",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "approvedAt": "2024-01-15T14:30:00.000Z",
      "adminNotes": "Student meets all requirements. Approved for enrollment.",
      "progress": {
        "completedLessons": [],
        "overallProgress": 0,
        "lastAccessedAt": "2024-01-15T10:00:00.000Z"
      },
      "attendance": [],
      "rating": null,
      "review": null,
      "enrollmentSource": "website",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

### 7. Sync Enrollment with Batch

Synchronize enrollment status with batch enrollment list. This endpoint fixes mismatches between enrollment approval status and the batch's enrolledStudents array.

**Endpoint:** `PUT /api/admin/enrollments/:enrollmentId/sync`

**Path Parameters:**
- `enrollmentId` (required): Enrollment ID to sync

**Use Cases:**
- **Approved enrollment not in batch**: Adds student to batch's enrolledStudents array
- **Rejected enrollment still in batch**: Removes student from batch's enrolledStudents array
- **Pending enrollment**: No action needed

**Example Request:**
```http
PUT /api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/sync
Authorization: Bearer <admin_jwt_token>
```

**Response (Student Added to Batch):**
```json
{
  "success": true,
  "message": "Enrollment sync completed",
  "data": {
    "enrollment": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "student": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com"
      },
      "course": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online"
      },
      "batch": {
        "id": "68c6ffdc233574e85b0ea1dc",
        "name": "Python Morning Batch",
        "enrolledStudentsCount": 15
      },
      "status": "enrolled",
      "approvalStatus": "approved",
      "wasInBatch": false,
      "action": "Added student to batch enrolledStudents array",
      "updated": true
    }
  }
}
```

**Response (Student Removed from Batch):**
```json
{
  "success": true,
  "message": "Enrollment sync completed",
  "data": {
    "enrollment": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "student": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com"
      },
      "course": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online"
      },
      "batch": {
        "id": "68c6ffdc233574e85b0ea1dc",
        "name": "Python Morning Batch",
        "enrolledStudentsCount": 14
      },
      "status": "rejected",
      "approvalStatus": "rejected",
      "wasInBatch": true,
      "action": "Removed student from batch enrolledStudents array",
      "updated": true
    }
  }
}
```

**Response (No Action Needed):**
```json
{
  "success": true,
  "message": "Enrollment sync completed",
  "data": {
    "enrollment": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "student": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123",
        "email": "john.doe@example.com"
      },
      "course": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Introduction to Python",
        "category": "Programming",
        "type": "online"
      },
      "batch": {
        "id": "68c6ffdc233574e85b0ea1dc",
        "name": "Python Morning Batch",
        "enrolledStudentsCount": 15
      },
      "status": "pending",
      "approvalStatus": "pending",
      "wasInBatch": false,
      "action": "No sync needed - enrollment is pending",
      "updated": false
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Student ID is required"
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
  "message": "Access denied. Admin role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Enrollment not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to approve enrollment",
  "error": "Database connection error"
}
```

## Usage Examples

### JavaScript/Fetch

#### Get All Enrollments
```javascript
const response = await fetch('/api/admin/enrollments?page=1&limit=100&batchId=68c6ffdc233574e85b0ea1dc', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.enrollments);
```

#### Check Student Enrollment Status
```javascript
const response = await fetch('/api/admin/enrollments/student/status?studentId=60d0fe4f5b9f9b2b4c8b456a', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.statistics);
```

#### Approve Enrollment
```javascript
const response = await fetch('/api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/approve', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    adminNotes: 'Student meets all requirements. Approved for enrollment.'
  })
});

const data = await response.json();
console.log(data.data.enrollment);
```

#### Reject Enrollment
```javascript
const response = await fetch('/api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/reject', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rejectionReason: 'Insufficient prerequisites',
    rejectionNotes: 'Student needs to complete basic programming course first.'
  })
});

const data = await response.json();
console.log(data.data.enrollment);
```

#### Sync Enrollment with Batch
```javascript
const response = await fetch('/api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/sync', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.enrollment);
```

### cURL

#### Get All Enrollments
```bash
curl -X GET "http://localhost:3000/api/admin/enrollments?page=1&limit=100&batchId=68c6ffdc233574e85b0ea1dc" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Get Pending Enrollments
```bash
curl -X GET "http://localhost:3000/api/admin/enrollments/pending?page=1&limit=10" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Get Enrollment Statistics
```bash
curl -X GET "http://localhost:3000/api/admin/enrollments/statistics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Sync Enrollment with Batch
```bash
curl -X PUT "http://localhost:3000/api/admin/enrollments/60d0fe4f5b9f9b2b4c8b4569/sync" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

## Notes

1. **Enrollment Status Flow**: `pending` → `approved`/`rejected` → `enrolled` → `active` → `completed`
2. **Approval Workflow**: All enrollments start as `pending` and require admin approval
3. **Batch Capacity**: System checks batch capacity before approving enrollments
4. **Student Addition**: Approved students are automatically added to batch enrolled students list
5. **Enrollment-Batch Sync**: Use the sync endpoint to fix mismatches between enrollment status and batch enrollment list
6. **Attendance Integration**: Students must be in batch enrolledStudents array to mark attendance
7. **Audit Trail**: All approval/rejection actions are logged with admin details and timestamps
8. **Pagination**: All list endpoints support pagination with configurable page size
9. **Filtering**: Multiple filter options are available for each endpoint
10. **Statistics**: Comprehensive statistics are available for monitoring enrollment trends
11. **Authorization**: All endpoints require admin authentication and authorization
12. **Performance**: Queries are optimized with database indexes for better performance

## Enrollment Status Definitions

- **Pending**: Enrollment request submitted, awaiting admin approval
- **Approved**: Admin has approved the enrollment request
- **Rejected**: Admin has rejected the enrollment request
- **Enrolled**: Student is officially enrolled in the course/batch
- **Active**: Student is actively participating in the course
- **Completed**: Student has completed the course
- **Dropped**: Student has dropped out of the course
- **Suspended**: Student enrollment has been suspended

## Approval Workflow

1. **Student Submits**: Student submits enrollment request (status: `pending`)
2. **Admin Reviews**: Admin reviews the enrollment request
3. **Admin Decides**: Admin approves or rejects the request
4. **System Updates**: System updates enrollment status and adds student to batch (if approved)
5. **Notification**: Student is notified of the decision

## Batch Capacity Management

- **Capacity Check**: System automatically checks batch capacity before approval
- **Full Batch**: Enrollments are rejected if batch is at maximum capacity
- **Student Addition**: Approved students are automatically added to batch enrolled students list
- **Real-time Updates**: Batch capacity is updated in real-time
