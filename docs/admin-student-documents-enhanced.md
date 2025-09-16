# Enhanced Admin Student Document Management APIs

This document provides comprehensive documentation for the enhanced admin-side APIs to retrieve student marksheets and certificates by student ID.

## Overview

The enhanced admin APIs provide comprehensive access to student document data with advanced filtering, statistics, and detailed information retrieval capabilities.

## API Endpoints

### 1. Get Student Marksheets (Enhanced)

**Endpoint:** `GET /api/admin/student-documents/students/:studentId/marksheets`

**Description:** Retrieve all marksheets for a specific student with comprehensive filtering, statistics, and detailed data options.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number for pagination (default: 1) | `?page=1` |
| `limit` | Number | Items per page (default: 10) | `?limit=10` |
| `academicYear` | String | Filter by academic year | `?academicYear=2024-25` |
| `semester` | String | Filter by semester | `?semester=3rd` |
| `examinationType` | String | Filter by examination type | `?examinationType=Regular` |
| `result` | String | Filter by result (PASS/FAIL) | `?result=PASS` |
| `status` | String | Filter by status | `?status=published` |
| `includeDetails` | Boolean | Include detailed marksheet data (default: false) | `?includeDetails=true` |

#### Response Structure

```json
{
  "success": true,
  "message": "Student marksheets retrieved successfully",
  "data": {
    "student": {
      "_id": "student_object_id",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "studentId": "STU2024001",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "2024",
      "phoneNumber": "+1234567890",
      "address": "123 Main St, City, State"
    },
    "statistics": {
      "totalMarksheets": 5,
      "verifiedMarksheets": 4,
      "publishedMarksheets": 3,
      "averagePercentage": 85.5,
      "averageCGPA": 8.2,
      "passCount": 4,
      "failCount": 1
    },
    "marksheets": [
      {
        "marksheetNumber": "MS2411001",
        "academicYear": "2024-25",
        "semester": "3rd",
        "examinationType": "Regular",
        "totalMarks": 90,
        "maxTotalMarks": 100,
        "percentage": 90.0,
        "cgpa": 9.0,
        "overallGrade": "A+",
        "result": "PASS",
        "examinationDate": "2025-09-09T00:00:00.000Z",
        "resultDate": "2025-09-16T00:00:00.000Z",
        "status": "published",
        "isVerified": true,
        "verificationCode": "VERIFYABC123",
        "course": {
          "courseId": "course_object_id",
          "title": "Web Development",
          "category": "Programming",
          "instructor": "Jane Smith",
          "duration": "12 weeks"
        },
        "batch": {
          "batchId": "batch_object_id",
          "name": "Web Dev Batch 2024-01",
          "startDate": "2024-02-01T00:00:00.000Z",
          "endDate": "2024-04-30T00:00:00.000Z",
          "maxStudents": 30
        },
        "createdBy": {
          "_id": "admin_object_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "verifiedBy": {
          "_id": "admin_object_id",
          "firstName": "Verifier",
          "lastName": "Admin",
          "email": "verifier@example.com"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "subjects": [
          {
            "subjectName": "sgsga",
            "subjectCode": "1001",
            "credits": 10,
            "marksObtained": 90,
            "maxMarks": 100,
            "grade": "A+",
            "gradePoints": 10
          }
        ],
        "remarks": "Excellent performance",
        "printHistory": [],
        "downloadHistory": [],
        "digitalSignature": "signature_data"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMarksheets": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Student Certificates (Enhanced)

**Endpoint:** `GET /api/admin/student-documents/students/:studentId/certificates`

**Description:** Retrieve all certificates for a specific student with comprehensive filtering, statistics, and detailed data options.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number for pagination (default: 1) | `?page=1` |
| `limit` | Number | Items per page (default: 10) | `?limit=10` |
| `certificateType` | String | Filter by certificate type | `?certificateType=Completion` |
| `academicYear` | String | Filter by academic year | `?academicYear=2024-25` |
| `status` | String | Filter by status | `?status=issued` |
| `deliveryStatus` | String | Filter by delivery status | `?deliveryStatus=Delivered` |
| `includeDetails` | Boolean | Include detailed certificate data (default: false) | `?includeDetails=true` |

#### Response Structure

```json
{
  "success": true,
  "message": "Student certificates retrieved successfully",
  "data": {
    "student": {
      "_id": "student_object_id",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "studentId": "STU2024001",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "2024",
      "phoneNumber": "+1234567890",
      "address": "123 Main St, City, State"
    },
    "statistics": {
      "totalCertificates": 3,
      "verifiedCertificates": 3,
      "issuedCertificates": 2,
      "deliveredCertificates": 1,
      "averageGrade": 8.5,
      "averagePercentage": 85.0
    },
    "certificates": [
      {
        "certificateNumber": "CERT2411001",
        "certificateType": "Completion",
        "certificateTitle": "Web Development Course Completion",
        "academicYear": "2024-25",
        "duration": "12 weeks",
        "grade": "A+",
        "percentage": 90.0,
        "cgpa": 9.0,
        "courseStartDate": "2024-02-01T00:00:00.000Z",
        "courseEndDate": "2024-04-30T00:00:00.000Z",
        "certificateIssueDate": "2024-05-01T00:00:00.000Z",
        "status": "issued",
        "isVerified": true,
        "verificationCode": "CERTVERIFY123",
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
          "endDate": "2024-04-30T00:00:00.000Z",
          "maxStudents": 30
        },
        "createdBy": {
          "_id": "admin_object_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "verifiedBy": {
          "_id": "admin_object_id",
          "firstName": "Verifier",
          "lastName": "Admin",
          "email": "verifier@example.com"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "description": "Certificate for completing the Web Development course",
        "achievements": ["Completed all modules", "Passed final exam"],
        "certificateUrl": "https://storage.example.com/certificates/cert2411001.pdf",
        "deliveryAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "trackingNumber": "TRK123456789",
        "printHistory": [],
        "downloadHistory": [],
        "digitalSignature": "signature_data"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCertificates": 3,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Usage Examples

### 1. Basic Marksheet Retrieval

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/marksheets" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Filtered Marksheet Retrieval

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/marksheets?academicYear=2024-25&semester=3rd&result=PASS&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Detailed Marksheet Data

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/marksheets?includeDetails=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Basic Certificate Retrieval

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificates" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Filtered Certificate Retrieval

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificates?certificateType=Completion&status=issued&deliveryStatus=Delivered" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Detailed Certificate Data

```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificates?includeDetails=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Key Features

### 1. Comprehensive Student Information
- Complete student profile data
- Contact information and academic details
- Full name concatenation for easy display

### 2. Advanced Filtering
- Filter by academic year, semester, examination type
- Filter by result status (PASS/FAIL)
- Filter by document status and verification status
- Filter by certificate type and delivery status

### 3. Detailed Statistics
- Total document counts
- Verification and publication statistics
- Academic performance averages
- Pass/fail ratios

### 4. Flexible Data Retrieval
- Basic summary data by default
- Detailed data with `includeDetails=true`
- Subject-wise marks and grades
- Admin tracking information

### 5. Admin Tracking
- Created by information
- Verified by information
- Last modified by information
- Creation and update timestamps

### 6. Pagination Support
- Configurable page sizes
- Navigation information
- Total count and page indicators

## Error Responses

### Student Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

### Unauthorized Access
```json
{
  "success": false,
  "message": "Access denied. Admin authentication required."
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching student marksheets"
}
```

## Authentication

Both APIs require:
- Admin authentication with Bearer token
- Valid admin JWT token in Authorization header
- Admin role verification

## Performance Considerations

### Database Optimization
- Efficient queries with proper indexing
- Populated references to avoid N+1 queries
- Pagination to limit data transfer

### Response Size Control
- Configurable page sizes
- Optional detailed data inclusion
- Efficient data structure

## Use Cases

### 1. Student Academic History
- View complete academic record
- Track performance over time
- Monitor verification status

### 2. Administrative Reporting
- Generate student reports
- Track document verification
- Monitor academic performance

### 3. Document Management
- Verify document status
- Track creation and modification
- Monitor delivery status

### 4. Academic Analytics
- Calculate performance statistics
- Track pass/fail rates
- Monitor verification progress

This enhanced API provides comprehensive access to student document data with advanced filtering, statistics, and detailed information retrieval capabilities, making it ideal for administrative dashboards and student management systems.
