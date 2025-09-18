# Enhanced Authentication System

## Overview

The authentication system now supports flexible login options for both students and society members, allowing users to login with either their email/password or their unique ID/password combination.

## Login Options

### Student Login

Students can now login using either:

1. **Email + Password**
   ```json
   POST /api/student/login
   {
     "email": "student@example.com",
     "password": "StudentPassword123"
   }
   ```

2. **Student ID + Password**
   ```json
   POST /api/student/login
   {
     "studentId": "PETF123456",
     "password": "StudentPassword123"
   }
   ```

### Society Member Login

Society members can now login using either:

1. **Email + Password**
   ```json
   POST /api/society-member/login
   {
     "email": "member@example.com",
     "password": "MemberPassword123"
   }
   ```

2. **Member ID + Password**
   ```json
   POST /api/society-member/login
   {
     "memberId": "202511001",
     "password": "MemberPassword123"
   }
   ```

## Response Format

### Successful Login Response

```json
{
  "success": true,
  "message": "Student login successful",
  "data": {
    "student": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "PETF123456",
      "department": "Computer Science",
      "year": "3rd",
      "isVerified": true,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Missing Credentials
```json
{
  "success": false,
  "message": "Please provide either email or student ID"
}
```

#### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Account Deactivated
```json
{
  "success": false,
  "message": "Account is deactivated. Please contact administrator."
}
```

## Validation Rules

### Student Login Validation
- Either `email` OR `studentId` must be provided (not both required)
- If `email` is provided, it must be a valid email format
- If `studentId` is provided, it must be a non-empty string
- `password` is always required
- Student ID is automatically converted to uppercase for matching

### Society Member Login Validation
- Either `email` OR `memberId` must be provided (not both required)
- If `email` is provided, it must be a valid email format
- If `memberId` is provided, it must be a non-empty string
- `password` is always required
- Member ID is automatically converted to uppercase for matching

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Secure JWT tokens with configurable expiration (default: 7 days)
3. **HTTP-Only Cookies**: Tokens are stored in HTTP-only cookies for enhanced security
4. **Account Status Check**: Inactive accounts are blocked from login
5. **Last Login Tracking**: System tracks and updates last login timestamp
6. **Input Sanitization**: All inputs are sanitized and validated

## Usage Examples

### Frontend Integration

```javascript
// Student login with email
const loginWithEmail = async (email, password) => {
  const response = await fetch('/api/student/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Student login with student ID
const loginWithStudentId = async (studentId, password) => {
  const response = await fetch('/api/student/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentId, password }),
  });
  return response.json();
};

// Society member login with member ID
const loginWithMemberId = async (memberId, password) => {
  const response = await fetch('/api/society-member/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ memberId, password }),
  });
  return response.json();
};
```

### Using the Token

After successful login, include the token in subsequent requests:

```javascript
// Using Authorization header
const response = await fetch('/api/student/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Or the token will be automatically included via HTTP-only cookie
const response = await fetch('/api/student/profile', {
  credentials: 'include',
});
```

## Migration Notes

### Existing Users
- All existing users can continue using their email/password combination
- No changes required for existing authentication flows
- New ID-based login is an additional option, not a replacement

### API Compatibility
- The API remains backward compatible
- Existing email/password login continues to work
- New ID/password login is additive functionality

## Best Practices

1. **User Experience**: Provide both login options in your UI for maximum flexibility
2. **Error Handling**: Handle all possible error responses gracefully
3. **Token Management**: Store tokens securely and implement proper logout
4. **Input Validation**: Always validate inputs on the frontend before sending
5. **Security**: Use HTTPS in production and implement proper CORS policies

## Troubleshooting

### Common Issues

1. **"Please provide either email or student ID"**
   - Ensure you're sending either `email` or `studentId` (not both, not neither)

2. **"Invalid credentials"**
   - Check that the email/ID and password are correct
   - Verify the account exists and is active

3. **"Account is deactivated"**
   - Contact administrator to reactivate the account

4. **Token not working**
   - Ensure token is included in Authorization header or cookies
   - Check token expiration
   - Verify token format and validity
