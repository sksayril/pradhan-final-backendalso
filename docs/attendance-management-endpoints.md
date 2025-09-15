# Attendance Management API Endpoints

This document describes the attendance management endpoints that allow admins to mark attendance and students to view their attendance records.

## Authentication

All attendance endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: Admin role for admin endpoints, Student role for student endpoints

```http
Authorization: Bearer <jwt_token>
```

## Admin Attendance Endpoints

### 1. Mark Attendance for Single Student (Simplified)

Mark attendance for a single student with automatic course and batch detection.

**Endpoint:** `POST /api/admin/attendance/mark-simple`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "60d0fe4f5b9f9b2b4c8b456a",
  "attendanceDate": "2024-01-15T10:00:00.000Z",
  "status": "present",
  "timeSlot": {
    "startTime": "09:00",
    "endTime": "11:00"
  },
  "remarks": "Student was on time"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
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
        "endDate": "2024-03-01T00:00:00.000Z"
      },
      "attendanceDate": "2024-01-15T10:00:00.000Z",
      "status": "present",
      "timeSlot": {
        "startTime": "09:00",
        "endTime": "11:00",
        "duration": 120
      },
      "remarks": "Student was on time",
      "markedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456d",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Notes:**
- The system automatically detects the course and batch from the student's approved enrollments
- If the student has multiple enrollments, the first active enrollment is used
- Student must have at least one approved enrollment to mark attendance
- **No batch enrollment validation**: This simplified API does not check if the student is in the batch's enrolledStudents array
- **Relies on enrollment status**: The system uses the enrollment record status instead of batch enrollment validation

### 2. Mark Attendance for Single Student (Original)

Mark attendance for a single student in a specific course and batch.

**Endpoint:** `POST /api/admin/attendance/mark`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "60d0fe4f5b9f9b2b4c8b456a",
  "courseId": "60d0fe4f5b9f9b2b4c8b4567",
  "batchId": "60d0fe4f5b9f9b2b4c8b4568",
  "attendanceDate": "2024-01-15T10:00:00.000Z",
  "status": "present",
  "timeSlot": {
    "startTime": "09:00",
    "endTime": "11:00"
  },
  "remarks": "Student was on time"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
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
      "attendanceDate": "2024-01-15T10:00:00.000Z",
      "status": "present",
      "timeSlot": {
        "startTime": "09:00",
        "endTime": "11:00",
        "duration": 120
      },
      "remarks": "Student was on time",
      "markedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456b",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "markedAt": "2024-01-15T10:05:00.000Z",
      "isActive": true,
      "createdAt": "2024-01-15T10:05:00.000Z",
      "updatedAt": "2024-01-15T10:05:00.000Z"
    }
  }
}
```

### 3. Mark Attendance for Multiple Students (Batch)

Mark attendance for multiple students in a batch at once.

**Endpoint:** `POST /api/admin/attendance/mark-batch`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "60d0fe4f5b9f9b2b4c8b4567",
  "batchId": "60d0fe4f5b9f9b2b4c8b4568",
  "attendanceDate": "2024-01-15T10:00:00.000Z",
  "timeSlot": {
    "startTime": "09:00",
    "endTime": "11:00"
  },
  "attendanceList": [
    {
      "studentId": "60d0fe4f5b9f9b2b4c8b456a",
      "status": "present"
    },
    {
      "studentId": "60d0fe4f5b9f9b2b4c8b456c",
      "status": "late"
    },
    {
      "studentId": "60d0fe4f5b9f9b2b4c8b456d",
      "status": "absent"
    }
  ],
  "remarks": "Regular class session"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for 3 students",
  "data": {
    "successfulRecords": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "studentId": "STU123",
          "email": "john.doe@example.com"
        },
        "status": "present",
        "attendanceDate": "2024-01-15T10:00:00.000Z"
      }
    ],
    "errors": [
      {
        "studentId": "60d0fe4f5b9f9b2b4c8b456d",
        "error": "Attendance already marked for this student on this date and time slot"
      }
    ],
    "summary": {
      "totalProcessed": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

### 4. Get Attendance Records

Retrieve attendance records with filtering and pagination.

**Endpoint:** `GET /api/admin/attendance/records`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `status` (optional): Filter by status (`present`, `absent`, `late`, `excused`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `sortBy` (optional): Sort field (default: `attendanceDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/admin/attendance/records?page=1&limit=10&status=present&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendanceRecords": [
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
        "attendanceDate": "2024-01-15T10:00:00.000Z",
        "status": "present",
        "timeSlot": {
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120
        },
        "remarks": "Student was on time",
        "markedBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "markedAt": "2024-01-15T10:05:00.000Z",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 5. Get Attendance Statistics

