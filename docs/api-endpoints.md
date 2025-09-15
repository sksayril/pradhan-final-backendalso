# API Endpoints

Complete documentation of all available API endpoints.

## Base URL

```
http://localhost:3100/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Admin Endpoints

### POST /api/admin/signup

Create a new admin account.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "permissions": ["user-management", "content-management"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "admin": {
      "id": "admin-id",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["user-management", "content-management"],
      "isActive": true
    },
    "token": "jwt-token"
  }
}
```

### POST /api/admin/login

Login as an admin.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "admin-id",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["user-management", "content-management"],
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### GET /api/admin/profile

Get admin profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-id",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["user-management", "content-management"],
      "isActive": true
    },
    "userType": "admin"
  }
}
```

### GET /api/admin/dashboard

Access admin dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Admin Dashboard",
  "data": {
    "admin": {
      "id": "admin-id",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "stats": {
      "totalUsers": 0,
      "activeUsers": 0,
      "totalSocieties": 0
    }
  }
}
```

### POST /api/admin/logout

Logout admin user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Student Endpoints

### POST /api/student/signup

Create a new student account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "Student123",
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "Computer Science",
  "year": "3rd",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "2000-01-01",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "profilePicture": "https://example.com/profile.jpg",
  "interests": ["Programming", "Web Development"]
}
```

**Note:** Student ID is automatically generated in format `STU123456` (STU + 6 random digits) and will be unique.

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student": {
      "id": "student-id",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "studentId": "STU001",
      "department": "Computer Science",
      "year": "3rd",
      "isActive": true,
      "isVerified": false
    },
    "token": "jwt-token"
  }
}
```

### POST /api/student/login

Login as a student.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "Student123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student login successful",
  "data": {
    "student": {
      "id": "student-id",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "studentId": "STU001",
      "department": "Computer Science",
      "year": "3rd",
      "isVerified": false,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### GET /api/student/profile

Get student profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "student-id",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "studentId": "STU001",
      "department": "Computer Science",
      "year": "3rd",
      "isActive": true,
      "isVerified": false
    },
    "userType": "student"
  }
}
```

### GET /api/student/dashboard

Access student dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Student Dashboard",
  "data": {
    "student": {
      "id": "student-id",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "stats": {
      "enrolledSocieties": 0,
      "eventsAttended": 0,
      "achievements": 0
    }
  }
}
```

### GET /api/student/societies

Get student's enrolled societies.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Student societies",
  "data": {
    "societies": []
  }
}
```

### POST /api/student/logout

Logout student user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Society Member Endpoints

### POST /api/society-member/signup

Create a new society member account.

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "Member123",
  "firstName": "Bob",
  "lastName": "Johnson",
  "societyName": "Tech Society",
  "position": "President",
  "department": "Computer Science",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1999-01-01",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  },
  "profilePicture": "https://example.com/profile.jpg",
  "skills": ["Leadership", "Event Management"],
  "responsibilities": ["Organize events", "Manage members"]
}
```

**Note:** Member ID is automatically generated in format `YYYYMMXXX` (e.g., 202511001, 202511002, etc.) and will be unique. The format includes:
- YYYY: Current year (e.g., 2025)
- MM: Current month (e.g., 11 for November)  
- XXX: Sequential number starting from 001

**Response:**
```json
{
  "success": true,
  "message": "Society member registered successfully",
  "data": {
    "member": {
      "id": "member-id",
      "email": "member@example.com",
      "firstName": "Bob",
      "lastName": "Johnson",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "isActive": true,
      "isVerified": false
    },
    "token": "jwt-token"
  }
}
```

### POST /api/society-member/login

Login as a society member.

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "Member123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Society member login successful",
  "data": {
    "member": {
      "id": "member-id",
      "email": "member@example.com",
      "firstName": "Bob",
      "lastName": "Johnson",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "isVerified": false,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### GET /api/society-member/profile

Get society member profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "member-id",
      "email": "member@example.com",
      "firstName": "Bob",
      "lastName": "Johnson",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "isActive": true,
      "isVerified": false
    },
    "userType": "societyMember"
  }
}
```

### GET /api/society-member/dashboard

Access society member dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Society Member Dashboard",
  "data": {
    "member": {
      "id": "member-id",
      "email": "member@example.com",
      "firstName": "Bob",
      "lastName": "Johnson"
    },
    "stats": {
      "eventsOrganized": 0,
      "membersManaged": 0,
      "upcomingEvents": 0
    }
  }
}
```

### GET /api/society-member/events

Get society events.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society events",
  "data": {
    "events": []
  }
}
```

### GET /api/society-member/members

Get society members.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society members",
  "data": {
    "members": []
  }
}
```

### POST /api/society-member/logout

Logout society member user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## General Endpoints

### GET /

