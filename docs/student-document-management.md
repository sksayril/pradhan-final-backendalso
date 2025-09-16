# Student Document Management System API

This document describes the comprehensive student document management system including marksheet generation, certificate management, and student access to their documents.

## Overview

The student document management system provides:
- **Marksheet Management**: Create, manage, and verify student marksheets with auto-generated marksheet numbers
- **Certificate Management**: Create, issue, and track student certificates with auto-generated certificate numbers
- **Student Access**: Students can view and download their marksheets and certificates
- **Public Verification**: Public verification system for marksheets and certificates using verification codes
- **Admin Control**: Complete admin control over document creation, verification, and management
- **Statistics & Reports**: Comprehensive reporting on document generation and verification

## API Endpoints

### Base URLs
```
Admin: /api/admin/student-documents
Student: /api/student/documents
Public: /api/student/documents/public
```

### Authentication
- Admin endpoints require admin authentication with Bearer token
- Student endpoints require student authentication with Bearer token
- Public verification endpoints require no authentication

---

## 1. Admin Marksheet Management

### Create Marksheet
```http
POST /api/admin/student-documents/marksheets
```

**Request Body:**
```json
{
  "studentId": "student_object_id",
  "courseId": "course_object_id",
  "batchId": "batch_object_id",
  "academicYear": "2024-25",
  "semester": "1st",
  "examinationType": "Regular",
  "subjects": [
    {
      "subjectName": "Mathematics",
      "subjectCode": "MATH101",
      "credits": 4,c
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "gradePoints": 8.5
    }
  ],
  "examinationDate": "2024-12-15T00:00:00.000Z",
  "resultDate": "2024-12-20T00:00:00.000Z",
  "remarks": "Excellent performance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Marksheet created successfully",
  "data": {
    "marksheet": {
      "marksheetNumber": "MS2412001",
      "studentId": "student_object_id",
      "studentInfo": {
        "studentId": "STU123456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "department": "Computer Science",
        "year": "1st"
      },
      "courseId": "course_object_id",
      "courseInfo": {
        "courseId": "COURSE001",
        "title": "Bachelor of Technology",
        "category": "Engineering",
        "instructor": "Dr. Smith",
        "duration": "4 years"
      },
      "batchId": "batch_object_id",
      "batchInfo": {
        "batchId": "BATCH001",
        "name": "BTech 2024 Batch A",
        "startDate": "2024-08-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z"
      },
      "academicYear": "2024-25",
      "semester": "1st",
      "examinationType": "Regular",
      "totalMarks": 85,
      "maxTotalMarks": 100,
      "percentage": 85.0,
      "cgpa": 8.5,
      "overallGrade": "A",
      "result": "PASS",
      "status": "draft",
      "isVerified": false,
      "verificationCode": "VERIFYABC123"
    },
    "student": {
      "studentId": "STU123456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "1st"
    },
    "course": {
      "courseId": "COURSE001",
      "title": "Bachelor of Technology",
      "category": "Engineering",
      "instructor": "Dr. Smith",
      "duration": "4 years"
    },
    "batch": {
      "batchId": "BATCH001",
      "name": "BTech 2024 Batch A",
      "startDate": "2024-08-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z"
    }
  }
}
```