Retrieve comprehensive attendance statistics.

**Endpoint:** `GET /api/admin/attendance/statistics`

**Query Parameters:**
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example Request:**
```http
GET /api/admin/attendance/statistics?courseId=60d0fe4f5b9f9b2b4c8b4567&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance statistics retrieved successfully",
  "data": {
    "overall": {
      "total": 150,
      "present": 120,
      "absent": 20,
      "late": 8,
      "excused": 2,
      "attendancePercentage": 85
    },
    "byCourse": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "courseName": "Introduction to Python",
        "statusCounts": [
          { "status": "present", "count": 60 },
          { "status": "absent", "count": 10 },
          { "status": "late", "count": 4 },
          { "status": "excused", "count": 1 }
        ]
      }
    ],
    "byBatch": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "batchName": "Python Morning Batch",
        "statusCounts": [
          { "status": "present", "count": 30 },
          { "status": "absent", "count": 5 },
          { "status": "late", "count": 2 },
          { "status": "excused", "count": 0 }
        ]
      }
    ]
  }
}
```

### 6. Update Attendance Record

Update an existing attendance record.

**Endpoint:** `PUT /api/admin/attendance/:id`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "late",
  "remarks": "Student arrived 15 minutes late"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "attendance": {
      "_id": "60d0fe4f5b9f9b2b4c8b4569",
      "status": "late",
      "remarks": "Student arrived 15 minutes late",
      "markedAt": "2024-01-15T10:10:00.000Z",
      "updatedAt": "2024-01-15T10:10:00.000Z"
    }
  }
}
```

### 7. Delete Attendance Record

Soft delete an attendance record.

**Endpoint:** `DELETE /api/admin/attendance/:id`

### 8. Get Student Attendance Report

Get comprehensive attendance report for a specific student with month-wise data and statistics.

**Endpoint:** `GET /api/admin/attendance/student/:studentId/report`

**Path Parameters:**
- `studentId` (required): Student ID

**Query Parameters:**
- `year` (optional): Filter by specific year (e.g., 2024)
- `month` (optional): Filter by specific month (1-12, requires year)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example Requests:**
```http
# Get all attendance for student
GET /api/admin/attendance/student/68C69E0590E15D67E268AD65/report

# Get attendance for specific year
GET /api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024

# Get attendance for specific month
GET /api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024&month=1

