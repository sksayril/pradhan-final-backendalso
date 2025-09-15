# KYC (Know Your Customer) API Endpoints

This document provides comprehensive documentation for the KYC functionality in the Basic API Building system.

## Overview

The KYC system allows students and society members to submit identity verification documents for admin approval. This ensures proper verification of user identities before granting access to platform features.

## KYC Requirements

### Student KYC
- **Aadhar Number**: 12-digit Aadhar number
- **Aadhar Card Image**: Clear image of the Aadhar card

### Society Member KYC
- **Aadhar Number**: 12-digit Aadhar number
- **PAN Number**: PAN number in format ABCDE1234F
- **Aadhar Card Image**: Clear image of the Aadhar card
- **PAN Card Image**: Clear image of the PAN card

## KYC Status Flow

1. **not_submitted**: User hasn't submitted KYC documents
2. **pending**: KYC submitted and awaiting admin review
3. **approved**: KYC approved by admin
4. **rejected**: KYC rejected by admin

## Student KYC Endpoints

### POST /api/kyc/student/submit

Submit KYC documents for student verification.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `aadharNumber` (string, required): 12-digit Aadhar number (spaces and special characters will be automatically removed)
- `aadharCardImage` (file, required): Image file of Aadhar card

**Response:**
```json
{
  "success": true,
  "message": "KYC submitted successfully",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "aadharNumber": "123456789012",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/kyc/student/submit \
  -H "Authorization: Bearer your-jwt-token" \
  -F "aadharNumber=123456789012" \
  -F "aadharCardImage=@/path/to/aadhar-card.jpg"
```

### GET /api/kyc/student/status

Get KYC status for the authenticated student.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kycStatus": "pending",
    "kyc": {
      "id": "kyc-id",
      "aadharNumber": "123456789012",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "reviewedAt": null,
      "rejectionReason": null,
      "remarks": null,
      "reviewedBy": null
    }
  }
}
```

## Society Member KYC Endpoints

### POST /api/kyc/society-member/submit

Submit KYC documents for society member verification.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `aadharNumber` (string, required): 12-digit Aadhar number
- `panNumber` (string, required): PAN number in format ABCDE1234F
- `aadharCardImage` (file, required): Image file of Aadhar card
- `panCardImage` (file, required): Image file of PAN card

**Response:**
```json
{
  "success": true,
  "message": "KYC submitted successfully",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "aadharNumber": "123456789012",
      "panNumber": "ABCDE1234F",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/kyc/society-member/submit \
  -H "Authorization: Bearer your-jwt-token" \
  -F "aadharNumber=123456789012" \
  -F "panNumber=ABCDE1234F" \
  -F "aadharCardImage=@/path/to/aadhar-card.jpg" \
  -F "panCardImage=@/path/to/pan-card.jpg"
```

### GET /api/kyc/society-member/status

Get KYC status for the authenticated society member.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kycStatus": "pending",
    "kyc": {
      "id": "kyc-id",
      "aadharNumber": "123456789012",
      "panNumber": "ABCDE1234F",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "reviewedAt": null,
      "rejectionReason": null,
      "remarks": null,
      "reviewedBy": null
    }
  }
}
```

## Admin KYC Management Endpoints

### GET /api/kyc/admin/pending

Get all pending KYC requests (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studentKyc": [
      {
        "_id": "kyc-id",
        "studentId": {
          "_id": "student-id",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "student@example.com",
          "studentId": "STU001",
          "department": "Computer Science",
          "year": "3rd"
        },
        "aadharNumber": "123456789012",
        "aadharCardImage": "http://localhost:3000/uploads/aadharCardImage-1234567890.jpg",
        "status": "pending",
        "submittedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "societyMemberKyc": [
      {
        "_id": "kyc-id",
        "memberId": {
          "_id": "member-id",
          "firstName": "Bob",
          "lastName": "Johnson",
          "email": "member@example.com",
          "memberId": "MEM001",
          "societyName": "Tech Society",
          "position": "President"
        },
        "aadharNumber": "123456789012",
        "panNumber": "ABCDE1234F",
        "aadharCardImage": "http://localhost:3000/uploads/aadharCardImage-1234567890.jpg",
        "panCardImage": "http://localhost:3000/uploads/panCardImage-1234567890.jpg",
        "status": "pending",
        "submittedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalPending": 2
  }
}
```

### POST /api/kyc/admin/student/approve

Approve student KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "kycId": "kyc-id",
  "remarks": "Documents verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student KYC approved successfully",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "status": "approved",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "remarks": "Documents verified successfully"
    }
  }
}
```

### POST /api/kyc/admin/student/reject

Reject student KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "kycId": "kyc-id",
  "rejectionReason": "Aadhar card image is not clear or readable",
  "remarks": "Please resubmit with a clearer image"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student KYC rejected",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "status": "rejected",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "rejectionReason": "Aadhar card image is not clear or readable",
      "remarks": "Please resubmit with a clearer image"
    }
  }
}
```

### POST /api/kyc/admin/society-member/approve

Approve society member KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "kycId": "kyc-id",
  "remarks": "All documents verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Society member KYC approved successfully",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "status": "approved",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "remarks": "All documents verified successfully"
    }
  }
}
```

