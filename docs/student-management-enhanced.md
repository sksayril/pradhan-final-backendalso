# Enhanced Student Management API

This document provides comprehensive documentation for the enhanced Student Management API that includes course and batch information for each student.

## Overview

The enhanced Student Management API now provides complete student information including their course enrollments and batch assignments. This allows administrators to view comprehensive student data in a single API call.

## API Endpoint

### GET /api/user-management/students

Retrieve all students with pagination, filtering, sorting, and complete course/batch information.

## Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number for pagination (default: 1) | `?page=1` |
| `limit` | Number | Number of items per page (default: 10) | `?limit=10` |
| `sortBy` | String | Field to sort by (default: 'createdAt') | `?sortBy=firstName` |
| `sortOrder` | String | Sort order: 'asc' or 'desc' (default: 'desc') | `?sortOrder=asc` |
| `search` | String | Search by name, email, or student ID | `?search=john` |
| `department` | String | Filter by department | `?department=Computer Science` |
| `year` | String | Filter by year | `?year=2024` |
| `kycStatus` | String | Filter by KYC status | `?kycStatus=approved` |
| `isActive` | Boolean | Filter by active status | `?isActive=true` |
| `isVerified` | Boolean | Filter by verification status | `?isVerified=true` |

## Response Structure

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "_id": "student_object_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "studentId": "STU2024001",
        "phoneNumber": "+1234567890",
        "dateOfBirth": "2000-01-15T00:00:00.000Z",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "department": "Computer Science",
        "year": "2024",
        "kycStatus": "approved",
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "enrollments": [
          {
            "enrollmentId": "enrollment_object_id",
            "enrollmentDate": "2024-01-20T09:00:00.000Z",
            "status": "enrolled",
            "paymentStatus": "paid",
            "progress": {
              "completedLessons": [],
              "overallProgress": 0,
              "lastAccessedAt": "2024-01-20T09:00:00.000Z"
            },
            "course": {
              "id": "course_object_id",
              "title": "Web Development Fundamentals",
              "category": "Programming",
              "type": "online",
              "instructor": {
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "phone": "+1234567891",
                "bio": "Experienced web developer"
              },
              "duration": 12,
              "durationUnit": "weeks",
              "price": 299,
              "currency": "USD"
            },
            "batch": {
              "id": "batch_object_id",
              "name": "Web Dev Batch 2024-01",
              "startDate": "2024-02-01T00:00:00.000Z",
              "endDate": "2024-04-30T00:00:00.000Z",
              "maxStudents": 30,
              "price": 299,
              "currency": "USD",
              "timeSlots": [
                {
                  "date": "2024-02-01T00:00:00.000Z",
                  "startTime": "10:00",
                  "endTime": "12:00",
                  "duration": 120,
                  "isActive": true
                }
              ]
            }
          }
        ],
        "enrollmentStats": {
          "totalEnrollments": 1,
          "activeEnrollments": 1,
          "completedEnrollments": 0,
          "totalCourses": 1,
          "totalBatches": 1
        }
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

## Response Fields

### Student Information
- `_id`: MongoDB ObjectId of the student
- `firstName`: Student's first name
- `lastName`: Student's last name
- `email`: Student's email address
- `studentId`: Auto-generated student ID
- `phoneNumber`: Student's phone number
- `dateOfBirth`: Student's date of birth
- `address`: Student's address object
- `department`: Student's department
- `year`: Student's academic year
- `kycStatus`: KYC verification status
- `isActive`: Whether the student account is active
- `isVerified`: Whether the student is verified
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Enrollment Information
Each student includes an `enrollments` array with the following structure:

#### Enrollment Details
- `enrollmentId`: MongoDB ObjectId of the enrollment
- `enrollmentDate`: Date when student enrolled
- `status`: Enrollment status (pending, approved, rejected, enrolled, active, completed, dropped, suspended)
- `paymentStatus`: Payment status (pending, paid, partial, refunded)
- `progress`: Progress tracking object