# Get attendance for date range
GET /api/admin/attendance/student/68C69E0590E15D67E268AD65/report?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Student attendance report retrieved successfully",
  "data": {
    "student": {
      "id": "68C69E0590E15D67E268AD65",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890"
    },
    "enrollments": [
      {
        "id": "68c71c726980d32d084d9c57",
        "course": {
          "_id": "68c6a9cd84024c4f720e861a",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online"
        },
        "batch": {
          "_id": "68c6ffdc233574e85b0ea1dc",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z"
        },
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "status": "enrolled",
        "approvalStatus": "approved"
      }
    ],
    "summary": {
      "totalDays": 25,
      "present": 20,
      "absent": 3,
      "late": 2,
      "excused": 0,
      "overallAttendanceRate": 88
    },
    "monthlyReport": [
      {
        "month": "January 2024",
        "monthKey": "2024-01",
        "totalDays": 12,
        "present": 10,
        "absent": 1,
        "late": 1,
        "excused": 0,
        "attendanceRate": 92,
        "records": [
          {
            "id": "68c71c726980d32d084d9c58",
            "date": "2024-01-15T10:00:00.000Z",
            "status": "present",
            "timeSlot": {
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120
            },
            "remarks": "Student was on time",
            "course": {
              "_id": "68c6a9cd84024c4f720e861a",
              "title": "Introduction to Python",
              "category": "Programming",
              "type": "online"
            },
            "batch": {
              "_id": "68c6ffdc233574e85b0ea1dc",
              "name": "Python Morning Batch",
              "startDate": "2024-01-01T00:00:00.000Z",
              "endDate": "2024-03-01T00:00:00.000Z"
            },
            "markedBy": {
              "_id": "68c66237516e72a030641ddc",
              "firstName": "Admin",
              "lastName": "User",
              "email": "admin@example.com"
            },
            "createdAt": "2024-01-15T10:30:00.000Z"
          }
        ]
      },
      {
        "month": "February 2024",
        "monthKey": "2024-02",
        "totalDays": 13,
        "present": 10,
        "absent": 2,
        "late": 1,
        "excused": 0,
        "attendanceRate": 85,
        "records": []
      }
    ],
    "filter": {
      "year": "2024",
      "month": null,
      "startDate": null,
      "endDate": null
    }
  }
}
```

**Features:**
- **Month-wise grouping**: Attendance data grouped by month with individual statistics
- **Overall summary**: Total attendance statistics across all periods
- **Student information**: Complete student details and enrollment information
- **Flexible filtering**: Filter by year, month, or date range
- **Attendance rate calculation**: Automatic calculation of attendance percentages
- **Detailed records**: Individual attendance records with course, batch, and admin information

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance record deleted successfully"
}
```

## Student Attendance Endpoints

### 1. Get My Attendance Records

Retrieve the authenticated student's attendance records.

