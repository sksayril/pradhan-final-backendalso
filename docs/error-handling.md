# Error Handling

This document explains how errors are handled in the Basic API Building authentication system.

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional, for validation errors
}
```

## HTTP Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful requests |
| 201 | Created | Successful resource creation (signup) |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Authentication failures, invalid tokens |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Route not found |
| 500 | Internal Server Error | Server-side errors |

## Common Error Types

### 1. Validation Errors (400)

Occur when request data doesn't meet validation requirements.

**Example - Invalid Email:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid email address"
  ]
}
```

**Example - Multiple Validation Errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
    "First name must be 2-50 characters long and contain only letters and spaces"
  ]
}
```

### 2. Authentication Errors (401)

Occur when authentication fails or tokens are invalid.

**No Token Provided:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

**Token Expired:**
```json
{
  "success": false,
  "message": "Token expired."
}
```

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Account Deactivated:**
```json
{
  "success": false,
  "message": "Account is deactivated. Please contact system administrator."
}
```

### 3. Authorization Errors (403)

Occur when user doesn't have sufficient permissions.

**Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

**Admin Privileges Required:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**Student Privileges Required:**
```json
{
  "success": false,
  "message": "Access denied. Student privileges required."
}
```

**Society Member Privileges Required:**
```json
{
  "success": false,
  "message": "Access denied. Society member privileges required."
}
```

### 4. Resource Errors (400)

Occur when trying to create resources that already exist.

**User Already Exists:**
```json
{
  "success": false,
  "message": "Admin with this email already exists"
}
```

**Student ID Already Exists:**
```json
{
  "success": false,
  "message": "Student with this ID already exists"
}
```

**Member ID Already Exists:**
```json
{
  "success": false,
  "message": "Society member with this ID already exists"
}
```

### 5. Not Found Errors (404)

Occur when accessing non-existent routes.

**Route Not Found:**
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found"
}
```

### 6. Server Errors (500)

Occur when unexpected server-side errors happen.

**Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error during admin registration"
}
```

**Database Connection Error:**
```json
{
  "success": false,
  "message": "Database connection failed"
}
```

## Field-Specific Validation Errors

### Email Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid email address"
  ]
}
```

### Password Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
  ]
}
```

### Name Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "First name must be 2-50 characters long and contain only letters and spaces"
  ]
}
```

### Student ID Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Student ID must be 3-20 characters long"
  ]
}
```

### Member ID Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Member ID must be 3-20 characters long"
  ]
}
```

### Department Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Department must be 2-100 characters long"
  ]
}
```

### Society Name Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Society name must be 2-100 characters long"
  ]
}
```

### Year Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Academic year must be one of: 1st, 2nd, 3rd, 4th, 5th, Graduate, Post-Graduate"
  ]
}
```

### Position Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Position must be one of: President, Vice-President, Secretary, Treasurer, Member, Coordinator, Volunteer"
  ]
}
```

### Role Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Role must be one of: super-admin, admin, moderator"
  ]
}
```

### Phone Number Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid phone number"
  ]
}
```

### Date Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Date of birth must be in the past"
  ]
}
```

### URL Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid URL for profile picture"
  ]
}
```

## Error Handling Best Practices

### 1. Client-Side Error Handling

```javascript
async function handleAPIRequest(requestFunction) {
  try {
    const result = await requestFunction();
    return result;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      
      if (errorData.errors && errorData.errors.length > 0) {
        // Handle validation errors
        console.error('Validation Errors:', errorData.errors);
        return { success: false, type: 'validation', errors: errorData.errors };
      } else {
        // Handle other errors
        console.error('API Error:', errorData.message);
        return { success: false, type: 'error', message: errorData.message };
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
      return { success: false, type: 'network', message: 'Network error occurred' };
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return { success: false, type: 'unknown', message: error.message };
    }
  }
}
```

### 2. Form Validation Error Display

```javascript
function displayValidationErrors(errors) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = '';
  
  if (errors && errors.length > 0) {
    const errorList = document.createElement('ul');
    errorList.className = 'error-list';
    
    errors.forEach(error => {
      const errorItem = document.createElement('li');
      errorItem.textContent = error;
      errorItem.className = 'error-item';
      errorList.appendChild(errorItem);
    });
    
    errorContainer.appendChild(errorList);
    errorContainer.style.display = 'block';
  } else {
    errorContainer.style.display = 'none';
  }
}
```

### 3. Authentication Error Handling

```javascript
function handleAuthError(error) {
  switch (error.message) {
    case 'Access denied. No token provided.':
    case 'Invalid token.':
    case 'Token expired.':
      // Redirect to login page
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
      break;
    
    case 'Account is deactivated.':
      // Show account deactivated message
      showMessage('Your account has been deactivated. Please contact support.', 'error');
      break;
    
    case 'Invalid email or password':
      // Show login error
      showMessage('Invalid email or password. Please try again.', 'error');
      break;
    
    default:
      // Show generic error
      showMessage('An authentication error occurred. Please try again.', 'error');
  }
}
```

### 4. Retry Logic for Network Errors

```javascript
async function retryRequest(requestFunction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunction();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      if (error.request) {
        // Network error, wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        // Non-network error, don't retry
        throw error;
      }
    }
  }
}
```

## Debugging Tips

### 1. Enable Detailed Logging

Set `NODE_ENV=development` in your `.env` file to get more detailed error messages.

### 2. Check Request Format

Ensure your requests include:
- Correct Content-Type header: `application/json`
- Valid JSON in request body
- Proper Authorization header for protected endpoints

### 3. Validate Environment Variables

Make sure all required environment variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRE`

### 4. Test with cURL

Use cURL to test endpoints and see raw responses:

```bash
# Test signup
curl -X POST http://localhost:3000/api/student/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User","studentId":"TEST001","department":"CS","year":"1st"}' \
  -v

# Test login
curl -X POST http://localhost:3000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' \
  -v
```

### 5. Check Database Connection

Verify MongoDB is running and accessible:

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Check database connection from app
curl http://localhost:3000/health
```

## Common Troubleshooting

### 1. "Cannot read property of undefined"
- Check if the response structure matches expected format
- Verify the endpoint is returning data in the correct format

### 2. "Network Error"
- Check if the server is running
- Verify the URL is correct
- Check CORS settings

### 3. "Validation failed"
- Check all required fields are provided
- Verify field formats match requirements
- Check data types (string, number, boolean, object, array)

### 4. "Token expired"
- Implement token refresh logic
- Handle token expiration gracefully
- Redirect to login when token expires

### 5. "User already exists"
- Check if user is trying to sign up with existing email
- Implement proper error handling for duplicate users
- Consider allowing users to reset password instead