### POST /api/kyc/admin/society-member/reject

Reject society member KYC (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "kycId": "kyc-id",
  "rejectionReason": "PAN number does not match the PAN card image",
  "remarks": "Please verify the PAN number and resubmit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Society member KYC rejected",
  "data": {
    "kyc": {
      "id": "kyc-id",
      "status": "rejected",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "rejectionReason": "PAN number does not match the PAN card image",
      "remarks": "Please verify the PAN number and resubmit"
    }
  }
}
```

## File Upload Specifications

### Supported File Types
- **Images only**: JPEG, PNG, GIF, WebP
- **Maximum file size**: 5MB per file
- **Maximum files**: 1 for student KYC, 2 for society member KYC

### File Naming
Files are automatically renamed with timestamps to prevent conflicts:
- Format: `fieldname-timestamp-randomnumber.extension`
- Example: `aadharCardImage-1704067200000-123456789.jpg`

### File Storage
- Files are stored in AWS S3 bucket: `notes-market-bucket`
- Files are accessible via S3 public URLs
- Files are automatically deleted from S3 if KYC submission fails
- Files are organized in S3 with prefixes: `student-kyc/` and `society-member-kyc/`

## Validation Rules

### Aadhar Number
- Must be exactly 12 digits
- Must be unique across all KYC submissions
- Format: `123456789012`

### PAN Number (Society Members only)
- Must be in format: ABCDE1234F
- 5 letters + 4 digits + 1 letter
- Must be unique across all KYC submissions
- Example: `ABCDE1234F`

### File Validation
- Only image files are allowed
- Maximum file size: 5MB
- Required fields must have files uploaded

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Aadhar number must be exactly 12 digits",
    "PAN number must be in format: ABCDE1234F"
  ]
}
```

### File Upload Errors
```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```

```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB."
}
```

### Duplicate KYC
```json
{
  "success": false,
  "message": "KYC already submitted"
}
```

### Duplicate Document Numbers
```json
{
  "success": false,
  "message": "Aadhar number already registered"
}
```

```json
{
  "success": false,
  "message": "PAN number already registered"
}
```

## Security Features

### File Upload Security
- File type validation (images only)
- File size limits (5MB max)
- Automatic file cleanup on errors
- Unique filename generation

### Data Validation
- Input sanitization
- Format validation for document numbers
- Duplicate prevention
- Required field validation

### Access Control
- Authentication required for all endpoints
- Admin-only access for approval/rejection
- User can only access their own KYC status

## Best Practices

### For Users
1. **Image Quality**: Ensure documents are clearly visible and readable
2. **File Format**: Use common image formats (JPEG, PNG)
3. **File Size**: Keep files under 5MB for faster upload
4. **Document Numbers**: Double-check Aadhar and PAN numbers

### For Admins
1. **Review Process**: Carefully verify document authenticity
2. **Clear Feedback**: Provide specific rejection reasons
3. **Timely Processing**: Process KYC requests promptly
4. **Documentation**: Add helpful remarks for approved requests

### For Developers
1. **Error Handling**: Implement proper error handling for file uploads
2. **File Cleanup**: Ensure failed uploads are cleaned up
3. **Validation**: Validate all inputs before processing
4. **Security**: Implement proper access controls

## Integration Examples

### Frontend Integration (JavaScript)
```javascript
// Submit student KYC
const submitStudentKyc = async (aadharNumber, aadharCardFile) => {
  const formData = new FormData();
  formData.append('aadharNumber', aadharNumber);
  formData.append('aadharCardImage', aadharCardFile);
  
  const response = await fetch('/api/kyc/student/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return await response.json();
};

// Check KYC status
const checkKycStatus = async () => {
  const response = await fetch('/api/kyc/student/status', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return await response.json();
};
```

### Admin Approval (JavaScript)
```javascript
// Approve student KYC
const approveStudentKyc = async (kycId, remarks) => {
  const response = await fetch('/api/kyc/admin/student/approve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ kycId, remarks })
  });
  
  return await response.json();
};
```

This comprehensive KYC system ensures proper identity verification while maintaining security and user experience standards.