**Endpoint:** `GET /api/student/attendance`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `status` (optional): Filter by status (`present`, `absent`, `late`, `excused`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `sortBy` (optional): Sort field (default: `attendanceDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/student/attendance?page=1&limit=10&status=present
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendanceRecords": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30
        },
        "attendanceDate": "2024-01-15T10:00:00.000Z",
        "status": "present",
        "timeSlot": {
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120
        },
        "remarks": "Student was on time",
        "markedAt": "2024-01-15T10:05:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get My Attendance Statistics

Retrieve the authenticated student's attendance statistics.

**Endpoint:** `GET /api/student/attendance/statistics`

**Query Parameters:**
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example Request:**
```http
GET /api/student/attendance/statistics?courseId=60d0fe4f5b9f9b2b4c8b4567
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance statistics retrieved successfully",
  "data": {
    "overall": {
      "total": 25,
      "present": 20,
      "absent": 3,
      "late": 2,
      "excused": 0,
      "attendancePercentage": 88
    },
    "byCourse": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "courseName": "Introduction to Python",
        "courseType": "online",
        "statusCounts": [
          { "status": "present", "count": 15 },
          { "status": "absent", "count": 2 },
          { "status": "late", "count": 1 },
          { "status": "excused", "count": 0 }
        ],
        "totalClasses": 18,
        "presentClasses": 16,
        "attendancePercentage": 89
      }
    ],
    "byBatch": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "batchName": "Python Morning Batch",
        "courseName": "Introduction to Python",
        "statusCounts": [
          { "status": "present", "count": 15 },
          { "status": "absent", "count": 2 },
          { "status": "late", "count": 1 },
          { "status": "excused", "count": 0 }
        ],
        "totalClasses": 18,
        "presentClasses": 16,
        "attendancePercentage": 89
      }
    ],
    "recentAttendance": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
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
        "attendanceDate": "2024-01-15T10:00:00.000Z",
        "status": "present",
        "timeSlot": {
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120
        }
      }
    ]
  }
}
```

### 3. Get My Attendance Summary

Retrieve a comprehensive attendance summary for the authenticated student.

**Endpoint:** `GET /api/student/attendance/summary`

**Query Parameters:**
- `period` (optional): Number of days to include (default: 30)

**Example Request:**
```http
GET /api/student/attendance/summary?period=30
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance summary retrieved successfully",
  "data": {
    "period": {
      "startDate": "2023-12-16T00:00:00.000Z",
      "endDate": "2024-01-15T00:00:00.000Z",
      "days": 30
    },
    "overall": {
      "total": 20,
      "present": 17,
      "absent": 2,
      "late": 1,
      "excused": 0,
      "attendancePercentage": 90
    },
    "dailyAttendance": [
      {
        "_id": "2024-01-15",
        "statusCounts": [
          { "status": "present", "count": 1 }
        ],
        "totalClasses": 1,
        "presentClasses": 1,
        "attendancePercentage": 100
      },
      {
        "_id": "2024-01-14",
        "statusCounts": [
          { "status": "present", "count": 1 }
        ],
        "totalClasses": 1,
        "presentClasses": 1,
        "attendancePercentage": 100
      }
    ],
    "weeklyTrends": [
      {
        "_id": {
          "week": 3,
          "year": 2024
        },
        "statusCounts": [
          { "status": "present", "count": 5 },
          { "status": "late", "count": 1 }
        ],
        "totalClasses": 6,
        "presentClasses": 6,
        "attendancePercentage": 100
      }
    ]
  }
}
```

### 4. Get My Course Attendance

Retrieve attendance records for a specific course.

**Endpoint:** `GET /api/student/attendance/course/:courseId`

**Path Parameters:**
- `courseId` (required): Course ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `batchId` (optional): Filter by batch ID
- `status` (optional): Filter by status
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `sortBy` (optional): Sort field (default: `attendanceDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/student/attendance/course/60d0fe4f5b9f9b2b4c8b4567?page=1&limit=10
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Course attendance retrieved successfully",
  "data": {
    "attendanceRecords": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8,
          "durationUnit": "weeks",
          "instructor": "Dr. Smith"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30,
          "timeSlots": [
            {
              "date": "2024-01-01T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120,
              "isActive": true
            }
          ]
        },
        "attendanceDate": "2024-01-15T10:00:00.000Z",
        "status": "present",
        "timeSlot": {
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120
        },
        "remarks": "Student was on time",
        "markedAt": "2024-01-15T10:05:00.000Z"
      }
    ],
    "courseStats": {
      "total": 18,
      "present": 15,
      "absent": 2,
      "late": 1,
      "excused": 0,
      "attendancePercentage": 89
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRecords": 18,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 5. Get My Batch Attendance

Retrieve attendance records for a specific batch.

**Endpoint:** `GET /api/student/attendance/batch/:batchId`

**Path Parameters:**
- `batchId` (required): Batch ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `status` (optional): Filter by status
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `sortBy` (optional): Sort field (default: `attendanceDate`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```http
GET /api/student/attendance/batch/60d0fe4f5b9f9b2b4c8b4568?page=1&limit=10
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Batch attendance retrieved successfully",
  "data": {
    "attendanceRecords": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8,
          "durationUnit": "weeks",
          "instructor": "Dr. Smith"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30,
          "timeSlots": [
            {
              "date": "2024-01-01T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120,
              "isActive": true
            }
          ]
        },
        "attendanceDate": "2024-01-15T10:00:00.000Z",
        "status": "present",
        "timeSlot": {
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120
        },
        "remarks": "Student was on time",
        "markedAt": "2024-01-15T10:05:00.000Z"
      }
    ],
    "batchStats": {
      "total": 18,
      "present": 15,
      "absent": 2,
      "late": 1,
      "excused": 0,
      "attendancePercentage": 89
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRecords": 18,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Enrollment-Attendance Integration

### Important Notes

1. **Enrollment Requirement**: Students must be enrolled in a batch before attendance can be marked
2. **Simplified API**: The `/mark-simple` endpoint does NOT check batch enrollment - it only requires an approved enrollment record
3. **Original API**: The `/mark` endpoint still checks if the student is in the batch's `enrolledStudents` array
4. **Enhanced Error Debugging**: If a student is not found in the batch, the system provides detailed debugging information

### Common Issue: "Student is not enrolled in this batch"

If you receive this error, the response will include detailed debugging information:

```json
{
  "success": false,
  "message": "Student is not enrolled in this batch",
  "debug": {
    "studentId": "60d0fe4f5b9f9b2b4c8b456a",
    "batchId": "68c6ffdc233574e85b0ea1dc",
    "enrolledStudents": [...],
    "enrolledStudentIds": [...],
    "hasApprovedEnrollment": true,
    "enrollmentStatus": {
      "status": "enrolled",
      "approvalStatus": "approved",
      "enrollmentDate": "2024-01-15T10:00:00.000Z"
    },
    "suggestion": "Student has approved enrollment but is not in batch. Use sync endpoint to fix."
  }
}
```

### Solutions

#### Option 1: Use the Sync Endpoint
If the student has an approved enrollment but is not in the batch's enrolledStudents array:

```bash
PUT /api/admin/enrollments/ENROLLMENT_ID/sync
```

This will automatically add the student to the batch.

#### Option 2: Check Enrollment Status
Verify the student's enrollment status:

```bash
GET /api/admin/enrollments/student/status?studentId=STUDENT_ID&courseId=COURSE_ID&batchId=BATCH_ID
```

#### Option 3: Approve Pending Enrollment
If the enrollment is still pending:

```bash
PUT /api/admin/enrollments/ENROLLMENT_ID/approve
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Student ID, Course ID, Batch ID, Status, and Time Slot are required"
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
  "message": "Student not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Attendance already marked for this student on this date and time slot"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to mark attendance",
  "error": "Database connection error"
}
```

### 6. Get My Attendance Report

Get comprehensive attendance report for the authenticated student with month-wise data and statistics.

**Endpoint:** `GET /api/student/attendance/report`

**Query Parameters:**
- `year` (optional): Filter by specific year (e.g., 2024)
- `month` (optional): Filter by specific month (1-12, requires year)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example Requests:**
```http
# Get all attendance for student
GET /api/student/attendance/report

# Get attendance for specific year
GET /api/student/attendance/report?year=2024

# Get attendance for specific month
GET /api/student/attendance/report?year=2024&month=1

# Get attendance for date range
GET /api/student/attendance/report?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Your attendance report retrieved successfully",
  "data": {
    "student": {
      "id": "68C69E0590E15D67E268AD65",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890"
    },
    "enrollments": [
      {
        "id": "68c71c726980d32d084d9c57",
        "course": {
          "_id": "68c6a9cd84024c4f720e861a",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online"
        },
        "batch": {
          "_id": "68c6ffdc233574e85b0ea1dc",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z"
        },
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "status": "enrolled",
        "approvalStatus": "approved"
      }
    ],
    "summary": {
      "totalDays": 25,
      "present": 20,
      "absent": 3,
      "late": 2,
      "excused": 0,
      "overallAttendanceRate": 88
    },
    "monthlyReport": [
      {
        "month": "January 2024",
        "monthKey": "2024-01",
        "totalDays": 12,
        "present": 10,
        "absent": 1,
        "late": 1,
        "excused": 0,
        "attendanceRate": 92,
        "records": [
          {
            "id": "68c71c726980d32d084d9c58",
            "date": "2024-01-15T10:00:00.000Z",
            "status": "present",
            "timeSlot": {
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120
            },
            "remarks": "Student was on time",
            "course": {
              "_id": "68c6a9cd84024c4f720e861a",
              "title": "Introduction to Python",
              "category": "Programming",
              "type": "online"
            },
            "batch": {
              "_id": "68c6ffdc233574e85b0ea1dc",
              "name": "Python Morning Batch",
              "startDate": "2024-01-01T00:00:00.000Z",
              "endDate": "2024-03-01T00:00:00.000Z"
            },
            "markedBy": {
              "_id": "68c66237516e72a030641ddc",
              "firstName": "Admin",
              "lastName": "User",
              "email": "admin@example.com"
            },
            "createdAt": "2024-01-15T10:30:00.000Z"
          }
        ]
      },
      {
        "month": "February 2024",
        "monthKey": "2024-02",
        "totalDays": 13,
        "present": 10,
        "absent": 2,
        "late": 1,
        "excused": 0,
        "attendanceRate": 85,
        "records": []
      }
    ],
    "filter": {
      "year": "2024",
      "month": null,
      "startDate": null,
      "endDate": null
    }
  }
}
```

**Features:**
- **Month-wise grouping**: Attendance data grouped by month with individual statistics
- **Overall summary**: Total attendance statistics across all periods
- **Student information**: Complete student details and enrollment information
- **Flexible filtering**: Filter by year, month, or date range
- **Attendance rate calculation**: Automatic calculation of attendance percentages
- **Detailed records**: Individual attendance records with course, batch, and admin information
- **Self-service**: Students can view their own comprehensive attendance report

### 7. Get My Profile

Get complete student profile data including personal information, KYC status, enrollments, attendance summary, and fee information.

**Endpoint:** `GET /api/student/attendance/profile`

**Response:**
```json
{
  "success": true,
  "message": "Student profile retrieved successfully",
  "data": {
    "profile": {
      "id": "68C69E0590E15D67E268AD65",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "department": "Computer Science",
      "year": "3rd",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "India"
      },
      "profilePicture": "https://example.com/profile.jpg",
      "isActive": true,
      "isVerified": true,
      "kycStatus": "approved",
      "lastLogin": "2024-01-15T14:30:00.000Z",
      "interests": ["Programming", "Web Development", "AI"],
      "achievements": [
        {
          "title": "Best Student Award",
          "description": "Outstanding performance in academics",
          "date": "2023-12-15T00:00:00.000Z",
          "issuer": "University"
        }
      ],
      "originalPassword": "student123",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    },
    "kyc": {
      "id": "68c71c726980d32d084d9c58",
      "status": "approved",
      "submittedAt": "2024-01-10T10:00:00.000Z",
      "reviewedAt": "2024-01-12T14:30:00.000Z",
      "rejectionReason": null,
      "remarks": "Documents verified successfully",
      "reviewedBy": {
        "_id": "68c66237516e72a030641ddc",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "documents": {
        "aadharNumber": "123456789012",
        "aadharCardImage": "https://example.com/aadhar.pdf"
      }
    },
    "enrollments": [
      {
        "id": "68c71c726980d32d084d9c57",
        "course": {
          "_id": "68c6a9cd84024c4f720e861a",
          "title": "Introduction to Python",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8,
          "description": "Learn Python programming from basics to advanced concepts",
          "instructor": "Dr. Smith"
        },
        "batch": {
          "_id": "68c6ffdc233574e85b0ea1dc",
          "name": "Python Morning Batch",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-03-01T00:00:00.000Z",
          "maxStudents": 30,
          "timeSlots": [
            {
              "date": "2024-01-01T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120,
              "isActive": true
            }
          ]
        },
        "status": "enrolled",
        "approvalStatus": "approved",
        "enrollmentDate": "2024-01-15T10:00:00.000Z",
        "paymentAmount": 5000,
        "currency": "INR",
        "paymentStatus": "paid",
        "approvedBy": {
          "_id": "68c66237516e72a030641ddc",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "approvedAt": "2024-01-15T10:30:00.000Z",
        "rejectionReason": null,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "attendance": {
      "summary": {
        "totalDays": 25,
        "present": 20,
        "absent": 3,
        "late": 2,
        "excused": 0,
        "attendanceRate": 88
      }
    },
    "fees": {
      "summary": {
        "totalRequested": 10000,
        "totalPaid": 8000,
        "totalPending": 2000,
        "currency": "INR"
      },
      "requests": [
        {
          "id": "68c71c726980d32d084d9c59",
          "course": {
            "_id": "68c6a9cd84024c4f720e861a",
            "title": "Introduction to Python",
            "category": "Programming",
            "type": "online"
          },
          "batch": {
            "_id": "68c6ffdc233574e85b0ea1dc",
            "name": "Python Morning Batch",
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2024-03-01T00:00:00.000Z"
          },
          "amount": 5000,
          "currency": "INR",
          "status": "paid",
          "dueDate": "2024-01-20T00:00:00.000Z",
          "description": "Course enrollment fee",
          "createdAt": "2024-01-15T10:00:00.000Z"
        }
      ],
      "payments": [
        {
          "id": "68c71c726980d32d084d9c60",
          "course": {
            "_id": "68c6a9cd84024c4f720e861a",
            "title": "Introduction to Python",
            "category": "Programming",
            "type": "online"
          },
          "batch": {
            "_id": "68c6ffdc233574e85b0ea1dc",
            "name": "Python Morning Batch",
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2024-03-01T00:00:00.000Z"
          },
          "amount": 5000,
          "currency": "INR",
          "paymentMethod": "online",
          "paymentDate": "2024-01-16T10:00:00.000Z",
          "transactionId": "TXN123456789",
          "status": "completed",
          "createdAt": "2024-01-16T10:00:00.000Z"
        }
      ]
    },
    "statistics": {
      "totalEnrollments": 1,
      "activeEnrollments": 1,
      "pendingEnrollments": 0,
      "rejectedEnrollments": 0,
      "totalFeeRequests": 2,
      "totalFeePayments": 1,
      "attendanceRate": 88
    }
  }
}
```

**Features:**
- **Complete profile data**: Personal information, contact details, address
- **KYC information**: Status, documents, approval details
- **Enrollment history**: All enrollments with course and batch details
- **Attendance summary**: Overall attendance statistics and rate
- **Fee information**: Requests, payments, and pending amounts
- **Statistics**: Comprehensive overview of student's academic journey
- **Self-service**: Students can view their complete profile data

## Usage Examples

### JavaScript/Fetch

#### Mark Single Student Attendance (Simplified)
```javascript
const response = await fetch('/api/admin/attendance/mark-simple', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: '60d0fe4f5b9f9b2b4c8b456a',
    attendanceDate: '2024-01-15T10:00:00.000Z',
    status: 'present',
    timeSlot: {
      startTime: '09:00',
      endTime: '11:00'
    },
    remarks: 'Student was on time'
  })
});

