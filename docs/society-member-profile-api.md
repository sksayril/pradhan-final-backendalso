# Society Member Profile API Documentation

## Overview

The Society Member Profile API provides comprehensive access to a member's personal information, account summary, recent activity, and profile completeness status. This API serves as a central hub for all member-related data and account insights.

## Table of Contents

1. [Profile API](#profile-api)
2. [Response Structure](#response-structure)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

## Profile API

### Get Society Member Profile

**Endpoint:** `GET /api/society-member/profile`

**Description:** Retrieves comprehensive profile information including personal details, society information, KYC status, account summary, recent activity, and profile completeness.

**Authentication:** Required (JWT token)
**Authorization:** societyMember role

**Response:**
```json
{
  "success": true,
  "message": "Member profile retrieved successfully",
  "data": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202501001",
      "email": "john.doe@example.com",
      "phoneNumber": "+919876543210",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "gender": "male",
      "address": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "emergencyContact": "Jane Doe",
      "emergencyPhone": "+919876543211",
      "profilePicture": "https://s3.amazonaws.com/bucket/profile-pictures/member-123.jpg"
    },
    "societyInfo": {
      "societyName": "Sample Society",
      "societyCode": "SS001",
      "position": "Member",
      "joiningDate": "2024-01-01T00:00:00.000Z",
      "membershipType": "regular",
      "isActive": true,
      "isVerified": true
    },
    "kycInfo": {
      "kycStatus": "approved",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "verifiedAt": "2024-01-16T14:20:00.000Z",
      "documents": [
        {
          "documentType": "identity_proof",
          "documentName": "Aadhaar Card",
          "documentUrl": "https://s3.amazonaws.com/bucket/kyc-documents/aadhaar-123.pdf",
          "uploadedAt": "2024-01-15T10:30:00.000Z"
        },
        {
          "documentType": "address_proof",
          "documentName": "Electricity Bill",
          "documentUrl": "https://s3.amazonaws.com/bucket/kyc-documents/electricity-123.pdf",
          "uploadedAt": "2024-01-15T10:35:00.000Z"
        }
      ],
      "remarks": "All documents verified successfully"
    },
    "accountSummary": {
      "loans": {
        "totalLoans": 2,
        "totalLoanAmount": 100000,
        "totalDisbursedAmount": 50000,
        "pendingLoans": 1,
        "approvedLoans": 0,
        "disbursedLoans": 1
      },
      "investments": {
        "totalInvestments": 1,
        "totalInvestmentAmount": 50000,
        "totalMaturityAmount": 60000,
        "activeInvestments": 1,
        "completedInvestments": 0
      },
      "emis": {
        "totalEMIs": 13,
        "paidEMIs": 0,
        "pendingEMIs": 13,
        "overdueEMIs": 0,
        "totalEMIAmount": 65000,
        "totalPaidAmount": 0,
        "totalPendingAmount": 65000,
        "paymentRate": 0
      },
      "payments": {
        "totalPayments": 1,
        "successfulPayments": 0,
        "pendingPayments": 1,
        "totalPaidAmount": 0,
        "successRate": 0
      }
    },
    "recentActivity": [
      {
        "type": "loan_application",
        "title": "Loan Application",
        "description": "Applied for ₹50000 loan for Personal",
        "status": "disbursed",
        "date": "2025-01-15T10:30:00.000Z",
        "referenceId": "LOAN2509001"
      },
      {
        "type": "payment",
        "title": "Payment Made",
        "description": "Payment of ₹5000 via cash",
        "status": "pending",
        "date": "2025-01-15T10:30:00.000Z",
        "referenceId": "PAY75048993"
      },
      {
        "type": "investment",
        "title": "Investment Made",
        "description": "Invested ₹50000 in Monthly RD Plan",
        "status": "active",
        "date": "2024-01-01T00:00:00.000Z",
        "referenceId": "INV861786"
      }
    ],
    "profileCompleteness": {
      "percentage": 85,
      "completedFields": 10,
      "totalFields": 11,
      "missingFields": ["emergencyPhone"]
    },
    "memberStatus": {
      "isActive": true,
      "isVerified": true,
      "kycStatus": "approved",
      "hasProfilePicture": true,
      "hasCompleteProfile": true,
      "canApplyForLoan": true,
      "canMakeInvestments": true,
      "canMakePayments": true,
      "overallStatus": "active",
      "statusMessage": "Account is fully active"
    },
    "lastLogin": "2025-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Response Structure

### Personal Information
- **firstName**: Member's first name
- **lastName**: Member's last name
- **memberId**: Unique member identifier
- **email**: Member's email address
- **phoneNumber**: Member's phone number
- **dateOfBirth**: Member's date of birth
- **gender**: Member's gender
- **address**: Member's address
- **city**: Member's city
- **state**: Member's state
- **pincode**: Member's pincode
- **emergencyContact**: Emergency contact name
- **emergencyPhone**: Emergency contact phone
- **profilePicture**: URL to profile picture

### Society Information
- **societyName**: Name of the society
- **societyCode**: Society code
- **position**: Member's position in society
- **joiningDate**: Date when member joined
- **membershipType**: Type of membership
- **isActive**: Whether member account is active
- **isVerified**: Whether member account is verified

### KYC Information
- **kycStatus**: KYC verification status (not_submitted, pending, approved, rejected)
- **submittedAt**: When KYC was submitted
- **verifiedAt**: When KYC was verified
- **documents**: Array of uploaded documents
- **remarks**: Admin remarks on KYC

### Account Summary

#### Loans
- **totalLoans**: Total number of loan applications
- **totalLoanAmount**: Total amount of all loans
- **totalDisbursedAmount**: Total amount disbursed
- **pendingLoans**: Number of pending loan applications
- **approvedLoans**: Number of approved loans
- **disbursedLoans**: Number of disbursed loans

#### Investments
- **totalInvestments**: Total number of investments
- **totalInvestmentAmount**: Total amount invested
- **totalMaturityAmount**: Expected maturity amount
- **activeInvestments**: Number of active investments
- **completedInvestments**: Number of completed investments

#### EMIs
- **totalEMIs**: Total number of EMIs
- **paidEMIs**: Number of paid EMIs
- **pendingEMIs**: Number of pending EMIs
- **overdueEMIs**: Number of overdue EMIs
- **totalEMIAmount**: Total EMI amount
- **totalPaidAmount**: Total amount paid
- **totalPendingAmount**: Total amount pending
- **paymentRate**: Payment success rate percentage

#### Payments
- **totalPayments**: Total number of payments
- **successfulPayments**: Number of successful payments
- **pendingPayments**: Number of pending payments
- **totalPaidAmount**: Total amount paid
- **successRate**: Payment success rate percentage

### Recent Activity
Array of recent activities including:
- **type**: Activity type (loan_application, payment, investment)
- **title**: Activity title
- **description**: Activity description
- **status**: Activity status
- **date**: Activity date
- **referenceId**: Reference ID for the activity

### Profile Completeness
- **percentage**: Profile completion percentage
- **completedFields**: Number of completed fields
- **totalFields**: Total number of fields
- **missingFields**: Array of missing field names

### Member Status
- **isActive**: Whether account is active
- **isVerified**: Whether account is verified
- **kycStatus**: KYC verification status
- **hasProfilePicture**: Whether profile picture is uploaded
- **hasCompleteProfile**: Whether profile is complete (≥80%)
- **canApplyForLoan**: Whether member can apply for loans
- **canMakeInvestments**: Whether member can make investments
- **canMakePayments**: Whether member can make payments
- **overallStatus**: Overall account status
- **statusMessage**: Status message

## Data Models

### Personal Information Model
```javascript
{
  firstName: String,
  lastName: String,
  memberId: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  emergencyContact: String,
  emergencyPhone: String,
  profilePicture: String
}
```

### Society Information Model
```javascript
{
  societyName: String,
  societyCode: String,
  position: String,
  joiningDate: Date,
  membershipType: String,
  isActive: Boolean,
  isVerified: Boolean
}
```

### KYC Information Model
```javascript
{
  kycStatus: String, // not_submitted, pending, approved, rejected
  submittedAt: Date,
  verifiedAt: Date,
  documents: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadedAt: Date
  }],
  remarks: String
}
```

### Account Summary Model
```javascript
{
  loans: {
    totalLoans: Number,
    totalLoanAmount: Number,
    totalDisbursedAmount: Number,
    pendingLoans: Number,
    approvedLoans: Number,
    disbursedLoans: Number
  },
  investments: {
    totalInvestments: Number,
    totalInvestmentAmount: Number,
    totalMaturityAmount: Number,
    activeInvestments: Number,
    completedInvestments: Number
  },
  emis: {
    totalEMIs: Number,
    paidEMIs: Number,
    pendingEMIs: Number,
    overdueEMIs: Number,
    totalEMIAmount: Number,
    totalPaidAmount: Number,
    totalPendingAmount: Number,
    paymentRate: Number
  },
  payments: {
    totalPayments: Number,
    successfulPayments: Number,
    pendingPayments: Number,
    totalPaidAmount: Number,
    successRate: Number
  }
}
```

### Recent Activity Model
```javascript
{
  type: String, // loan_application, payment, investment
  title: String,
  description: String,
  status: String,
  date: Date,
  referenceId: String
}
```

### Profile Completeness Model
```javascript
{
  percentage: Number,
  completedFields: Number,
  totalFields: Number,
  missingFields: [String]
}
```

### Member Status Model
```javascript
{
  isActive: Boolean,
  isVerified: Boolean,
  kycStatus: String,
  hasProfilePicture: Boolean,
  hasCompleteProfile: Boolean,
  canApplyForLoan: Boolean,
  canMakeInvestments: Boolean,
  canMakePayments: Boolean,
  overallStatus: String,
  statusMessage: String
}
```

## Error Handling

### Common Error Responses

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Access denied. Invalid token."
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Member not found"
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

## Examples

### Get Member Profile
```bash
curl -X GET http://localhost:3000/api/society-member/profile \
  -H "Authorization: Bearer <jwt_token>"
