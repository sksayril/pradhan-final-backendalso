# Authentication

This document explains how authentication works in the Basic API Building system.

## Overview

The API uses JWT (JSON Web Tokens) for authentication. Users can sign up and log in to get a token that must be included in subsequent requests to protected endpoints.

## User Types

### 1. Admin
- System administrators with full access
- Can manage users, content, and system settings
- Roles: super-admin, admin, moderator
- Permissions: user-management, content-management, system-settings, reports

### 2. Student
- Regular students with limited access
- Can view their profile and enrolled societies
- Has student-specific fields like studentId, department, year

### 3. Society Member
- Society/club members with specific permissions
- Can manage society events and members
- Has society-specific fields like memberId, societyName, position

## Authentication Flow

### 1. Signup
```http
POST /api/{user-type}/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  // ... other required fields
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user data */ },
    "token": "jwt-token-here"
  }
}
```

### 2. Login
```http
POST /api/{user-type}/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user data */ },
    "token": "jwt-token-here"
  }
}
```

### 3. Using the Token
Include the token in the Authorization header for protected endpoints:

```http
GET /api/{user-type}/profile
Authorization: Bearer jwt-token-here
```

## JWT Token Structure

The JWT token contains the following payload:

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "userType": "admin|student|societyMember",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Fields

- **id**: Unique user identifier
- **email**: User's email address
- **userType**: Type of user (admin, student, societyMember)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

## Password Requirements

Passwords must meet the following criteria:

- Minimum 6 characters
- Maximum 128 characters
- At least one lowercase letter (a-z)
- At least one uppercase letter (A-Z)
- At least one number (0-9)

## Token Expiration

- Default expiration: 7 days
- Configurable via `JWT_EXPIRE` environment variable
- Tokens are automatically refreshed on successful login

## Protected Endpoints

All endpoints except signup, login, and public documentation require authentication:

### Admin Protected Endpoints
- `GET /api/admin/profile`
- `GET /api/admin/dashboard`
- `POST /api/admin/logout`

### Student Protected Endpoints
- `GET /api/student/profile`
- `GET /api/student/dashboard`
- `GET /api/student/societies`
- `POST /api/student/logout`

### Society Member Protected Endpoints
- `GET /api/society-member/profile`
- `GET /api/society-member/dashboard`
- `GET /api/society-member/events`
- `GET /api/society-member/members`
- `POST /api/society-member/logout`

## Authentication Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 401 Invalid Token
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### 401 Token Expired
```json
{
  "success": false,
  "message": "Token expired."
}
```

### 401 Account Deactivated
```json
{
  "success": false,
  "message": "Account is deactivated."
}
```

### 403 Insufficient Permissions
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

## Logout

To logout, send a POST request to the logout endpoint:

```http
POST /api/{user-type}/logout
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Security Features

### Password Hashing
- Passwords are hashed using bcrypt with salt rounds of 12
- Original passwords are never stored in the database

### Token Security
- Tokens are signed with a secret key
- Tokens are stored in HTTP-only cookies (optional)
- Tokens include user type for authorization

### Input Validation
- All input is validated and sanitized
- Email addresses are normalized to lowercase
- Student IDs and Member IDs are normalized to uppercase

## Best Practices

### 1. Token Storage
- Store tokens securely on the client side
- Use HTTP-only cookies when possible
- Implement token refresh logic

### 2. Error Handling
- Handle authentication errors gracefully
- Redirect to login on token expiration
- Show appropriate error messages

### 3. Security
- Use HTTPS in production
- Implement proper CORS policies
- Regularly rotate JWT secrets

## Example Implementation

### Frontend (JavaScript)
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/student/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};

// Authenticated Request
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/student/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Student123"}'

# Get Profile
curl -X GET http://localhost:3000/api/student/profile \
  -H "Authorization: Bearer your-jwt-token"

# Logout
curl -X POST http://localhost:3000/api/student/logout \
  -H "Authorization: Bearer your-jwt-token"
```