const data = await response.json();
console.log(data.data.attendance);
```

#### Mark Single Student Attendance (Original)
```javascript
const response = await fetch('/api/admin/attendance/mark', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: '60d0fe4f5b9f9b2b4c8b456a',
    courseId: '60d0fe4f5b9f9b2b4c8b4567',
    batchId: '60d0fe4f5b9f9b2b4c8b4568',
    status: 'present',
    timeSlot: {
      startTime: '09:00',
      endTime: '11:00'
    },
    remarks: 'Student was on time'
  })
});

const data = await response.json();
console.log(data.data.attendance);
```

#### Get Student Attendance
```javascript
const response = await fetch('/api/student/attendance?page=1&limit=10&status=present', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.attendanceRecords);
```

#### Get Student Attendance Report
```javascript
// Get all attendance for student
const response = await fetch('/api/admin/attendance/student/68C69E0590E15D67E268AD65/report', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data);

// Get attendance for specific year
const responseYear = await fetch('/api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const dataYear = await responseYear.json();
console.log(dataYear.data.monthlyReport);

// Get attendance for specific month
const responseMonth = await fetch('/api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024&month=1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  }
});

const dataMonth = await responseMonth.json();
console.log(dataMonth.data.summary);
```

#### Get My Attendance Report (Student)
```javascript
// Get all attendance for student
const response = await fetch('/api/student/attendance/report', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data);