Get API documentation and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Basic API Building",
  "version": "1.0.0",
  "endpoints": {
    "admin": {
      "signup": "POST /api/admin/signup",
      "login": "POST /api/admin/login",
      "profile": "GET /api/admin/profile",
      "dashboard": "GET /api/admin/dashboard",
      "logout": "POST /api/admin/logout"
    },
    "student": {
      "signup": "POST /api/student/signup",
      "login": "POST /api/student/login",
      "profile": "GET /api/student/profile",
      "dashboard": "GET /api/student/dashboard",
      "societies": "GET /api/student/societies",
      "logout": "POST /api/student/logout"
    },
    "societyMember": {
      "signup": "POST /api/society-member/signup",
      "login": "POST /api/society-member/login",
      "profile": "GET /api/society-member/profile",
      "dashboard": "GET /api/society-member/dashboard",
      "events": "GET /api/society-member/events",
      "members": "GET /api/society-member/members",
      "logout": "POST /api/society-member/logout"
    }
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Field Validation

### Required Fields

**Admin Signup:**
- email (valid email format)
- password (6+ chars, uppercase, lowercase, number)
- firstName (2-50 chars, letters and spaces only)
- lastName (2-50 chars, letters and spaces only)

**Student Signup:**
- email (valid email format)
- password (6+ chars, uppercase, lowercase, number)
- firstName (2-50 chars, letters and spaces only)
- lastName (2-50 chars, letters and spaces only)
- department (2-100 chars)
- year (1st, 2nd, 3rd, 4th, 5th, Graduate, Post-Graduate)
- studentId (auto-generated: STU + 6 random digits)

**Society Member Signup:**
- email (valid email format)
- password (6+ chars, uppercase, lowercase, number)
- firstName (2-50 chars, letters and spaces only)
- lastName (2-50 chars, letters and spaces only)
- memberId (auto-generated: YYYYMMXXX format, e.g., 202511001)
- societyName (2-100 chars)
- position (President, Vice-President, Secretary, Treasurer, Member, Coordinator, Volunteer)

### Optional Fields

- phoneNumber (valid phone format)
- dateOfBirth (past date)
- address (object with street, city, state, zipCode, country)
- profilePicture (valid URL)
- interests (array of strings)
- skills (array of strings)
- responsibilities (array of strings)
- role (admin only: super-admin, admin, moderator)
- permissions (admin only: user-management, content-management, system-settings, reports)

## User Management Endpoints (Admin Only)

### Get All Students
**GET** `/api/user-management/students`

Retrieve all students with pagination and filtering options.

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
- `kycStatus` (optional): Filter by KYC status
- `isActive` (optional): Filter by active status
- `isVerified` (optional): Filter by verification status

**Response:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [...],
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

### Get All Society Members
**GET** `/api/user-management/society-members`

Retrieve all society members with pagination and filtering options.

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
- `kycStatus` (optional): Filter by KYC status
- `isActive` (optional): Filter by active status
- `isVerified` (optional): Filter by verification status

**Response:**
```json
{
  "success": true,
  "message": "Society members retrieved successfully",
  "data": {
    "societyMembers": [...],
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

### Get All Admins
**GET** `/api/user-management/admins`

Retrieve all admin users with pagination and filtering options.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of admins per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by admin role
- `isActive` (optional): Filter by active status
- `isVerified` (optional): Filter by verification status

**Response:**
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [...],
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

### Get User Statistics
**GET** `/api/user-management/statistics`

Retrieve comprehensive statistics about all users in the system.

**Headers:**
```
Authorization: Bearer <admin_token>
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

### Get Student by ID
**GET** `/api/user-management/students/:id`

Retrieve a specific student by their MongoDB ObjectId with complete KYC information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the student

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
      "kycStatus": "approved",
      "kyc": {
        "status": "approved",
        "submittedAt": "2024-01-10T09:00:00.000Z",
        "reviewedAt": "2024-01-12T14:30:00.000Z",
        "reviewedBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "aadharNumber": "123456789012",
        "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg"
      }
    }
  }
}
```

### Get Student by Student ID
**GET** `/api/user-management/students/by-student-id/:studentId`

Retrieve a specific student by their custom student ID (e.g., STU123456) with complete KYC information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `studentId` (required): Custom student ID (e.g., STU123456)

### Get Society Member by ID
**GET** `/api/user-management/society-members/:id`

Retrieve a specific society member by their MongoDB ObjectId with complete KYC information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the society member

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
      "kycStatus": "approved",
      "kyc": {
        "status": "approved",
        "submittedAt": "2024-01-08T11:00:00.000Z",
        "reviewedAt": "2024-01-10T16:45:00.000Z",
        "reviewedBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "aadharNumber": "987654321098",
        "panNumber": "ABCDE1234F",
        "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar456.jpg",
        "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan789.jpg"
      }
    }
  }
}
```

### Get Society Member by Member ID
**GET** `/api/user-management/society-members/by-member-id/:memberId`

Retrieve a specific society member by their custom member ID (e.g., MEM123456) with complete KYC information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `memberId` (required): Custom member ID (e.g., MEM123456)

### Get Admin by ID
**GET** `/api/user-management/admins/:id`

Retrieve a specific admin by their MongoDB ObjectId.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the admin

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
      "isVerified": true
    }
  }
}
```

### Get All Approved KYC Students
**GET** `/api/user-management/students/approved-kyc`

Retrieve all students with approved KYC status with complete KYC information.

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
            "_id": "admin_id",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
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

### Get All Approved KYC Society Members
**GET** `/api/user-management/society-members/approved-kyc`

Retrieve all society members with approved KYC status with complete KYC information.

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
            "_id": "admin_id",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
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
