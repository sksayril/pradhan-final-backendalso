# Student Certificate Data API

## Overview
This API provides comprehensive certificate data retrieval for students, including all related information such as student details, course information, batch details, marksheet data, and certificate information.

## API Endpoints

### Get Student Certificate Data by Student ID

**Endpoint:** `GET /api/admin/student-documents/students/:studentId/certificate-data`

**Description:** Retrieves complete certificate data for a specific student, including all related information like student details, course, batch, marksheet, and certificate information.

**Authentication:** Required (Admin only)

**Parameters:**
- `studentId` (path): The ID of the student
- `page` (query, optional): Page number for pagination (default: 1)
- `limit` (query, optional): Number of items per page (default: 10)
- `certificateType` (query, optional): Filter by certificate type
- `academicYear` (query, optional): Filter by academic year
- `status` (query, optional): Filter by certificate status
- `includeDetails` (query, optional): Include detailed information (default: false)

**Request Example:**
```bash
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificate-data?page=1&limit=10&includeDetails=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Student certificate data retrieved successfully",
  "data": {
    "student": {
      "_id": "68c69e0590e15d67e268ad65",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "studentId": "STU2024001",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "year": "2024"
    },
    "certificates": [
      {
        "certificateNumber": "CERT2509001",
        "certificateType": "Completion",
        "certificateTitle": "Web Development Course Completion",
        "academicYear": "2024-25",
        "grade": "A+",
        "percentage": 90.0,
        "cgpa": 9.0,
        "status": "issued",
        "isVerified": true,
        "verificationCode": "CERTABC123",
        "certificateIssueDate": "2025-01-15T00:00:00.000Z",
        
        "course": {
          "_id": "68c6a9cd84024c4f720e861a",
          "title": "Web Development",
          "category": "Programming",
          "instructor": "Jane Smith",
          "duration": "12 weeks"
        },
        
        "batch": {
          "_id": "68c6ffdc233574e85b0ea1dc",
          "name": "Web Dev Batch 2024-01",
          "startDate": "2024-02-01T00:00:00.000Z",
          "endDate": "2024-04-30T00:00:00.000Z",
          "maxStudents": 30
        },
        
        "marksheet": {
          "marksheetNumber": "MS25090001",
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
        },
        "verifiedBy": {
          "_id": "admin_object_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T11:00:00.000Z"
      }
    ],
    "statistics": {
      "totalCertificates": 3,
      "verifiedCertificates": 2,
      "issuedCertificates": 2,
      "deliveredCertificates": 1,
      "averageGrade": 85.0,
      "averagePercentage": 85.0
    },
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

**Detailed Information (when includeDetails=true):**
```json
{
  "certificates": [
    {
      // ... basic certificate information ...
      "description": "Successfully completed the course with excellent performance",
      "achievements": [
        {
          "title": "Top Performer",
          "description": "Achieved highest marks in the batch",
          "date": "2024-12-20T00:00:00.000Z"
        }
      ],
      "certificateUrl": "https://storage.example.com/certificates/cert2509001.pdf",
      "deliveryAddress": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India"
      },
      "trackingNumber": "TRK123456789",
      "deliveryStatus": "Delivered",
      "deliveryMethod": "Physical",
      "printHistory": [
        {
          "printedAt": "2025-01-15T10:30:00.000Z",
          "printedBy": "admin_object_id",
          "printReason": "Official copy"
        }
      ],
      "downloadHistory": [
        {
          "downloadedAt": "2025-01-15T11:00:00.000Z",
          "downloadedBy": "student_object_id",
          "ipAddress": "192.168.1.100"
        }
      ]
    }
  ]
}
```

## Enhanced Student-Side APIs

### Get My Certificates (Enhanced)

**Endpoint:** `GET /api/student/documents/certificates`

**Description:** Enhanced to include marksheet information for logged-in students.

**Response includes:**
- Certificate details
- Course information
- Batch information
- **Marksheet information** (new)
  - Marksheet number
  - Academic year
  - Semester
  - Examination type
  - Percentage
  - CGPA
  - Overall grade
  - Result

### Get Certificate Details (Enhanced)

**Endpoint:** `GET /api/student/documents/certificates/:certificateId`

**Description:** Enhanced to include marksheet information for specific certificate.

**Response includes:**
- Complete certificate information
- Course details
- Batch details
- **Marksheet details** (new)
- Download tracking

## Enhanced Admin APIs

### Get Certificates by Student (Enhanced)

**Endpoint:** `GET /api/admin/student-documents/students/:studentId/certificates`

**Description:** Enhanced to include marksheet information and comprehensive filtering.

**New Features:**
- Marksheet information included
- Advanced filtering options
- Student-specific statistics
- Detailed information flag

## Key Features

### 1. Complete Data Integration
- **Student Information:** Name, ID, email, department, year
- **Course Information:** Title, category, instructor, duration
- **Batch Information:** Name, dates, capacity
- **Marksheet Information:** Number, grades, results
- **Certificate Information:** Number, type, status, verification

### 2. Advanced Filtering
- Filter by certificate type
- Filter by academic year
- Filter by status
- Filter by delivery status
- Pagination support

### 3. Statistics and Analytics
- Total certificates count
- Verified certificates count
- Issued certificates count
- Delivered certificates count
- Average grades and percentages

### 4. Detailed Information Option
- Optional detailed information flag
- Additional fields when requested
- Print and download history
- Delivery tracking information

## Usage Examples

### Basic Certificate Data Retrieval
```bash
# Get basic certificate data for a student
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificate-data" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Filtered Certificate Data
```bash
# Get certificates filtered by type and academic year
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificate-data?certificateType=Completion&academicYear=2024-25" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Detailed Certificate Data
```bash
# Get detailed certificate data with all information
curl -X GET "http://localhost:3500/api/admin/student-documents/students/68c69e0590e15d67e268ad65/certificate-data?includeDetails=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Student-Side Certificate Access
```bash
# Get my certificates (student login required)
curl -X GET "http://localhost:3500/api/student/documents/certificates" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

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
  "message": "Unauthorized access"
}
```

### Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching student certificate data"
}
```

## Benefits

1. **Complete Information:** All related data in single API call
2. **Efficient Queries:** Optimized database queries with proper indexing
3. **Flexible Filtering:** Multiple filter options for different use cases
4. **Pagination Support:** Handle large datasets efficiently
5. **Statistics:** Built-in analytics for student performance
6. **Audit Trail:** Complete tracking of certificate lifecycle
7. **Enhanced Student Experience:** Students can see their marksheet data with certificates

## Database Schema Updates

### Certificate Model Enhancements
- Added `marksheetId` reference to link certificates with marksheets
- Added index for `marksheetId` for better query performance
- Enhanced population queries to include marksheet data

### API Response Structure
- Standardized response format across all certificate APIs
- Consistent data structure for student, course, batch, and marksheet information
- Optional detailed information flag for comprehensive data retrieval
