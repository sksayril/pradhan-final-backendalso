# API Examples

This document provides practical examples of how to use the Basic API Building authentication system.

## Prerequisites

Make sure the server is running:
```bash
npm start
```

## Admin Examples

### 1. Admin Signup

```bash
curl -X POST http://localhost:3000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "permissions": ["user-management", "content-management"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "permissions": ["user-management", "content-management"],
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Admin Login

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123"
  }'
```

### 3. Get Admin Profile

```bash
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Access Admin Dashboard

```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Student Examples

### 1. Student Signup

```bash
curl -X POST http://localhost:3000/api/student/signup \
  -H "Content-Type: application/json" \
  -d '{
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
    "interests": ["Programming", "Web Development"]
  }'
```

**Note:** Student ID is automatically generated and will be returned in the response.

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "studentId": "STU123456",
      "department": "Computer Science",
      "year": "3rd",
      "isActive": true,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Student Login

```bash
curl -X POST http://localhost:3000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student123"
  }'
```

### 3. Get Student Profile

```bash
curl -X GET http://localhost:3000/api/student/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Access Student Dashboard

```bash
curl -X GET http://localhost:3000/api/student/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Get Student Societies

```bash
curl -X GET http://localhost:3000/api/student/societies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Society Member Examples

### 1. Society Member Signup

```bash
curl -X POST http://localhost:3000/api/society-member/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "Member123",
    "firstName": "Bob",
    "lastName": "Johnson",
    "memberId": "MEM001",
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
    "skills": ["Leadership", "Event Management"],
    "responsibilities": ["Organize events", "Manage members"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Society member registered successfully",
  "data": {
    "member": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "email": "member@example.com",
      "firstName": "Bob",
      "lastName": "Johnson",
      "memberId": "MEM001",
      "societyName": "Tech Society",
      "position": "President",
      "isActive": true,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Society Member Login

```bash
curl -X POST http://localhost:3000/api/society-member/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "Member123"
  }'
```

### 3. Get Society Member Profile

```bash
curl -X GET http://localhost:3000/api/society-member/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Access Society Member Dashboard

```bash
curl -X GET http://localhost:3000/api/society-member/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Get Society Events

```bash
curl -X GET http://localhost:3000/api/society-member/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 6. Get Society Members

```bash
curl -X GET http://localhost:3000/api/society-member/members \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## JavaScript/Node.js Examples

### Using Fetch API

```javascript
// Login function
async function login(email, password, userType) {
  try {
    const response = await fetch(`http://localhost:3000/api/${userType}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userType', data.data.user.userType || userType);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get profile function
async function getProfile() {
  try {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    const response = await fetch(`http://localhost:3000/api/${userType}/profile`, {
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
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

// Usage
login('student@example.com', 'Student123', 'student')
  .then(user => {
    console.log('Logged in user:', user);
    console.log('Auto-generated Student ID:', user.studentId);
    return getProfile();
  })
  .then(profile => {
    console.log('User profile:', profile);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

### Using Axios

```javascript
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function
async function login(email, password, userType) {
  try {
    const response = await api.post(`/${userType}/login`, {
      email,
      password,
    });
    
    const { data } = response;
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userType', userType);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get profile function
async function getProfile() {
  try {
    const userType = localStorage.getItem('userType');
    const response = await api.get(`/${userType}/profile`);
    
    const { data } = response;
    
    if (data.success) {
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}
```

## Python Examples

### Using requests library

```python
import requests
import json

class APIClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
        self.token = None
        self.user_type = None
    
    def login(self, email, password, user_type):
        url = f"{self.base_url}/{user_type}/login"
        data = {
            "email": email,
            "password": password
        }
        
        response = requests.post(url, json=data)
        result = response.json()
        
        if result["success"]:
            self.token = result["data"]["token"]
            self.user_type = user_type
            return result["data"]["user"]
        else:
            raise Exception(result["message"])
    
    def get_profile(self):
        if not self.token or not self.user_type:
            raise Exception("Not logged in")
        
        url = f"{self.base_url}/{self.user_type}/profile"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        response = requests.get(url, headers=headers)
        result = response.json()
        
        if result["success"]:
            return result["data"]["user"]
        else:
            raise Exception(result["message"])
    
    def get_dashboard(self):
        if not self.token or not self.user_type:
            raise Exception("Not logged in")
        
        url = f"{self.base_url}/{self.user_type}/dashboard"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        response = requests.get(url, headers=headers)
        result = response.json()
        
        if result["success"]:
            return result["data"]
        else:
            raise Exception(result["message"])

# Usage
client = APIClient()

try:
    # Login
    user = client.login("student@example.com", "Student123", "student")
    print("Logged in user:", user)
    
    # Get profile
    profile = client.get_profile()
    print("User profile:", profile)
    
    # Get dashboard
    dashboard = client.get_dashboard()
    print("Dashboard data:", dashboard)
    
except Exception as e:
    print("Error:", str(e))
```

## Error Handling Examples

### Common Error Responses

```json
// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
  ]
}

// Authentication Error
{
  "success": false,
  "message": "Invalid email or password"
}

// Authorization Error
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}

// User Already Exists
{
  "success": false,
  "message": "Admin with this email already exists"
}
```

### Error Handling in JavaScript

```javascript
async function handleAPIRequest(requestFunction) {
  try {
    const result = await requestFunction();
    return result;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      console.error('API Error:', errorData.message);
      
      if (errorData.errors) {
        console.error('Validation Errors:', errorData.errors);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Usage
handleAPIRequest(() => login('invalid-email', 'weak', 'student'))
  .catch(error => {
    // Handle error appropriately
    console.error('Login failed:', error.message);
  });
```

## Testing with Postman

### 1. Create a Collection
- Create a new collection called "Basic API Building"
- Set base URL: `http://localhost:3000/api`

### 2. Environment Variables
Create environment variables:
- `base_url`: `http://localhost:3000/api`
- `token`: (will be set after login)
- `user_type`: (will be set after login)

### 3. Pre-request Scripts
For protected endpoints, add this pre-request script:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

### 4. Test Scripts
For login endpoints, add this test script to save the token:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success) {
        pm.environment.set('token', response.data.token);
        pm.environment.set('user_type', pm.request.url.path[1]); // Extract user type from URL
    }
}
```

This setup allows you to test the complete authentication flow in Postman.