// Get attendance for specific year
const responseYear = await fetch('/api/student/attendance/report?year=2024', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json'
  }
});

const dataYear = await responseYear.json();
console.log(dataYear.data.monthlyReport);

// Get attendance for specific month
const responseMonth = await fetch('/api/student/attendance/report?year=2024&month=1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json'
  }
});

const dataMonth = await responseMonth.json();
console.log(dataMonth.data.summary);
```

#### Get My Profile
```javascript
const response = await fetch('/api/student/attendance/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data);

// Access specific sections
console.log('Profile:', data.data.profile);
console.log('KYC:', data.data.kyc);
console.log('Enrollments:', data.data.enrollments);
console.log('Attendance:', data.data.attendance);
console.log('Fees:', data.data.fees);
console.log('Statistics:', data.data.statistics);
```

### cURL

#### Mark Single Student Attendance (Simplified)
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/mark-simple" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "60d0fe4f5b9f9b2b4c8b456a",
    "attendanceDate": "2024-01-15T10:00:00.000Z",
    "status": "present",
    "timeSlot": {
      "startTime": "09:00",
      "endTime": "11:00"
    },
    "remarks": "Student was on time"
  }'
```

#### Mark Single Student Attendance (Original)
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/mark" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "60d0fe4f5b9f9b2b4c8b456a",
    "courseId": "60d0fe4f5b9f9b2b4c8b4567",
    "batchId": "60d0fe4f5b9f9b2b4c8b4568",
    "attendanceDate": "2024-01-15T10:00:00.000Z",
    "status": "present",
    "timeSlot": {
      "startTime": "09:00",
      "endTime": "11:00"
    },
    "remarks": "Student was on time"
  }'
