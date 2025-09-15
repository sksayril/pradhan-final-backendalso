# Society Member Management API Documentation

This document provides comprehensive documentation for all Society Member related APIs, including both admin-side and user-side endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Member ID Generation](#member-id-generation)
3. [User-Side APIs](#user-side-apis)
4. [Admin-Side APIs](#admin-side-apis)
5. [KYC Integration](#kyc-integration)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Overview

The Society Member Management system provides comprehensive functionality for managing society/club members in educational institutions. It includes:

- **Auto-generated Member IDs** in format `YYYYMMXXX` (e.g., 202511001)
- **Role-based access control** with different positions
- **KYC verification system** for enhanced security
- **Admin management tools** for oversight and control
- **Member self-service** capabilities

## Member ID Generation

### Format
Member IDs are automatically generated in the format: `YYYYMMXXX`

- **YYYY**: Current year (e.g., 2025)
- **MM**: Current month (e.g., 11 for November)
- **XXX**: Sequential number starting from 001

### Examples
- `202511001` - First member registered in November 2025
- `202511002` - Second member registered in November 2025
- `202512001` - First member registered in December 2025

### Features
- **Uniqueness**: Each Member ID is guaranteed to be unique
- **Chronological**: IDs are generated in chronological order
- **Month-based**: New sequence starts each month
- **Validation**: Built-in format validation in the database schema

## User-Side APIs

### Authentication Endpoints

#### POST /api/society-member/signup

Register a new society member with auto-generated Member ID.

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "Member123",
  "firstName": "John",
  "lastName": "Doe",
  "societyName": "Tech Society",
  "position": "President",
  "department": "Computer Science",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1999-01-01",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "profilePicture": "https://example.com/profile.jpg",
  "skills": ["Leadership", "Event Management"],
  "responsibilities": ["Organize events", "Manage members"]
}
```

**Required Fields:**
- `email` - Valid email address
- `password` - Minimum 6 characters with uppercase, lowercase, and number
- `firstName` - 2-50 characters, letters and spaces only
- `lastName` - 2-50 characters, letters and spaces only
- `societyName` - 2-100 characters
- `position` - One of: President, Vice-President, Secretary, Treasurer, Member, Coordinator, Volunteer

**Optional Fields:**
- `department` - Department name
- `phoneNumber` - Valid phone number
- `dateOfBirth` - Past date
- `address` - Address object
- `profilePicture` - Valid URL
- `skills` - Array of skill strings
- `responsibilities` - Array of responsibility strings

**Response:**
```json
{
  "success": true,
  "message": "Society member registered successfully",
  "data": {
    "member": {
      "id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "department": "Computer Science",
      "isActive": true,
      "isVerified": false,
      "kycStatus": "not_submitted",
      "joiningDate": "2025-11-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/society-member/login

Authenticate a society member.

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
      "id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "isVerified": false,
      "lastLogin": "2025-11-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/society-member/profile

Get current member's profile information.

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
      "id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "department": "Computer Science",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1999-01-01T00:00:00.000Z",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "isActive": true,
      "isVerified": false,
      "kycStatus": "not_submitted",
      "joiningDate": "2025-11-01T10:30:00.000Z",
      "skills": ["Leadership", "Event Management"],
      "responsibilities": ["Organize events", "Manage members"]
    },
    "userType": "societyMember"
  }
}
```

#### GET /api/society-member/dashboard

Access member dashboard with statistics.

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
      "id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President"
    },
    "stats": {
      "eventsOrganized": 5,
      "membersManaged": 25,
      "upcomingEvents": 3,
      "kycStatus": "approved",
      "societyMembership": "2 years"
    }
  }
}
```

#### GET /api/society-member/events

Get society events (placeholder for future implementation).

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

#### GET /api/society-member/members

Get society members (placeholder for future implementation).

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

#### POST /api/society-member/logout

Logout current member.

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

## Admin-Side APIs

### User Management Endpoints

#### GET /api/user-management/society-members

Retrieve all society members with pagination and filtering.

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
    "societyMembers": [
      {
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "email": "member@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "memberId": "202511001",
        "societyName": "Tech Society",
        "position": "President",
        "department": "Computer Science",
        "phoneNumber": "+1234567890",
        "isActive": true,
        "isVerified": false,
        "kycStatus": "approved",
        "joiningDate": "2025-11-01T10:30:00.000Z",
        "lastLogin": "2025-11-01T15:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMembers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/user-management/society-members/:id

Get specific society member by MongoDB ObjectId.

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
      "_id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "department": "Computer Science",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1999-01-01T00:00:00.000Z",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "isActive": true,
      "isVerified": false,
      "kycStatus": "approved",
      "joiningDate": "2025-11-01T10:30:00.000Z",
      "lastLogin": "2025-11-01T15:45:00.000Z",
      "skills": ["Leadership", "Event Management"],
      "responsibilities": ["Organize events", "Manage members"],
      "kyc": {
        "status": "approved",
        "submittedAt": "2025-11-01T11:00:00.000Z",
        "reviewedAt": "2025-11-01T14:30:00.000Z",
        "reviewedBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "aadharNumber": "123456789012",
        "panNumber": "ABCDE1234F",
        "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg",
        "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan123.jpg"
      }
    }
  }
}
```

#### GET /api/user-management/society-members/by-member-id/:memberId

Get specific society member by Member ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `memberId` (required): Member ID (e.g., 202511001)

**Response:**
```json
{
  "success": true,
  "message": "Society member retrieved successfully",
  "data": {
    "societyMember": {
      "_id": "64f8b2c1a1b2c3d4e5f67890",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202511001",
      "societyName": "Tech Society",
      "position": "President",
      "department": "Computer Science",
      "isActive": true,
      "isVerified": false,
      "kycStatus": "approved"
    }
  }
}
```

#### GET /api/user-management/society-members/approved-kyc

Get all society members with approved KYC status.

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
        "_id": "64f8b2c1a1b2c3d4e5f67890",
        "email": "member@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "memberId": "202511001",
        "societyName": "Tech Society",
        "position": "President",
        "kycStatus": "approved",
        "kyc": {
          "status": "approved",
          "submittedAt": "2025-11-01T11:00:00.000Z",
          "reviewedAt": "2025-11-01T14:30:00.000Z",
          "reviewedBy": {
            "_id": "admin_id",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
          "remarks": "All documents verified successfully",
          "aadharNumber": "123456789012",
          "panNumber": "ABCDE1234F",
          "aadharCardImage": "https://s3.amazonaws.com/bucket/kyc/aadhar123.jpg",
          "panCardImage": "https://s3.amazonaws.com/bucket/kyc/pan123.jpg"
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

## KYC Integration

Society members have enhanced KYC requirements compared to students:

### Required Documents
- **Aadhar Number**: 12-digit Aadhar number
- **PAN Number**: Valid PAN number in format ABCDE1234F
- **Aadhar Card Image**: Uploaded image of Aadhar card
- **PAN Card Image**: Uploaded image of PAN card

### KYC Endpoints

#### POST /api/kyc/society-member/submit

Submit KYC documents for society member.

**Headers:**
```
Authorization: Bearer <member_token>
```

**Request Body:**
```json
{
  "aadharNumber": "123456789012",
  "panNumber": "ABCDE1234F"
}
```

**Response:**
```json
{
  "success": true,
  "message": "KYC documents submitted successfully",
  "data": {
    "kyc": {
      "id": "kyc_id",
      "status": "pending",
      "submittedAt": "2025-11-01T11:00:00.000Z",
      "aadharNumber": "123456789012",
      "panNumber": "ABCDE1234F"
    }
  }
}
```

#### GET /api/kyc/society-member/status

Get KYC status for current society member.

**Headers:**
```
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "KYC status retrieved successfully",
  "data": {
    "kyc": {
      "status": "approved",
      "submittedAt": "2025-11-01T11:00:00.000Z",
      "reviewedAt": "2025-11-01T14:30:00.000Z",
      "reviewedBy": {
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "remarks": "All documents verified successfully"
    }
  }
}
```

### Admin KYC Management

#### POST /api/kyc/admin/society-member/approve

Approve society member KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "kycId": "kyc_id",
  "remarks": "All documents verified successfully"
}
```

#### POST /api/kyc/admin/society-member/reject

Reject society member KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "kycId": "kyc_id",
  "rejectionReason": "PAN number format is incorrect"
}
```

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email must be a valid email address",
    "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
  ]
}
```

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

#### Not Found (404)
```json
{
  "success": false,
  "message": "Society member not found"
}
```

#### Conflict (409)
```json
{
  "success": false,
  "message": "Society member with this email already exists"
}
```

#### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error during society member registration"
}
```

## Examples

### Complete Registration Flow

1. **Register Society Member**
```bash
curl -X POST http://localhost:3100/api/society-member/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Member123",
    "firstName": "John",
    "lastName": "Doe",
    "societyName": "Tech Society",
    "position": "President",
    "department": "Computer Science"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:3100/api/society-member/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Member123"
  }'
