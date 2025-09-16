# Admin Society Member Investment Management API

This document describes the comprehensive admin-side API for managing society member investments, including pending applications, approval/rejection workflow, and EMI tracking.

## Overview

The admin society member investment management system provides:
- **Pending Application Management**: View and manage pending investment applications
- **Approval/Rejection Workflow**: Approve or reject applications with reasons
- **Investment Tracking**: Monitor approved investments and their EMI schedules
- **EMI Management**: Record payments, apply penalties, and track overdue EMIs
- **Statistics & Reports**: Comprehensive reporting on EMI collections and performance

## API Endpoints

### Base URL
```
/api/admin/society-member-investment
```

### Authentication
All endpoints require admin authentication with Bearer token in Authorization header.

---

## 1. Investment Application Management

### Get Pending Investment Applications
```http
GET /api/admin/society-member-investment/applications/pending
```

### Get Approved Investment Applications
```http
GET /api/admin/society-member-investment/applications/approved
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `memberId` (optional): Filter by specific member ID
- `search` (optional): Search by member name, email, or member ID

**Response:**
```json
{
  "success": true,
  "message": "Approved investment applications retrieved successfully",
  "data": {
    "applications": [
      {
        "applicationId": "APP2412001",
        "status": "approved",
        "investmentAmount": 50000,
        "totalAmountPaid": 0,
        "remainingAmount": 50000,
        "paymentStatus": "pending",
        "emiProgress": {
          "total": 12,
          "paid": 0,
          "pending": 12,
          "overdue": 0
        },
        "member": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "memberId": "202411001"
        },
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD",
          "interestRate": 7.5,
          "tenureMonths": 12
        },
        "approvedBy": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "applicationDate": "2024-12-01T10:00:00.000Z",
        "approvalDate": "2024-12-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 3,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get All Investment Applications (by status)
```http
GET /api/admin/society-member-investment/applications
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, cancelled, completed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `memberId` (optional): Filter by specific member ID
- `search` (optional): Search by member name, email, or member ID

**Response:**
```json
{
  "success": true,
  "message": "Pending investment applications retrieved successfully",
  "data": {
    "applications": [
      {
        "applicationId": "APP2412001",
        "status": "pending",
        "investmentAmount": 50000,
        "totalAmountPaid": 0,
        "remainingAmount": 50000,
        "paymentStatus": "pending",
        "emiProgress": {
          "total": 12,
          "paid": 0,
          "pending": 12,
          "overdue": 0
        },
        "member": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "memberId": "202411001"
        },
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD",
          "interestRate": 7.5,
          "tenureMonths": 12
        },
        "applicationDate": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Investment Application Details
```http
GET /api/admin/society-member-investment/applications/:applicationId
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application details retrieved successfully",
  "data": {
    "application": {
      "applicationId": "APP2412001",
      "plan": {
        "planName": "Monthly Savings Plan",
        "planType": "RD",
        "interestRate": 7.5,
        "tenureMonths": 12
      },
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "memberId": "202411001",
        "phoneNumber": "+1234567890"
      },
      "investmentAmount": 50000,
      "monthlyEMI": 4167,
      "paymentMethod": "online",
      "status": "pending",
      "emiSchedule": [
        {
          "emiNumber": 1,
          "dueDate": "2024-12-01T00:00:00.000Z",
          "amount": 4167,
          "status": "pending"
        }
      ],
      "documents": [],
      "notes": []
    }
  }
}
```

### Approve Investment Application
```http
PATCH /api/admin/society-member-investment/applications/:applicationId/approve
```

**Request Body:**
```json
{
  "notes": "Application approved after verification of documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application approved successfully",
  "data": {
    "application": {
      "applicationId": "APP2412001",
      "status": "approved",
      "approvalDate": "2024-12-01T12:00:00.000Z",
      "approvedBy": "admin_id"
    },
    "investment": {
      "investmentId": "INV2412001",
      "status": "active",
      "principalAmount": 50000,
      "expectedMaturityAmount": 52000
    }
  }
}
```

### Reject Investment Application
```http
PATCH /api/admin/society-member-investment/applications/:applicationId/reject
```

**Request Body:**
```json
{
  "rejectionReason": "Incomplete documentation",
  "notes": "Please resubmit with complete KYC documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application rejected successfully",
  "data": {
    "application": {
      "applicationId": "APP2412001",
      "status": "rejected",
      "rejectionDate": "2024-12-01T12:00:00.000Z",
      "rejectionReason": "Incomplete documentation",
      "rejectedBy": "admin_id"
    }
  }
}
```

---

## 2. Investment Management

### Get Approved Investments
```http
GET /api/admin/society-member-investment/investments
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `planType` (optional): Filter by plan type
- `memberId` (optional): Filter by member ID
- `status` (optional): Filter by investment status
- `search` (optional): Search by member details

**Response:**
```json
{
  "success": true,
  "message": "Approved investments retrieved successfully",
  "data": {
    "investments": [
      {
        "investmentId": "INV2412001",
        "status": "active",
        "principalAmount": 50000,
        "expectedMaturityAmount": 52000,
        "totalInterestEarned": 0,
        "totalPenaltyPaid": 0,
        "emiProgress": {
          "total": 12,
          "paid": 3,
          "pending": 9,
          "overdue": 1
        },
        "member": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "memberId": "202411001"
        },
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD",
          "interestRate": 7.5,
          "tenureMonths": 12
        },
        "overdueEMIs": 1,
        "nextEMIDueDate": "2024-12-01T00:00:00.000Z",
        "emiSchedule": [
          {
            "emiNumber": 1,
            "dueDate": "2024-12-01T00:00:00.000Z",
            "amount": 4167,
            "status": "paid",
            "paidDate": "2024-12-01T10:00:00.000Z",
            "penaltyAmount": 0,
            "isOverdue": false
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalInvestments": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Investment Details
```http
GET /api/admin/society-member-investment/investments/:investmentId
```

**Response:**
```json
{
  "success": true,
  "message": "Investment details retrieved successfully",
  "data": {
    "investment": {
      "investmentId": "INV2412001",
      "plan": {
        "planName": "Monthly Savings Plan",
        "planType": "RD",
        "interestRate": 7.5,
        "tenureMonths": 12
      },
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "memberId": "202411001"
      },
      "principalAmount": 50000,
      "monthlyInstallment": 4167,
      "expectedMaturityAmount": 52000,
      "status": "active",
      "investmentDate": "2024-12-01T10:00:00.000Z",
      "maturityDate": "2025-12-01T10:00:00.000Z",
      "emiSchedule": [
        {
          "emiNumber": 1,
          "dueDate": "2024-12-01T00:00:00.000Z",
          "amount": 4167,
          "status": "paid",
          "paidDate": "2024-12-01T10:00:00.000Z",
          "penaltyAmount": 0,
          "isOverdue": false,
          "daysOverdue": 0
        }
      ],
      "paymentHistory": [
        {
          "date": "2024-12-01T10:00:00.000Z",
          "amount": 4167,
          "paymentType": "emi",
          "emiNumber": 1,
          "transactionId": "TXN123456",
          "remarks": "Monthly EMI payment"
        }
      ],
      "penaltyHistory": [],
      "summary": {
        "totalEMIs": 12,
        "paidEMIs": 3,
        "pendingEMIs": 9,
        "overdueEMIs": 1,
        "completionPercentage": 25
      }
    }
  }
}
```

---

## 3. EMI Management

### Record EMI Payment
```http
POST /api/admin/society-member-investment/investments/:investmentId/emi-payment
```

**Request Body:**
```json
{
  "emiNumber": 2,
  "amount": 4167,
  "paymentMethod": "online",
  "transactionId": "TXN123457",
  "remarks": "Monthly EMI payment received"
}
```

**Response:**
```json
{
  "success": true,
  "message": "EMI payment recorded successfully",
  "data": {
    "investmentId": "INV2412001",
    "emiNumber": 2,
    "amount": 4167,
    "paymentMethod": "online",
    "transactionId": "TXN123457",
    "paidDate": "2024-12-01T12:00:00.000Z"
  }
}
```

### Apply Penalty for Overdue EMI
```http
POST /api/admin/society-member-investment/investments/:investmentId/penalty
```

**Request Body:**
```json
{
  "emiNumber": 3,
  "penaltyAmount": 100,
  "reason": "Late payment penalty for EMI #3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Penalty applied successfully",
  "data": {
    "investmentId": "INV2412001",
    "emiNumber": 3,
    "penaltyAmount": 100,
    "reason": "Late payment penalty for EMI #3",
    "totalPenaltyPaid": 100
  }
}
```

---

## 4. Statistics & Reports

### Get EMI Statistics
```http
GET /api/admin/society-member-investment/statistics/emi
```

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year) - default: month
- `planType` (optional): Filter by plan type
- `memberId` (optional): Filter by member ID

**Response:**
```json
{
  "success": true,
  "message": "EMI statistics retrieved successfully",
  "data": {
    "period": "month",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "summary": {
      "totalEMIs": 120,
      "paidEMIs": 95,
      "pendingEMIs": 25,
      "overdueEMIs": 8,
      "collectionEfficiency": 79,
      "totalEMIAmount": 500000,
      "totalPaidAmount": 395833,
      "totalPenaltyAmount": 800,
      "pendingAmount": 104167
    },
    "overdueDetails": [
      {
        "investmentId": "INV2412001",
        "member": {
          "firstName": "John",
          "lastName": "Doe",
          "memberId": "202411001"
        },
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "emiNumber": 3,
        "dueDate": "2024-11-01T00:00:00.000Z",
        "amount": 4167,
        "daysOverdue": 30
      }
    ],
    "breakdown": {
      "byPlan": {
        "RD": {
          "total": 80,
          "paid": 65,
          "pending": 15,
          "overdue": 5
        },
        "FD": {
          "total": 40,
          "paid": 30,
          "pending": 10,
          "overdue": 3
        }
      }
    }
  }
}
```

---

## Society Member Enhanced Endpoints

### Get All Investment Data
```http
GET /api/society-member/investment-applications/data/all
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "All investment data retrieved successfully",
  "data": {
    "investments": [
      {
        "type": "application",
        "applicationId": "APP2412001",
        "status": "pending",
        "investmentAmount": 50000,
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "applicationDate": "2024-12-01T10:00:00.000Z"
      },
      {
        "type": "investment",
        "investmentId": "INV2412001",
        "status": "active",
        "principalAmount": 50000,
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "overdueEMIs": 1,
        "nextEMIDueDate": "2024-12-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "totalApplications": 3,
      "pendingApplications": 1,
      "approvedApplications": 2,
      "rejectedApplications": 0,
      "totalInvestments": 2,
      "activeInvestments": 2,
      "completedInvestments": 0,
      "totalEMIs": 24,
      "paidEMIs": 6,
      "pendingEMIs": 18,
      "overdueEMIs": 2
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Pending Status
```http
GET /api/society-member/investment-applications/status/pending
```

**Response:**
```json
{
  "success": true,
  "message": "Pending status retrieved successfully",
  "data": {
    "pendingApplications": [
      {
        "applicationId": "APP2412001",
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "investmentAmount": 50000,
        "monthlyEMI": 4167,
        "applicationDate": "2024-12-01T10:00:00.000Z",
        "daysPending": 5
      }
    ],
    "pendingPayments": [
      {
        "investmentId": "INV2412001",
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "principalAmount": 50000,
        "monthlyInstallment": 4167,
        "pendingEMIs": 9,
        "overdueEMIs": 1,
        "nextEMIDueDate": "2024-12-01T00:00:00.000Z",
        "totalPendingAmount": 37503,
        "overdueAmount": 4167,
        "emiDetails": [
          {
            "emiNumber": 2,
            "dueDate": "2024-12-01T00:00:00.000Z",
            "amount": 4167,
            "isOverdue": true,
            "daysOverdue": 5
          }
        ]
      }
    ],
    "summary": {
      "pendingApplications": 1,
      "activeInvestments": 2,
      "totalPendingEMIs": 18,
      "totalOverdueEMIs": 2,
      "totalPendingAmount": 75006,
      "totalOverdueAmount": 8334
    }
  }
}
```

### Get EMI List
```http
GET /api/society-member/investment-applications/emis/list
```

**Query Parameters:**
- `status` (optional): Filter by EMI status (pending, paid, overdue)
- `investmentId` (optional): Filter by specific investment ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "EMI list retrieved successfully",
  "data": {
    "emis": [
      {
        "investmentId": "INV2412001",
        "plan": {
          "planName": "Monthly Savings Plan",
          "planType": "RD"
        },
        "emiNumber": 1,
        "dueDate": "2024-12-01T00:00:00.000Z",
        "amount": 4167,
        "status": "paid",
        "paidDate": "2024-12-01T10:00:00.000Z",
        "penaltyAmount": 0,
        "isOverdue": false,
        "daysOverdue": 0
      }
    ],
    "statistics": {
      "totalEMIs": 24,
      "paidEMIs": 6,
      "pendingEMIs": 18,
      "overdueEMIs": 2,
      "totalAmount": 100000,
      "paidAmount": 25002,
      "pendingAmount": 74998,
      "overdueAmount": 8334,
      "totalPenalty": 200
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalEMIs": 24,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Business Logic

### Investment Approval Process
1. **Application Submission**: Society member submits investment application
2. **Admin Review**: Admin reviews application and documents
3. **Approval/Rejection**: Admin approves or rejects with reason
4. **Investment Creation**: Approved applications automatically create investment records
5. **EMI Schedule**: EMI schedule is generated based on plan type and tenure

### EMI Management
1. **EMI Generation**: EMIs are automatically generated for RD plans
2. **Payment Recording**: Admin records EMI payments with transaction details
3. **Penalty Application**: Penalties are applied for overdue EMIs
4. **Status Tracking**: EMI status is updated (pending, paid, overdue, penalty_applied)

### Automatic Calculations
- **Principal Amount**: Based on investment amount for FD/CD, monthly EMI × tenure for RD
- **Maturity Amount**: Calculated using compound interest formula
- **EMI Schedule**: Generated based on plan tenure and monthly installment
- **Penalty Calculation**: Applied based on plan penalty configuration

---

## Security Features

- **Admin Authentication**: All admin endpoints require valid admin JWT token
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API endpoints have rate limiting protection
- **Audit Trail**: All actions are logged with admin ID and timestamp
- **Data Encryption**: Sensitive data is encrypted in transit and at rest

---

## Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Frequently accessed data is cached
- **Optimized Queries**: Efficient database queries with proper joins
- **Response Compression**: API responses are compressed for better performance