```

#### Mark Batch Attendance
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/mark-batch" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "60d0fe4f5b9f9b2b4c8b4567",
    "batchId": "60d0fe4f5b9f9b2b4c8b4568",
    "timeSlot": {
      "startTime": "09:00",
      "endTime": "11:00"
    },
    "attendanceList": [
      {
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "status": "present"
      },
      {
        "studentId": "60d0fe4f5b9f9b2b4c8b456c",
        "status": "late"
      }
    ]
  }'
```

#### Get Attendance Statistics
```bash
curl -X GET "http://localhost:3000/api/admin/attendance/statistics?courseId=60d0fe4f5b9f9b2b4c8b4567" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Get Student Attendance Report
```bash
# Get all attendance for student
curl -X GET "http://localhost:3000/api/admin/attendance/student/68C69E0590E15D67E268AD65/report" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for specific year
curl -X GET "http://localhost:3000/api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for specific month
curl -X GET "http://localhost:3000/api/admin/attendance/student/68C69E0590E15D67E268AD65/report?year=2024&month=1" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for date range
curl -X GET "http://localhost:3000/api/admin/attendance/student/68C69E0590E15D67E268AD65/report?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Get My Attendance Report (Student)
```bash
# Get all attendance for student
curl -X GET "http://localhost:3000/api/student/attendance/report" \
  -H "Authorization: Bearer <student_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for specific year
curl -X GET "http://localhost:3000/api/student/attendance/report?year=2024" \
  -H "Authorization: Bearer <student_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for specific month
curl -X GET "http://localhost:3000/api/student/attendance/report?year=2024&month=1" \
  -H "Authorization: Bearer <student_jwt_token>" \
  -H "Content-Type: application/json"

# Get attendance for date range
curl -X GET "http://localhost:3000/api/student/attendance/report?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <student_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Get My Profile
```bash
curl -X GET "http://localhost:3000/api/student/attendance/profile" \
  -H "Authorization: Bearer <student_jwt_token>" \
  -H "Content-Type: application/json"
