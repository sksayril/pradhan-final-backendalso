# Society Member Investment Application System

This document provides comprehensive documentation for the Society Member Investment Application System, including investment applications, EMI-based payments, approval workflows, and payment options (cash/online).

## Table of Contents

1. [Overview](#overview)
2. [Investment Application Process](#investment-application-process)
3. [Payment Options](#payment-options)
4. [EMI Management](#emi-management)
5. [Society Member APIs](#society-member-apis)
6. [Admin Approval APIs](#admin-approval-apis)
7. [Examples](#examples)
8. [Error Handling](#error-handling)

## Overview

The Society Member Investment Application System provides a complete workflow for society members to apply for investments, make EMI-based payments, and track their investment progress. The system includes:

- **Investment Applications**: Complete application process with approval workflow
- **EMI-Based Payments**: Monthly installment tracking for RD plans
- **Payment Options**: Cash and online payment methods
- **Admin Approval**: Complete approval/rejection workflow for administrators
- **Payment Tracking**: Detailed payment history and EMI schedule management
- **Document Management**: Upload and manage investment-related documents
- **Auto-Generated Plan IDs**: Investment plans automatically get unique plan IDs in format `PLAN2511001`

## Investment Application Process

### 1. Application Submission
- Society members can apply for any available investment plan
- Applications include investment amount, payment method, and EMI details
- Terms and conditions acceptance is required

### 2. Admin Review
- Administrators review applications and can approve or reject them
- Rejection reasons can be provided for transparency
- Notes can be added to applications for internal tracking

### 3. Payment Processing
- Once approved, members can make payments (cash or online)
- EMI schedule is automatically generated for RD plans
- Payment history is maintained for complete tracking

### 4. Investment Management
- Complete investment tracking with EMI schedules
- Payment status monitoring
- Document management for investment records

## Payment Options

### Cash Payments
- Physical cash payments recorded by administrators
- Transaction ID can be provided for reference
- Receipt generation for cash payments

### Online Payments
- Digital payment processing
- Transaction ID tracking for online payments
- Integration with payment gateways (extensible)

### Payment Methods
```json
{
  "paymentMethod": "cash",     // or "online" or "both"
  "transactionId": "TXN123456",
  "amount": 5000,
  "remarks": "Monthly EMI payment"
}
```

## EMI Management

### EMI Schedule Generation
- Automatic EMI schedule creation for RD plans
- Due dates calculated based on application date
- Monthly installment amounts based on plan configuration

### EMI Status Tracking
- **Pending**: EMI not yet paid
- **Paid**: EMI paid on time
- **Overdue**: EMI past due date
- **Cancelled**: EMI cancelled due to plan changes

### EMI Payment Processing
- Individual EMI payments can be recorded
- Payment method tracking (cash/online)
- Transaction ID association
- Penalty calculation for overdue payments

## Society Member APIs

### Investment Application Management

#### GET /api/society-member/investment-applications/plans
Get available investment plans for society members.

**Query Parameters:**
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `minAmount` (optional): Minimum amount filter
- `maxAmount` (optional): Maximum amount filter

**Response:**
```json
{
  "success": true,
  "message": "Available investment plans retrieved successfully",
  "data": {
    "plans": [
      {
         "_id": "plan_id",
         "planId": "PLAN2511001",
         "planName": "Premium FD Plan",
        "planType": "FD",
        "description": "High interest fixed deposit plan",
        "minimumAmount": 10000,
        "maximumAmount": 1000000,
        "interestRate": 8.5,
        "tenureMonths": 24,
        "compoundingFrequency": "quarterly",
        "emiCostStructure": {
          "planType": "FD",
          "costStructure": {
            "minimumInvestment": 10000,
            "maximumInvestment": 1000000,
            "investmentIncrements": 1000
          }
        },
        "sampleEMICosts": [
          {
            "planType": "FD",
            "principalAmount": 10000,
            "maturityAmount": 11800,
            "totalInterest": 1800,
            "monthlyInterest": 75
          }
        ]
      }
    ]
  }
}
```

#### GET /api/society-member/investment-applications
Get all investment applications for the authenticated society member with available plans.

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, cancelled, completed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Investment applications retrieved successfully",
  "data": {
    "applications": [
      {
        "applicationId": "APP2511001",
        "status": "approved",
        "investmentAmount": 100000,
        "totalAmountPaid": 25000,
        "remainingAmount": 75000,
        "paymentStatus": "partial",
        "emiProgress": {
          "total": 24,
          "paid": 6,
          "pending": 18,
          "overdue": 0
        },
        "applicationDate": "2025-11-01T10:30:00.000Z",
        "approvalDate": "2025-11-02T14:20:00.000Z"
      }
    ],
    "availablePlans": [
      {
         "_id": "plan_id",
         "planId": "PLAN2511001",
         "planName": "Premium FD Plan",
        "planType": "FD",
        "description": "High interest fixed deposit plan",
        "minimumAmount": 10000,
        "maximumAmount": 1000000,
        "interestRate": 8.5,
        "tenureMonths": 24,
        "compoundingFrequency": "quarterly",
        "emiCostStructure": {
          "planType": "FD",
          "costStructure": {
            "minimumInvestment": 10000,
            "maximumInvestment": 1000000,
            "investmentIncrements": 1000
          }
        },
        "sampleEMICosts": [
          {
            "planType": "FD",
            "principalAmount": 10000,
            "maturityAmount": 11800,
            "totalInterest": 1800,
            "monthlyInterest": 75
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/society-member/investment-applications/:applicationId
Get detailed information about a specific investment application.

**Response:**
```json
{
  "success": true,
  "message": "Investment application details retrieved successfully",
  "data": {
    "application": {
      "applicationId": "APP2511001",
      "plan": {
        "planName": "Premium RD Plan",
        "planType": "RD",
        "interestRate": 8.5,
        "tenureMonths": 24
      },
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "memberId": "202511001"
      },
      "investmentAmount": 100000,
      "monthlyEMI": 5000,
      "paymentMethod": "online",
      "status": "approved",
      "paymentStatus": "partial",
      "totalAmountPaid": 25000,
      "remainingAmount": 75000,
      "applicationDate": "2025-11-01T10:30:00.000Z",
      "approvalDate": "2025-11-02T14:20:00.000Z",
      "emiSchedule": [
        {
          "emiNumber": 1,
          "dueDate": "2025-12-01T00:00:00.000Z",
          "amount": 5000,
          "status": "paid",
          "paidDate": "2025-11-30T10:30:00.000Z",
          "paymentMethod": "online",
          "transactionId": "TXN123456",
          "penaltyAmount": 0,
          "remarks": "Paid on time",
          "isOverdue": false
        }
      ],
      "paymentHistory": [
        {
          "date": "2025-11-30T10:30:00.000Z",
          "amount": 5000,
          "paymentMethod": "online",
          "transactionId": "TXN123456",
          "emiNumber": 1,
          "status": "success",
          "remarks": "Monthly EMI payment"
        }
      ],
      "documents": [],
      "notes": [],
      "termsAccepted": true,
      "termsAcceptedDate": "2025-11-01T10:30:00.000Z"
    }
  }
}
```

#### POST /api/society-member/investment-applications/apply
Apply for a new investment.

**Request Body:**
```json
{
  "planId": "plan_id",
  "investmentAmount": 100000,
  "monthlyEMI": 5000,
  "paymentMethod": "online",
  "termsAccepted": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application submitted successfully",
  "data": {
    "application": {
      "applicationId": "APP2511001",
      "planName": "Premium RD Plan",
      "planType": "RD",
      "investmentAmount": 100000,
      "monthlyEMI": 5000,
      "paymentMethod": "online",
      "status": "pending",
      "applicationDate": "2025-11-01T10:30:00.000Z"
    }
  }
}
```

#### PATCH /api/society-member/investment-applications/:applicationId/cancel
Cancel a pending investment application.

**Response:**
```json
{
  "success": true,
  "message": "Investment application cancelled successfully"
}
```

### Payment Management

#### POST /api/society-member/investment-applications/:applicationId/payment
Make a payment for an approved investment application.

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "online",
  "emiNumber": 2,
  "transactionId": "TXN789012",
  "remarks": "Monthly EMI payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "applicationId": "APP2511001",
    "amount": 5000,
    "paymentMethod": "online",
    "totalAmountPaid": 30000,
    "remainingAmount": 70000,
    "paymentStatus": "partial"
  }
}
```

#### GET /api/society-member/investment-applications/:applicationId/emi-schedule
Get EMI schedule for an investment application.

**Response:**
```json
{
  "success": true,
  "message": "EMI schedule retrieved successfully",
  "data": {
    "applicationId": "APP2511001",
    "planName": "Premium RD Plan",
    "planType": "RD",
    "summary": {
      "totalEMIs": 24,
      "paidEMIs": 6,
      "pendingEMIs": 18,
      "overdueEMIs": 0
    },
    "emiSchedule": [
      {
        "emiNumber": 1,
        "dueDate": "2025-12-01T00:00:00.000Z",
        "amount": 5000,
        "status": "paid",
        "paidDate": "2025-11-30T10:30:00.000Z",
        "paymentMethod": "online",
        "transactionId": "TXN123456",
        "penaltyAmount": 0,
        "remarks": "Paid on time",
        "isOverdue": false
      }
    ]
  }
}
```

#### GET /api/society-member/investment-applications/:applicationId/payment-history
Get payment history for an investment application.

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "applicationId": "APP2511001",
    "totalAmountPaid": 30000,
    "remainingAmount": 70000,
    "paymentStatus": "partial",
    "paymentHistory": [
      {
        "date": "2025-11-30T10:30:00.000Z",
        "amount": 5000,
        "paymentMethod": "online",
        "transactionId": "TXN123456",
        "emiNumber": 1,
        "status": "success",
        "remarks": "Monthly EMI payment"
      }
    ]
  }
}
```

## Admin Approval APIs

### Application Management

#### GET /api/admin/investment-approval/applications
Get all investment applications for admin review.

**Query Parameters:**
- `status` (optional): Filter by status
- `planId` (optional): Filter by plan
- `memberId` (optional): Filter by member
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Investment applications retrieved successfully",
  "data": {
    "applications": [
      {
        "applicationId": "APP2511001",
        "status": "pending",
        "investmentAmount": 100000,
        "totalAmountPaid": 0,
        "remainingAmount": 100000,
        "paymentStatus": "pending",
        "emiProgress": {
          "total": 24,
          "paid": 0,
          "pending": 24,
          "overdue": 0
        },
        "applicationDate": "2025-11-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/admin/investment-approval/applications/:applicationId
Get detailed investment application information for admin review.

**Response:**
```json
{
  "success": true,
  "message": "Investment application details retrieved successfully",
  "data": {
    "application": {
      "applicationId": "APP2511001",
      "plan": {
        "planName": "Premium RD Plan",
        "planType": "RD",
        "interestRate": 8.5,
        "tenureMonths": 24
      },
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "memberId": "202511001",
        "phoneNumber": "+1234567890",
        "address": "123 Main St, City, State"
      },
      "investmentAmount": 100000,
      "monthlyEMI": 5000,
      "paymentMethod": "online",
      "status": "pending",
      "paymentStatus": "pending",
      "totalAmountPaid": 0,
      "remainingAmount": 100000,
      "applicationDate": "2025-11-01T10:30:00.000Z",
      "emiSchedule": [
        {
          "emiNumber": 1,
          "dueDate": "2025-12-01T00:00:00.000Z",
          "amount": 5000,
          "status": "pending",
          "isOverdue": false
        }
      ],
      "paymentHistory": [],
      "documents": [],
      "notes": [],
      "termsAccepted": true,
      "termsAcceptedDate": "2025-11-01T10:30:00.000Z"
    }
  }
}
```

#### PATCH /api/admin/investment-approval/applications/:applicationId/approve
Approve an investment application.

**Request Body:**
```json
{
  "notes": "Application approved after verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application approved successfully",
  "data": {
    "application": {
      "applicationId": "APP2511001",
      "status": "approved",
      "approvalDate": "2025-11-02T14:20:00.000Z"
    },
    "investment": {
      "investmentId": "INV2511001",
      "principalAmount": 100000,
      "expectedMaturityAmount": 130000
    }
  }
}
```

#### PATCH /api/admin/investment-approval/applications/:applicationId/reject
Reject an investment application.

**Request Body:**
```json
{
  "reason": "Insufficient documentation provided",
  "notes": "Please provide additional income proof"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment application rejected successfully",
  "data": {
    "application": {
      "applicationId": "APP2511001",
      "status": "rejected",
      "rejectionDate": "2025-11-02T14:20:00.000Z",
      "rejectionReason": "Insufficient documentation provided"
    }
  }
}
```

#### POST /api/admin/investment-approval/applications/:applicationId/payment
Record a payment for an approved investment application.

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "cash",
  "emiNumber": 1,
  "transactionId": "CASH001",
  "remarks": "Cash payment received"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "applicationId": "APP2511001",
    "amount": 5000,
    "paymentMethod": "cash",
    "totalAmountPaid": 5000,
    "remainingAmount": 95000,
    "paymentStatus": "partial"
  }
}
```

#### POST /api/admin/investment-approval/applications/:applicationId/notes
Add a note to an investment application.

**Request Body:**
```json
{
  "note": "Member requested early payment option"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "applicationId": "APP2511001",
    "note": {
      "date": "2025-11-02T14:20:00.000Z",
      "note": "Member requested early payment option",
      "addedBy": "admin_id"
    }
  }
}
```

#### GET /api/admin/investment-approval/statistics
Get investment application statistics.

**Response:**
```json
{
  "success": true,
  "message": "Application statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalApplications": 150,
      "pendingApplications": 25,
      "approvedApplications": 100,
      "rejectedApplications": 20,
      "completedApplications": 5,
      "totalInvestmentAmount": 15000000,
      "totalAmountPaid": 5000000,
      "emiStatistics": {
        "totalEMIs": 2400,
        "paidEMIs": 800,
        "pendingEMIs": 1600,
        "overdueEMIs": 50
      }
    }
  }
}
```

### Society Member Investment Management

#### GET /api/admin/investment-approval/investments
Get all society member investments (created investments).

**Query Parameters:**
- `status` (optional): Filter by status (active, completed, cancelled, defaulted)
- `planId` (optional): Filter by plan
- `memberId` (optional): Filter by member
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Society member investments retrieved successfully",
  "data": {
    "investments": [
      {
        "investmentId": "INV2511001",
        "planName": "Premium RD Plan",
        "planType": "RD",
        "memberName": "John Doe",
        "memberId": "202511001",
        "principalAmount": 100000,
        "expectedMaturityAmount": 130000,
        "status": "active",
        "investmentDate": "2025-11-01T10:30:00.000Z",
        "maturityDate": "2027-11-01T10:30:00.000Z",
        "totalInterestEarned": 5000,
        "totalPenaltyPaid": 0,
        "emiProgress": {
          "total": 24,
          "paid": 6,
          "pending": 18,
          "overdue": 0
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalInvestments": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/admin/investment-approval/investments/:investmentId
Get detailed society member investment information.

**Response:**
```json
{
  "success": true,
  "message": "Society member investment details retrieved successfully",
  "data": {
    "investment": {
      "investmentId": "INV2511001",
      "plan": {
        "planName": "Premium RD Plan",
        "planType": "RD",
        "interestRate": 8.5,
        "tenureMonths": 24
      },
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "memberId": "202511001",
        "phoneNumber": "+1234567890",
        "address": "123 Main St, City, State"
      },
      "principalAmount": 100000,
      "monthlyInstallment": 5000,
      "investmentDate": "2025-11-01T10:30:00.000Z",
      "maturityDate": "2027-11-01T10:30:00.000Z",
      "expectedMaturityAmount": 130000,
      "actualMaturityAmount": null,
      "status": "active",
      "totalInterestEarned": 5000,
      "totalPenaltyPaid": 0,
      "certificateNumber": null,
      "emiSchedule": [
        {
          "emiNumber": 1,
          "dueDate": "2025-12-01T00:00:00.000Z",
          "amount": 5000,
          "status": "paid",
          "paidDate": "2025-11-30T10:30:00.000Z",
          "paymentMethod": "online",
          "transactionId": "TXN123456",
          "penaltyAmount": 0,
          "remarks": "Paid on time",
          "isOverdue": false
        }
      ],
      "createdBy": {
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-11-01T10:30:00.000Z",
      "updatedAt": "2025-11-01T10:30:00.000Z"
    }
  }
}
```

## Examples

### Complete Investment Application Flow

#### 1. Get Available Investment Plans
```bash
curl -X GET "http://localhost:3100/api/society-member/investment-applications/plans?planType=FD" \
  -H "Authorization: Bearer <member_token>"
```

#### 2. Apply for Investment
```bash
curl -X POST http://localhost:3100/api/society-member/investment-applications/apply \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_id",
    "investmentAmount": 100000,
    "monthlyEMI": 5000,
    "paymentMethod": "online",
    "termsAccepted": true
  }'
```

#### 3. Admin Approves Application
```bash
curl -X PATCH http://localhost:3100/api/admin/investment-approval/applications/APP2511001/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Application approved after verification"
  }'
```

#### 4. Member Makes Payment
```bash
curl -X POST http://localhost:3100/api/society-member/investment-applications/APP2511001/payment \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethod": "online",
    "emiNumber": 1,
    "transactionId": "TXN123456",
    "remarks": "Monthly EMI payment"
  }'
```

#### 5. Admin Records Cash Payment
```bash
curl -X POST http://localhost:3100/api/admin/investment-approval/applications/APP2511001/payment \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethod": "cash",
    "emiNumber": 2,
    "transactionId": "CASH001",
    "remarks": "Cash payment received"
  }'
```

### Get Application Status
```bash
curl -X GET http://localhost:3100/api/society-member/investment-applications/APP2511001 \
  -H "Authorization: Bearer <member_token>"
```

### Get EMI Schedule
```bash
curl -X GET http://localhost:3100/api/society-member/investment-applications/APP2511001/emi-schedule \
  -H "Authorization: Bearer <member_token>"
```

### Get Payment History
```bash
curl -X GET http://localhost:3100/api/society-member/investment-applications/APP2511001/payment-history \
  -H "Authorization: Bearer <member_token>"
```

### Get All Society Member Investments (Admin)
```bash
curl -X GET "http://localhost:3100/api/admin/investment-approval/investments?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

### Get Society Member Investment Details (Admin)
```bash
curl -X GET http://localhost:3100/api/admin/investment-approval/investments/INV2511001 \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

### Common Error Responses

**Application Not Found:**
```json
{
  "success": false,
  "message": "Investment application not found"
}
```

**Application Already Exists:**
```json
{
  "success": false,
  "message": "You already have a pending application for this plan"
}
```

**Plan Not Available:**
```json
{
  "success": false,
  "message": "Investment plan is not available for new applications"
}
```

**Application Not Approved:**
```json
{
  "success": false,
  "message": "Application must be approved before making payments"
}
```

**Invalid Status Change:**
```json
{
  "success": false,
  "message": "Only pending applications can be cancelled"
}
```

## Key Features Summary

### Society Member Features
- **Application Management**: Submit, view, and cancel investment applications
- **Payment Processing**: Make payments with cash or online methods
- **EMI Tracking**: Complete EMI schedule and payment history
- **Status Monitoring**: Real-time application and payment status tracking

### Admin Features
- **Application Review**: Approve or reject investment applications
- **Payment Recording**: Record cash payments and verify online payments
- **Statistics Dashboard**: Complete application and payment statistics
- **Note Management**: Add notes and comments to applications
- **Pending Applications Management**: View all society members with pending applications
- **Pending Requests Overview**: Get detailed pending investment plan acceptance requests
- **Pending Statistics**: Comprehensive statistics for pending applications

### System Features
- **Flexible Payment Methods**: Support for both cash and online payments
- **EMI Management**: Automatic EMI schedule generation and tracking
- **Document Management**: Upload and manage investment-related documents
- **Audit Trail**: Complete payment and application history tracking
- **No Validation Constraints**: System accepts any data without validation

### Payment Options
- **Cash Payments**: Physical cash payments with receipt generation
- **Online Payments**: Digital payment processing with transaction tracking
- **Mixed Payments**: Support for both payment methods in single application
- **Transaction Tracking**: Complete transaction ID and payment method tracking

## New Admin APIs for Pending Applications Management

### 1. Get All Society Members with Pending Applications

**Endpoint:** `GET /api/admin/investment-approval/pending-members`

**Description:** Retrieves all society members who have pending investment applications, grouped by member.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `search` (optional): Search by member name or email

**Response Example:**
```json
{
  "success": true,
  "message": "Society members with pending applications retrieved successfully",
  "data": {
    "societyMembers": [
      {
        "member": {
          "memberId": "202511001",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890",
          "address": "123 Main St, City"
        },
        "pendingApplications": [
          {
            "applicationId": "APP2511001",
            "plan": {
              "planId": "PLAN2511001",
              "planName": "Premium FD Plan",
              "planType": "FD",
              "interestRate": 8.5,
              "tenureMonths": 24,
              "minimumAmount": 10000,
              "maximumAmount": 1000000
            },
            "investmentAmount": 50000,
            "monthlyEMI": 0,
            "paymentMethod": "online",
            "applicationDate": "2025-11-01T10:30:00.000Z",
            "termsAccepted": true
          }
        ],
        "totalPendingAmount": 50000,
        "totalPendingEMI": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 1,
      "totalUniqueMembers": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get All Pending Investment Plan Acceptance Requests

**Endpoint:** `GET /api/admin/investment-approval/pending-requests`

**Description:** Retrieves all pending investment plan acceptance requests with detailed information.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `search` (optional): Search by member name or email

**Response Example:**
```json
{
  "success": true,
  "message": "Pending investment plan acceptance requests retrieved successfully",
  "data": {
    "pendingRequests": [
      {
        "applicationId": "APP2511001",
        "member": {
          "memberId": "202511001",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890",
          "address": "123 Main St, City"
        },
        "plan": {
          "planId": "PLAN2511001",
          "planName": "Premium FD Plan",
          "planType": "FD",
          "interestRate": 8.5,
          "tenureMonths": 24,
          "minimumAmount": 10000,
          "maximumAmount": 1000000,
          "description": "High-yield fixed deposit plan",
          "features": [
            {
              "feature": "High Interest Rate",
              "description": "Competitive interest rates"
            }
          ]
        },
        "applicationDetails": {
          "investmentAmount": 50000,
          "monthlyEMI": 0,
          "paymentMethod": "online",
          "applicationDate": "2025-11-01T10:30:00.000Z",
          "termsAccepted": true,
          "termsAcceptedDate": "2025-11-01T10:30:00.000Z",
          "notes": []
        },
        "emiSchedule": [],
        "paymentHistory": [],
        "documents": []
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalApplications": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "summary": {
      "totalPendingAmount": 50000,
      "totalPendingEMI": 0,
      "planTypeBreakdown": {
        "FD": 1
      }
    }
  }
}
```

### 3. Get Pending Applications Statistics

**Endpoint:** `GET /api/admin/investment-approval/pending-statistics`

**Description:** Retrieves comprehensive statistics for pending investment applications.

**Response Example:**
```json
{
  "success": true,
  "message": "Pending applications statistics retrieved successfully",
  "data": {
    "overview": {
      "totalPending": 5,
      "totalApproved": 10,
      "totalRejected": 2,
      "totalCancelled": 1,
      "recentApplications": 3
    },
    "pendingByPlanType": [
      {
        "_id": "FD",
        "count": 3,
        "totalAmount": 150000,
        "totalEMI": 0
      },
      {
        "_id": "RD",
        "count": 2,
        "totalAmount": 100000,
        "totalEMI": 5000
      }
    ],
    "pendingByPaymentMethod": [
      {
        "_id": "online",
        "count": 4,
        "totalAmount": 200000
      },
      {
        "_id": "cash",
        "count": 1,
        "totalAmount": 50000
      }
    ],
    "totals": {
      "totalAmount": 250000,
      "totalEMI": 5000
    }
  }
}
```

### Usage Examples

**Get all pending members:**
```bash
curl -X GET "http://localhost:3100/api/admin/investment-approval/pending-members?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Get pending requests for FD plans:**
```bash
curl -X GET "http://localhost:3100/api/admin/investment-approval/pending-requests?planType=FD" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Get pending statistics:**
```bash
curl -X GET "http://localhost:3100/api/admin/investment-approval/pending-statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Bulk Operations APIs

### 1. Bulk Approve Multiple Applications

**Endpoint:** `PATCH /api/admin/investment-approval/applications/bulk-approve`

**Description:** Approve multiple investment applications at once instead of approving them one by one.

**Request Body:**
```json
{
  "applicationIds": ["APP2511001", "APP2511002", "APP2511003"],
  "notes": "Bulk approval after verification"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Bulk approval completed. 3 approved, 0 failed",
  "data": {
    "approved": [
      {
        "applicationId": "APP2511001",
        "investmentId": "INV2511001",
        "principalAmount": 50000,
        "expectedMaturityAmount": 59000
      },
      {
        "applicationId": "APP2511002",
        "investmentId": "INV2511002",
        "principalAmount": 75000,
        "expectedMaturityAmount": 88500
      },
      {
        "applicationId": "APP2511003",
        "investmentId": "INV2511003",
        "principalAmount": 100000,
        "expectedMaturityAmount": 118000
      }
    ],
    "failed": [],
    "totalProcessed": 3
  }
}
```

### 2. Bulk Reject Multiple Applications

**Endpoint:** `PATCH /api/admin/investment-approval/applications/bulk-reject`

**Description:** Reject multiple investment applications at once.

**Request Body:**
```json
{
  "applicationIds": ["APP2511004", "APP2511005"],
  "reason": "Insufficient documentation",
  "notes": "Please provide additional income proof"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Bulk rejection completed. 2 rejected, 0 failed",
  "data": {
    "rejected": [
      {
        "applicationId": "APP2511004",
        "status": "rejected",
        "rejectionDate": "2025-11-01T15:30:00.000Z",
        "rejectionReason": "Insufficient documentation"
      },
      {
        "applicationId": "APP2511005",
        "status": "rejected",
        "rejectionDate": "2025-11-01T15:30:00.000Z",
        "rejectionReason": "Insufficient documentation"
      }
    ],
    "failed": [],
    "totalProcessed": 2
  }
}
```

### Usage Examples

**Bulk approve applications:**
```bash
curl -X PATCH "http://localhost:3100/api/admin/investment-approval/applications/bulk-approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationIds": ["APP2511001", "APP2511002", "APP2511003"],
    "notes": "Bulk approval after verification"
  }'
```

**Bulk reject applications:**
```bash
curl -X PATCH "http://localhost:3100/api/admin/investment-approval/applications/bulk-reject" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationIds": ["APP2511004", "APP2511005"],
    "reason": "Insufficient documentation",
    "notes": "Please provide additional income proof"
  }'
```

### Error Handling for Bulk Operations

**Invalid Application IDs:**
```json
{
  "success": false,
  "message": "Application IDs array is required"
}
```

**Partial Success Response:**
```json
{
  "success": true,
  "message": "Bulk approval completed. 2 approved, 1 failed",
  "data": {
    "approved": [
      {
        "applicationId": "APP2511001",
        "investmentId": "INV2511001",
        "principalAmount": 50000,
        "expectedMaturityAmount": 59000
      },
      {
        "applicationId": "APP2511002",
        "investmentId": "INV2511002",
        "principalAmount": 75000,
        "expectedMaturityAmount": 88500
      }
    ],
    "failed": [
      {
        "applicationId": "APP2511003",
        "error": "Application not found"
      }
    ],
    "totalProcessed": 3
  }
}
```

This comprehensive system provides society members with a complete investment application and payment management solution, while giving administrators full control over the approval and payment recording process.