### Get All Marksheets
```http
GET /api/admin/student-documents/marksheets
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester
- `examinationType` (optional): Filter by examination type
- `result` (optional): Filter by result (PASS, FAIL)
- `status` (optional): Filter by status (draft, published, archived)
- `search` (optional): Search by student name, email, or student ID

**Response:**
```json
{
  "success": true,
  "message": "Marksheets retrieved successfully",
  "data": {
    "marksheets": [
      {
        "marksheetNumber": "MS2412001",
        "studentId": "student_object_id",
        "courseId": "course_object_id",
        "batchId": "batch_object_id",
        "academicYear": "2024-25",
        "semester": "1st",
        "examinationType": "Regular",
        "totalMarks": 85,
        "maxTotalMarks": 100,
        "percentage": 85.0,
        "cgpa": 8.5,
        "overallGrade": "A",
        "result": "PASS",
        "status": "published",
        "isVerified": true,
        "verificationCode": "VERIFYABC123",
        "student": {
          "firstName": "John",
          "lastName": "Doe",
          "studentId": "STU123456"
        },
        "course": {
          "title": "Bachelor of Technology"
        },
        "batch": {
          "name": "BTech 2024 Batch A"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMarksheets": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Marksheet by ID
```http
GET /api/admin/student-documents/marksheets/:marksheetId
```

**Response:**
```json
{
  "success": true,
  "message": "Marksheet retrieved successfully",
  "data": {
    "marksheet": {
      "marksheetNumber": "MS2412001",
      "student": {
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123456",
        "email": "john.doe@example.com",
        "department": "Computer Science",
        "year": "1st"
      },
      "course": {
        "title": "Bachelor of Technology",
        "category": "Engineering",
        "instructor": {
          "name": "Dr. Smith"
        }
      },
      "batch": {
        "name": "BTech 2024 Batch A",
        "startDate": "2024-08-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z"
      },
      "academicYear": "2024-25",
      "semester": "1st",
      "examinationType": "Regular",
      "subjects": [
        {
          "subjectName": "Mathematics",
          "subjectCode": "MATH101",
          "credits": 4,
          "marksObtained": 85,
          "maxMarks": 100,
          "grade": "A",
          "gradePoints": 8.5
        }
      ],
      "totalMarks": 85,
      "maxTotalMarks": 100,
      "percentage": 85.0,
      "cgpa": 8.5,
      "overallGrade": "A",
      "result": "PASS",
      "examinationDate": "2024-12-15T00:00:00.000Z",
      "resultDate": "2024-12-20T00:00:00.000Z",
      "status": "published",
      "isVerified": true,
      "verificationCode": "VERIFYABC123",
      "printHistory": [],
      "downloadHistory": []
    }
  }
}
```

### Update Marksheet
```http
PUT /api/admin/student-documents/marksheets/:marksheetId
```

**Request Body:**
```json
{
  "subjects": [
    {
      "subjectName": "Mathematics",
      "subjectCode": "MATH101",
      "credits": 4,
      "marksObtained": 90,
      "maxMarks": 100,
      "grade": "A+",
      "gradePoints": 9.0
    }
  ],
  "remarks": "Updated marks after revaluation"
}
```

### Verify Marksheet
```http
PATCH /api/admin/student-documents/marksheets/:marksheetId/verify
```

**Response:**
```json
{
  "success": true,
  "message": "Marksheet verified successfully",
  "data": {
    "marksheet": {
      "marksheetNumber": "MS2412001",
      "student": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "isVerified": true,
      "verifiedBy": "admin_object_id",
      "verifiedAt": "2024-12-21T10:00:00.000Z",
      "status": "published",
      "verificationCode": "VERIFYABC123"
    }
  }
}
```

### Get Marksheets by Student
```http
GET /api/admin/student-documents/students/:studentId/marksheets
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

## 2. Admin Certificate Management

### Generate Certificate from Marksheet
```http
POST /api/admin/student-documents/certificates/generate-from-marksheet/:marksheetNumber
```

**Description:** Automatically generate a certificate based on a passed marksheet. This API extracts all necessary information from the marksheet and creates a certificate for students who have passed.

**Request Body (Optional):**
```json
{
  "certificateType": "Completion",
  "certificateTitle": "Custom Certificate Title",
  "description": "Custom description for the certificate",
  "achievements": [
    {
      "title": "Top Performer",
      "description": "Achieved highest marks in the batch",
      "date": "2024-12-20T00:00:00.000Z"
    }
  ],
  "deliveryMethod": "Digital",
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully from marksheet",
  "data": {
    "certificate": {
      "certificateNumber": "CERT2412001",
      "certificateType": "Completion",
      "certificateTitle": "Completion Certificate - Web Development",
      "academicYear": "2024-25",
      "grade": "A+",
      "percentage": 90.0,
      "cgpa": 9.0,
      "status": "draft",
      "isVerified": false,
      "verificationCode": "CERTABC123",
      "deliveryStatus": "Pending"
    },
    "student": {
      "_id": "student_object_id",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "studentId": "STU2024001",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "2024"
    },
    "course": {
      "_id": "course_object_id",
      "title": "Web Development",
      "category": "Programming",
      "instructor": "Jane Smith",
      "duration": "12 weeks"
    },
    "batch": {
      "_id": "batch_object_id",
      "name": "Web Dev Batch 2024-01",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-04-30T00:00:00.000Z"
    },
    "marksheet": {
      "marksheetNumber": "MS2411001",
      "academicYear": "2024-25",
      "semester": "3rd",
      "examinationType": "Regular",
      "percentage": 90.0,
      "cgpa": 9.0,
      "overallGrade": "A+",
      "result": "PASS"
    },
    "createdBy": {
      "_id": "admin_object_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    }
  }
}
```

### Create Certificate
```http
POST /api/admin/student-documents/certificates
```

**Note:** The `certificateUrl` field is no longer required as certificates are generated automatically.

**Request Body:**
```json
{
  "studentId": "student_object_id",
  "courseId": "course_object_id",
  "batchId": "batch_object_id",
  "certificateType": "Completion",
  "certificateTitle": "Certificate of Course Completion",
  "academicYear": "2024-25",
  "duration": "6 months",
  "grade": "A",
  "percentage": 85.0,
  "cgpa": 8.5,
  "courseStartDate": "2024-08-01T00:00:00.000Z",
  "courseEndDate": "2024-12-31T00:00:00.000Z",
  "certificateIssueDate": "2025-01-15T00:00:00.000Z",
  "description": "Successfully completed the course with excellent performance",
  "achievements": [
    {
      "title": "Top Performer",
      "description": "Achieved highest marks in the batch",
      "date": "2024-12-20T00:00:00.000Z"
    }
  ],
  "deliveryMethod": "Digital",
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "data": {
    "certificate": {
      "certificateNumber": "CERT2412001",
      "studentId": "student_object_id",
      "courseId": "course_object_id",
      "batchId": "batch_object_id",
      "certificateType": "Completion",
      "certificateTitle": "Certificate of Course Completion",
      "academicYear": "2024-25",
      "grade": "A",
      "percentage": 85.0,
      "cgpa": 8.5,
      "status": "draft",
      "isVerified": false,
      "verificationCode": "CERTABC123",
      "deliveryStatus": "Pending"
    },
    "student": {
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123456"
    },
    "course": {
      "title": "Bachelor of Technology"
    },
    "batch": {
      "name": "BTech 2024 Batch A"
    }
  }
}
```

### Get All Certificates
```http
GET /api/admin/student-documents/certificates
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `certificateType` (optional): Filter by certificate type
- `academicYear` (optional): Filter by academic year
- `status` (optional): Filter by status (draft, issued, delivered)
- `deliveryStatus` (optional): Filter by delivery status
- `search` (optional): Search by student name, email, or student ID

### Get Certificate by ID
```http
GET /api/admin/student-documents/certificates/:certificateId
```

### Update Certificate
```http
PUT /api/admin/student-documents/certificates/:certificateId
```

### Verify Certificate
```http
PATCH /api/admin/student-documents/certificates/:certificateId/verify
```

### Issue Certificate
```http
PATCH /api/admin/student-documents/certificates/:certificateId/issue
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificate": {
      "certificateNumber": "CERT2412001",
      "student": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "status": "issued",
      "lastModifiedBy": "admin_object_id",
      "certificateIssueDate": "2025-01-15T00:00:00.000Z"
    }
  }
}
```

### Get Certificates by Student
```http
GET /api/admin/student-documents/students/:studentId/certificates
```

---

## 3. Student Document Access

### Get My Marksheets
```http
GET /api/student/documents/marksheets
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `academicYear` (optional): Filter by academic year
- `semester` (optional): Filter by semester
- `examinationType` (optional): Filter by examination type
- `result` (optional): Filter by result (PASS, FAIL)

**Response:**
```json
{
  "success": true,
  "message": "Marksheets retrieved successfully",
  "data": {
    "marksheets": [
      {
        "marksheetNumber": "MS2412001",
        "studentId": "student_object_id",
        "courseId": "course_object_id",
        "batchId": "batch_object_id",
        "academicYear": "2024-25",
        "semester": "1st",
        "examinationType": "Regular",
        "totalMarks": 85,
        "maxTotalMarks": 100,
        "percentage": 85.0,
        "cgpa": 8.5,
        "overallGrade": "A",
        "result": "PASS",
        "status": "published",
        "isVerified": true,
        "verificationCode": "VERIFYABC123",
        "course": {
          "title": "Bachelor of Technology",
          "category": "Engineering"
        },
        "batch": {
          "name": "BTech 2024 Batch A",
          "startDate": "2024-08-01T00:00:00.000Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMarksheets": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Marksheet Details
```http
GET /api/student/documents/marksheets/:marksheetId
```

**Response:**
```json
{
  "success": true,
  "message": "Marksheet details retrieved successfully",
  "data": {
    "marksheet": {
      "marksheetNumber": "MS2412001",
      "course": {
        "title": "Bachelor of Technology",
        "category": "Engineering",
        "instructor": {
          "name": "Dr. Smith"
        }
      },
      "batch": {
        "name": "BTech 2024 Batch A",
        "startDate": "2024-08-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z"
      },
      "academicYear": "2024-25",
      "semester": "1st",
      "examinationType": "Regular",
      "subjects": [
        {
          "subjectName": "Mathematics",
          "subjectCode": "MATH101",
          "credits": 4,
          "marksObtained": 85,
          "maxMarks": 100,
          "grade": "A",
          "gradePoints": 8.5
        }
      ],
      "totalMarks": 85,
      "maxTotalMarks": 100,
      "percentage": 85.0,
      "cgpa": 8.5,
      "overallGrade": "A",
      "result": "PASS",
      "examinationDate": "2024-12-15T00:00:00.000Z",
      "resultDate": "2024-12-20T00:00:00.000Z",
      "status": "published",
      "isVerified": true,
      "verificationCode": "VERIFYABC123"
    }
  }
}
```

### Get My Certificates
```http
GET /api/student/documents/certificates
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `certificateType` (optional): Filter by certificate type
- `academicYear` (optional): Filter by academic year
- `status` (optional): Filter by status

### Get Certificate Details
```http
GET /api/student/documents/certificates/:certificateId
```

### Get My Document Summary
```http
GET /api/student/documents/summary
```

**Response:**
```json
{
  "success": true,
  "message": "Document summary retrieved successfully",
  "data": {
    "student": {
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU123456",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "1st"
    },
    "statistics": {
      "marksheets": {
        "totalMarksheets": 3,
        "verifiedMarksheets": 3,
        "averagePercentage": 82.5,
        "averageCGPA": 8.2,
        "passCount": 3,
        "failCount": 0
      },
      "certificates": {
        "totalCertificates": 2,
        "verifiedCertificates": 2,
        "issuedCertificates": 2,
        "deliveredCertificates": 1
      }
    },
    "recent": {
      "marksheets": [
        {
          "marksheetNumber": "MS2412001",
          "academicYear": "2024-25",
          "semester": "1st",
          "percentage": 85.0,
          "cgpa": 8.5,
          "result": "PASS",
          "status": "published",
          "isVerified": true
        }
      ],
      "certificates": [
        {
          "certificateNumber": "CERT2412001",
          "certificateType": "Completion",
          "certificateTitle": "Certificate of Course Completion",
          "academicYear": "2024-25",
          "grade": "A",
          "status": "issued",
          "isVerified": true
        }
      ]
    }
  }
}
```

---

## 4. Public Verification

### Verify Marksheet (Public)
```http
GET /api/student/documents/public/verify/marksheet/:verificationCode
```

**Response:**
```json
{
  "success": true,
  "message": "Marksheet verification successful",
  "data": {
    "verification": {
      "isValid": true,
      "isVerified": true,
      "verificationCode": "VERIFYABC123"
    },
    "marksheet": {
      "marksheetNumber": "MS2412001",
      "student": {
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123456",
        "department": "Computer Science",
        "year": "1st"
      },
      "course": {
        "title": "Bachelor of Technology",
        "category": "Engineering"
      },
      "batch": {
        "name": "BTech 2024 Batch A"
      },
      "academicYear": "2024-25",
      "semester": "1st",
      "examinationType": "Regular",
      "totalMarks": 85,
      "maxTotalMarks": 100,
      "percentage": 85.0,
      "cgpa": 8.5,
      "overallGrade": "A",
      "result": "PASS",
      "examinationDate": "2024-12-15T00:00:00.000Z",
      "resultDate": "2024-12-20T00:00:00.000Z"
    }
  }
}
```

### Verify Certificate (Public)
```http
GET /api/student/documents/public/verify/certificate/:verificationCode
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate verification successful",
  "data": {
    "verification": {
      "isValid": true,
      "isVerified": true,
      "verificationCode": "CERTABC123"
    },
    "certificate": {
      "certificateNumber": "CERT2412001",
      "student": {
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "STU123456",
        "department": "Computer Science",
        "year": "1st"
      },
      "course": {
        "title": "Bachelor of Technology",
        "category": "Engineering"
      },
      "batch": {
        "name": "BTech 2024 Batch A"
      },
      "certificateType": "Completion",
      "certificateTitle": "Certificate of Course Completion",
      "academicYear": "2024-25",
      "grade": "A",
      "percentage": 85.0,
      "cgpa": 8.5,
      "courseStartDate": "2024-08-01T00:00:00.000Z",
      "courseEndDate": "2024-12-31T00:00:00.000Z",
      "certificateIssueDate": "2025-01-15T00:00:00.000Z"
    }
  }
}
```

---

## 5. Statistics and Reports

### Get Document Statistics
```http
GET /api/admin/student-documents/statistics
```

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year) - default: month
- `academicYear` (optional): Filter by academic year

**Response:**
```json
{
  "success": true,
  "message": "Document statistics retrieved successfully",
  "data": {
    "period": "month",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "marksheets": {
      "totalMarksheets": 150,
      "verifiedMarksheets": 145,
      "publishedMarksheets": 145,
      "averagePercentage": 78.5,
      "averageCGPA": 7.8
    },
    "certificates": {
      "totalCertificates": 75,
      "verifiedCertificates": 70,
      "issuedCertificates": 70,
      "deliveredCertificates": 65
    },
    "breakdown": {
      "marksheetResults": [
        {
          "_id": "PASS",
          "count": 140
        },
        {
          "_id": "FAIL",
          "count": 10
        }
      ],
      "certificateTypes": [
        {
          "_id": "Completion",
          "count": 50
        },
        {
          "_id": "Participation",
          "count": 15
        },
        {
          "_id": "Achievement",
          "count": 10
        }
      ]
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Business Logic

### Marksheet Generation Process
1. **Admin Creates Marksheet**: Admin creates marksheet with student, course, batch, and subject details
2. **Auto-Generated Numbers**: System automatically generates unique marksheet number (MS + YY + MM + 4-digit sequence)
3. **Automatic Calculations**: System calculates total marks, percentage, CGPA, and overall grade
4. **Verification**: Admin verifies marksheet before publishing
5. **Student Access**: Students can view and download their verified marksheets

### Certificate Generation Process
1. **Admin Creates Certificate**: Admin creates certificate with student, course, and achievement details
2. **Auto-Generated Numbers**: System automatically generates unique certificate number (CERT + YY + MM + 4-digit sequence)
3. **Verification**: Admin verifies certificate before issuing
4. **Issuance**: Admin issues certificate to student
5. **Delivery Tracking**: System tracks delivery status for physical certificates
6. **Student Access**: Students can view and download their certificates

### Automatic Calculations
- **Marksheet Totals**: Automatically calculated from subject marks
- **Percentage**: (Total Marks / Max Total Marks) × 100
- **CGPA**: Weighted average of grade points based on credits
- **Overall Grade**: Based on percentage ranges (A+: 90+, A: 80+, etc.)
- **Result**: PASS/FAIL based on individual subject grades and overall percentage

### Verification System
- **Unique Verification Codes**: Each document gets a unique verification code
- **Public Verification**: Anyone can verify document authenticity using verification code
- **Download Tracking**: System tracks who downloads documents and when
- **Print Tracking**: System tracks document printing for audit purposes

---

## Security Features

- **Admin Authentication**: All admin endpoints require valid admin JWT token
- **Student Authentication**: Student endpoints require valid student JWT token
- **Public Verification**: Public verification endpoints require no authentication
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API endpoints have rate limiting protection
- **Audit Trail**: All actions are logged with user ID and timestamp
- **Data Encryption**: Sensitive data is encrypted in transit and at rest

---

## Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Frequently accessed data is cached
- **Optimized Queries**: Efficient database queries with proper joins
- **Response Compression**: API responses are compressed for better performance
- **File Storage**: Documents stored in cloud storage for fast access

---

## Document Types and Formats

### Marksheet Features
- **Subject-wise Marks**: Detailed breakdown of marks for each subject
- **Grade Calculation**: Automatic grade calculation based on marks
- **CGPA Calculation**: Credit-weighted grade point average
- **Result Determination**: Automatic pass/fail determination
- **Verification Code**: Unique code for document verification

### Certificate Features
- **Multiple Types**: Completion, Participation, Achievement, Excellence, Merit, Distinction, Honor
- **Achievement Tracking**: Track specific achievements and accomplishments
- **Delivery Management**: Support for both digital and physical delivery
- **QR Code Integration**: QR codes for quick verification
- **Digital Signatures**: Support for digital signatures on certificates

---

## Integration Points

### Course and Batch Integration
- **Course Information**: Automatically populated from course database
- **Batch Information**: Automatically populated from batch database
- **Student Information**: Automatically populated from student database
- **Instructor Details**: Course instructor information included

### File Storage Integration
- **Cloud Storage**: Documents stored in cloud storage (AWS S3, Google Cloud, etc.)
- **CDN Integration**: Fast document delivery via CDN
- **Backup Systems**: Automatic backup of all documents
- **Version Control**: Track document versions and updates

### Notification System
- **Email Notifications**: Notify students when documents are ready
- **SMS Notifications**: SMS alerts for important updates
- **Push Notifications**: Mobile app notifications
- **Status Updates**: Real-time status updates for document processing

This comprehensive system provides complete document management capabilities for educational institutions with robust security, verification, and tracking features.