#### Course Information
- `course.id`: MongoDB ObjectId of the course
- `course.title`: Course title
- `course.category`: Course category
- `course.type`: Course type (online/offline)
- `course.instructor`: Instructor information object
- `course.duration`: Course duration
- `course.durationUnit`: Duration unit (weeks, months, etc.)
- `course.price`: Course price
- `course.currency`: Currency code

#### Batch Information
- `batch.id`: MongoDB ObjectId of the batch
- `batch.name`: Batch name
- `batch.startDate`: Batch start date
- `batch.endDate`: Batch end date
- `batch.maxStudents`: Maximum students allowed in batch
- `batch.price`: Batch price
- `batch.currency`: Currency code
- `batch.timeSlots`: Array of time slots for the batch

### Enrollment Statistics
Each student includes `enrollmentStats` with:
- `totalEnrollments`: Total number of enrollments
- `activeEnrollments`: Number of active enrollments
- `completedEnrollments`: Number of completed enrollments
- `totalCourses`: Number of unique courses enrolled
- `totalBatches`: Number of unique batches enrolled

## Usage Examples

### Basic Request
```bash
curl -X GET "http://localhost:3500/api/user-management/students?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Request with Sorting
```bash
curl -X GET "http://localhost:3500/api/user-management/students?page=1&limit=10&sortBy=firstName&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Request with Search
```bash
curl -X GET "http://localhost:3500/api/user-management/students?search=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Request with Filters
```bash
curl -X GET "http://localhost:3500/api/user-management/students?department=Computer Science&year=2024&kycStatus=approved&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Request with Multiple Filters
```bash
curl -X GET "http://localhost:3500/api/user-management/students?search=john&department=Computer Science&isActive=true&isVerified=true&page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Error Responses

### Unauthorized Access
```json
{
  "success": false,
  "message": "Access denied. Admin authentication required."
}
```

### Invalid Parameters
```json
{
  "success": false,
  "message": "Invalid page number. Must be a positive integer."
}
```

### Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve students",
  "error": "Internal server error"
}
```

## Key Features

### 1. Complete Student Data
- All basic student information
- Course enrollment details
- Batch assignment information
- Enrollment statistics

### 2. Flexible Filtering
- Search by name, email, or student ID
- Filter by department, year, KYC status
- Filter by active and verification status

### 3. Advanced Sorting
- Sort by any student field
- Ascending or descending order
- Default sorting by creation date

### 4. Pagination Support
- Configurable page size
- Page navigation information
- Total count and page indicators

### 5. Enrollment Integration
- Complete course information
- Batch details with time slots
- Progress tracking data
- Payment status information

### 6. Statistics Summary
- Enrollment counts per student
- Course and batch statistics
- Active vs completed enrollments

## Performance Considerations

### Database Optimization
- Efficient queries with proper indexing
- Populated references to avoid N+1 queries
- Pagination to limit data transfer

### Response Size
- Configurable page size to control response size
- Selective field population to reduce data
- Efficient data structure to minimize payload

## Use Cases

### 1. Admin Dashboard
- View all students with their course enrollments
- Monitor student progress across courses
- Track batch assignments and schedules

### 2. Student Management
- Search and filter students efficiently
- View complete student academic history
- Monitor enrollment status and payments

### 3. Reporting
- Generate student enrollment reports
- Track course completion rates
- Monitor batch capacity and utilization

### 4. Analytics
- Analyze student enrollment patterns
- Track course popularity
- Monitor batch performance

## Integration Notes

### Authentication
- Requires admin authentication
- Bearer token in Authorization header
- Role-based access control

### Rate Limiting
- Standard API rate limiting applies
- Consider pagination for large datasets
- Use appropriate page sizes

### Caching
- Consider caching for frequently accessed data
- Implement cache invalidation on updates
- Use appropriate cache TTL values

This enhanced API provides comprehensive student management capabilities with complete course and batch information, making it ideal for administrative dashboards and student management systems.
