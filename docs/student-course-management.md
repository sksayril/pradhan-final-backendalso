# Student-Side Course Management API

This document outlines the APIs available for students to browse, enroll in, and manage their courses.

## Authentication

All endpoints require a valid student JWT token in the `Authorization` header.

```http
Authorization: Bearer <student_jwt_token>
```

---

## 1. Get All Available Courses

Retrieve a list of all published and active courses available for enrollment.

- **Endpoint:** `GET /api/student/courses`
- **Method:** `GET`

### Query Parameters

| Parameter  | Type   | Description                                            | Default |
|------------|--------|--------------------------------------------------------|---------|
| `page`     | Number | Page number for pagination.                            | 1       |
| `limit`    | Number | Number of courses per page.                            | 10      |
| `search`   | String | Search term for course title, description, or category.|         |
| `type`     | String | Filter by course type (`online` or `offline`).         |         |
| `category` | String | Filter by course category.                             |         |
| `sortBy`   | String | Field to sort by (e.g., `createdAt`, `price`, `rating`). | `createdAt` |
| `sortOrder`| String | Sort order (`asc` or `desc`).                          | `desc`  |

### Example Request

```http
GET /api/student/courses?category=Programming&sortBy=price&sortOrder=asc
Authorization: Bearer <student_jwt_token>
```

### Example Response

```json
{
    "success": true,
    "message": "Courses retrieved successfully",
    "data": {
        "courses": [
            {
                "_id": "60d0fe4f5b9f9b2b4c8b4567",
                "title": "Introduction to Python",
                "description": "A beginner-friendly course on Python programming.",
                "type": "online",
                "category": "Programming",
                "instructor": {
                    "name": "John Doe"
                },
                "price": 999,
                "currency": "INR",
                "thumbnail": "https://example.com/thumbnail.jpg",
                "rating": {
                    "average": 4.5,
                    "count": 150
                }
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalCourses": 50,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

---

## 2. Get Course Details

Retrieve detailed information about a specific course, including its available batches.

- **Endpoint:** `GET /api/student/courses/:courseId`
- **Method:** `GET`

### Example Request

```http
GET /api/student/courses/60d0fe4f5b9f9b2b4c8b4567
Authorization: Bearer <student_jwt_token>
```

### Example Response

```json
{
    "success": true,
    "message": "Course details retrieved successfully",
    "data": {
        "course": {
            "_id": "60d0fe4f5b9f9b2b4c8b4567",
            "title": "Introduction to Python",
            "description": "A beginner-friendly course on Python programming.",
            "type": "online",
            "category": "Programming",
            "price": 999
        },
        "availableBatches": [
            {
                "_id": "60d0fe4f5b9f9b2b4c8b4568",
                "name": "Python Morning Batch",
                "startDate": "2025-10-01T00:00:00.000Z",
                "endDate": "2025-11-01T00:00:00.000Z",
                "timeSlots": [
                    {
                        "date": "2025-10-01T00:00:00.000Z",
                        "startTime": "09:00",
                        "endTime": "11:00"
                    }
                ]
            }
        ]
    }
}
```

---

## 3. Enroll in a Course

Enroll the authenticated student in a specific batch of a course.

- **Endpoint:** `POST /api/student/courses/enroll`
- **Method:** `POST`

### Request Body

```json
{
    "courseId": "60d0fe4f5b9f9b2b4c8b4567",
    "batchId": "60d0fe4f5b9f9b2b4c8b4568"
}
```

### Example Request

```http
POST /api/student/courses/enroll
Authorization: Bearer <student_jwt_token>
Content-Type: application/json

{
    "courseId": "60d0fe4f5b9f9b2b4c8b4567",
    "batchId": "60d0fe4f5b9f9b2b4c8b4568"
}
```

### Example Response

```json
{
    "success": true,
    "message": "Successfully enrolled in the course.",
    "data": {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "courseId": "60d0fe4f5b9f9b2b4c8b4567",
        "batchId": "60d0fe4f5b9f9b2b4c8b4568",
        "status": "enrolled",
        "paymentStatus": "pending"
    }
}
```

---

## 4. Get My Enrolled Courses

Retrieve a list of all courses the authenticated student is currently enrolled in.

- **Endpoint:** `GET /api/student/courses/my-courses`
- **Method:** `GET`

### Example Request

```http
GET /api/student/courses/my-courses
Authorization: Bearer <student_jwt_token>
```

### Example Response

```json
{
    "success": true,
    "message": "Enrolled courses retrieved successfully",
    "data": {
        "enrolledCourses": [
            {
                "_id": "60d0fe4f5b9f9b2b4c8b4569",
                "courseId": {
                    "_id": "60d0fe4f5b9f9b2b4c8b4567",
                    "title": "Introduction to Python",
                    "thumbnail": "https://example.com/thumbnail.jpg"
                },
                "batchId": {
                    "_id": "60d0fe4f5b9f9b2b4c8b4568",
                    "name": "Python Morning Batch"
                },
                "status": "enrolled"
            }
        ]
    }
}
```

---

## 5. Get My Enrolled Course Details

Retrieve detailed information about a specific course the authenticated student is enrolled in, including full course and batch details.

- **Endpoint:** `GET /api/student/courses/my-courses/:enrollmentId`
- **Method:** `GET`

### Example Request

```http
GET /api/student/courses/my-courses/60d0fe4f5b9f9b2b4c8b4569
Authorization: Bearer <student_jwt_token>
```

### Example Response

```json
{
    "success": true,
    "message": "Enrolled course details retrieved successfully",
    "data": {
        "enrollment": {
            "_id": "60d0fe4f5b9f9b2b4c8b4569",
            "studentId": "60d0fe4f5b9f9b2b4c8b456a",
            "status": "enrolled",
            "paymentStatus": "paid",
            "courseId": {
                "_id": "60d0fe4f5b9f9b2b4c8b4567",
                "title": "Introduction to Python",
                "description": "A beginner-friendly course on Python programming.",
                "type": "online",
                "category": "Programming",
                "instructor": {
                    "name": "John Doe",
                    "email": "john.doe@example.com"
                },
                "price": 999
            },
            "batchId": {
                "_id": "60d0fe4f5b9f9b2b4c8b4568",
                "name": "Python Morning Batch",
                "description": "An intensive morning batch for Python beginners.",
                "startDate": "2025-10-01T00:00:00.000Z",
                "endDate": "2025-11-01T00:00:00.000Z",
                "timeSlots": [
                    {
                        "date": "2025-10-01T00:00:00.000Z",
                        "startTime": "09:00",
                        "endTime": "11:00",
                        "duration": 120
                    }
                ]
            }
        }
    }
}
```