```

## Notes

1. **Attendance Status**: Valid statuses are `present`, `absent`, `late`, and `excused`
2. **Time Slot**: Must include `startTime` and `endTime` in HH:MM format
3. **Duration**: Automatically calculated in minutes from start and end times
4. **Unique Constraint**: Only one attendance record per student per batch per date per time slot
5. **Soft Delete**: Attendance records are soft deleted (marked as inactive) rather than permanently removed
6. **Student Enrollment**: Students must be enrolled in the batch to have attendance marked
7. **Date Handling**: All dates are handled in ISO format with timezone support
8. **Pagination**: All list endpoints support pagination with configurable page size
9. **Filtering**: Multiple filter options are available for each endpoint
10. **Statistics**: Comprehensive statistics are available for both admin and student views
11. **Authorization**: Admin endpoints require admin role, student endpoints require student role
12. **Performance**: Queries are optimized with database indexes for better performance

## Attendance Status Definitions

- **Present**: Student attended the class on time
- **Absent**: Student did not attend the class
- **Late**: Student attended but arrived after the start time
- **Excused**: Student was excused from the class (with valid reason)

## Time Slot Management

Time slots are defined with:
- **Start Time**: When the class begins (HH:MM format)
- **End Time**: When the class ends (HH:MM format)
- **Duration**: Automatically calculated in minutes

## Statistics Calculations

- **Total Classes**: Sum of all attendance records
- **Present Classes**: Count of `present` and `late` status records
- **Attendance Percentage**: (Present Classes / Total Classes) × 100
- **Late Percentage**: (Late Classes / Total Classes) × 100
- **Absent Percentage**: (Absent Classes / Total Classes) × 100