```

### Response for New Member
```json
{
  "success": true,
  "message": "Member profile retrieved successfully",
  "data": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202501001",
      "email": "john.doe@example.com",
      "phoneNumber": "+919876543210",
      "dateOfBirth": null,
      "gender": null,
      "address": null,
      "city": null,
      "state": null,
      "pincode": null,
      "emergencyContact": null,
      "emergencyPhone": null,
      "profilePicture": null
    },
    "societyInfo": {
      "societyName": "Sample Society",
      "societyCode": "SS001",
      "position": "Member",
      "joiningDate": "2024-01-01T00:00:00.000Z",
      "membershipType": "regular",
      "isActive": true,
      "isVerified": true
    },
    "kycInfo": null,
    "accountSummary": {
      "loans": {
        "totalLoans": 0,
        "totalLoanAmount": 0,
        "totalDisbursedAmount": 0,
        "pendingLoans": 0,
        "approvedLoans": 0,
        "disbursedLoans": 0
      },
      "investments": {
        "totalInvestments": 0,
        "totalInvestmentAmount": 0,
        "totalMaturityAmount": 0,
        "activeInvestments": 0,
        "completedInvestments": 0
      },
      "emis": {
        "totalEMIs": 0,
        "paidEMIs": 0,
        "pendingEMIs": 0,
        "overdueEMIs": 0,
        "totalEMIAmount": 0,
        "totalPaidAmount": 0,
        "totalPendingAmount": 0,
        "paymentRate": 0
      },
      "payments": {
        "totalPayments": 0,
        "successfulPayments": 0,
        "pendingPayments": 0,
        "totalPaidAmount": 0,
        "successRate": 0
      }
    },
    "recentActivity": [],
    "profileCompleteness": {
      "percentage": 27,
      "completedFields": 3,
      "totalFields": 11,
      "missingFields": ["dateOfBirth", "gender", "address", "city", "state", "pincode", "emergencyContact", "emergencyPhone", "profilePicture"]
    },
    "memberStatus": {
      "isActive": true,
      "isVerified": true,
      "kycStatus": "not_submitted",
      "hasProfilePicture": false,
      "hasCompleteProfile": false,
      "canApplyForLoan": false,
      "canMakeInvestments": false,
      "canMakePayments": true,
      "overallStatus": "kyc_required",
      "statusMessage": "KYC verification is required"
    },
    "lastLogin": "2025-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Route Registration Status

✅ **Route is properly registered in app.js:**
- `/api/society-member/profile` → Profile API

## Summary

The Society Member Profile API provides:

1. **Complete Personal Information**: All member details and contact information
2. **Society Information**: Membership details and status
3. **KYC Status**: Verification status and documents
4. **Account Summary**: Comprehensive financial overview
5. **Recent Activity**: Timeline of member actions
6. **Profile Completeness**: Progress tracking for profile completion
7. **Member Status**: Account permissions and capabilities
8. **Real-time Data**: Up-to-date information from all related systems

This API serves as the central hub for member profile information and is essential for frontend applications to display comprehensive member dashboards and profile pages.