```

3. **Submit KYC**
```bash
curl -X POST http://localhost:3100/api/kyc/society-member/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "aadharNumber": "123456789012",
    "panNumber": "ABCDE1234F"
  }'
```

4. **Check Profile**
```bash
curl -X GET http://localhost:3100/api/society-member/profile \
  -H "Authorization: Bearer <token>"
```

### Admin Management Flow

1. **Get All Society Members**
```bash
curl -X GET "http://localhost:3100/api/user-management/society-members?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

2. **Get Member by Member ID**
```bash
curl -X GET http://localhost:3100/api/user-management/society-members/by-member-id/202511001 \
  -H "Authorization: Bearer <admin_token>"
```

3. **Approve KYC**
```bash
curl -X POST http://localhost:3100/api/kyc/admin/society-member/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "kycId": "kyc_id",
    "remarks": "All documents verified successfully"
  }'
```

## Security Considerations

1. **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and number
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: Comprehensive validation for all inputs
4. **KYC Verification**: Enhanced verification for society members
5. **Role-based Access**: Different access levels for different positions
6. **Data Sanitization**: All inputs are sanitized before processing

## Rate Limiting

- **Signup**: 5 requests per hour per IP
- **Login**: 10 requests per hour per IP
- **API Calls**: 100 requests per hour per authenticated user

## Support

For technical support or questions about the Society Member Management API, please contact the development team or refer to the main API documentation.
