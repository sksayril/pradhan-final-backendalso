# Loan Management System API Documentation

## Overview

The Loan Management System provides comprehensive APIs for society members to request loans and for administrators to manage loan applications, approvals, and EMI tracking. The system supports both investment-based EMIs and loan-based EMIs with flexible payment options.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Loan Request APIs (Society Member)](#loan-request-apis-society-member)
3. [Admin Loan Management APIs](#admin-loan-management-apis)
4. [EMI Management](#emi-management)
5. [Payment Processing](#payment-processing)
6. [Automatic Penalty System](#automatic-penalty-system)
7. [API Route Structure](#api-route-structure)
8. [Quick Reference - All Endpoints](#quick-reference---all-endpoints)
9. [Error Handling](#error-handling)
10. [Examples](#examples)

## System Architecture

### Models
- **LoanRequest**: Manages loan applications and approvals
- **EMIRecord**: Handles both investment and loan EMIs
- **Payment**: Processes all payment types (cash, online, Razorpay)
- **SocietyMember**: Member information and authentication
- **Admin**: Administrator access and approvals

### Key Features
- ✅ Loan request submission with document upload
- ✅ Admin approval/rejection workflow
- ✅ Automatic EMI record generation after disbursement
- ✅ Flexible payment options (cash, online, Razorpay)
- ✅ Payment screenshot upload for verification
- ✅ Automatic penalty calculation after 15th of month
- ✅ Comprehensive reporting and statistics

## Loan Request APIs (Society Member)

### 1. Create Loan Request


**Endpoint:** `POST /api/loan-requests`

**Description:** Submit a new loan request with EMI configuration.

**Request Body:**
```json
{
  "loanAmount": 50000,
  "loanPurpose": "Personal",
  "loanDescription": "Need loan for medical expenses",
  "tenureMonths": 12,
  "emiAmount": 4500,
  "interestRate": 12.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan request created successfully",
  "data": {
    "requestId": "LOAN2501001",
    "loanAmount": 50000,
    "loanPurpose": "Personal",
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Member's Loan Requests

**Endpoint:** `GET /api/loan-requests`

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, disbursed, completed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Loan requests retrieved successfully",
  "data": {
    "loanRequests": [
      {
        "requestId": "LOAN2501001",
        "loanAmount": 50000,
        "loanPurpose": "Personal",
        "status": "pending",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "emiOptions": {
          "tenureMonths": 12,
          "emiAmount": 4500,
          "interestRate": 12.5
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRequests": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 3. Get Loan Request Details

**Endpoint:** `GET /api/loan-requests/:requestId`

**Response:**
```json
{
  "success": true,
  "message": "Loan request details retrieved successfully",
  "data": {
    "requestId": "LOAN2501001",
    "loanAmount": 50000,
    "loanPurpose": "Personal",
    "loanDescription": "Need loan for medical expenses",
    "status": "pending",
    "emiOptions": {
      "tenureMonths": 12,
      "emiAmount": 4500,
      "interestRate": 12.5
    },
    "documents": [
      {
        "documentType": "identity_proof",
        "documentName": "Aadhar Card",
        "documentUrl": "https://s3.amazonaws.com/bucket/loan-documents/...",
        "uploadedAt": "2025-01-15T10:35:00.000Z"
      }
    ],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Upload Loan Documents

**Endpoint:** `POST /api/loan-requests/:requestId/documents`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `document`: File (required)
- `documentType`: String (required) - identity_proof, address_proof, income_proof, bank_statement, other
- `documentName`: String (optional)

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentType": "identity_proof",
    "documentName": "Aadhar Card",
    "documentUrl": "https://s3.amazonaws.com/bucket/loan-documents/..."
  }
}
```

### 5. Update Loan Request

**Endpoint:** `PUT /api/loan-requests/:requestId`

**Description:** Update loan request details (only for pending requests).

**Request Body:**
```json
{
  "loanAmount": 60000,
  "loanDescription": "Updated description for medical expenses",
  "emiAmount": 5500
}
```

### 6. Cancel Loan Request

**Endpoint:** `DELETE /api/loan-requests/:requestId`

**Description:** Cancel a pending loan request.

**Response:**
```json
{
  "success": true,
  "message": "Loan request cancelled successfully"
}
```

## Admin Loan Management APIs

### 1. Get All Loan Requests

**Endpoint:** `GET /api/admin/loans`

**Query Parameters:**
- `status` (optional): Filter by status
- `memberId` (optional): Filter by member ID
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Loan requests retrieved successfully",
  "data": {
    "loanRequests": [
      {
        "requestId": "LOAN2501001",
        "memberId": {
          "firstName": "John",
          "lastName": "Doe",
          "memberId": "202501001",
          "email": "john.doe@example.com"
        },
        "loanAmount": 50000,
        "loanPurpose": "Personal",
        "status": "pending",
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRequests": 1
    }
  }
}
```

### 2. Approve Loan Request

**Endpoint:** `PUT /api/admin/loans/:requestId/approve`

**Request Body:**
```json
{
  "approvalNotes": "Approved based on member's good payment history"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan request approved successfully",
  "data": {
    "requestId": "LOAN2501001",
    "status": "approved",
    "approvedAt": "2025-01-15T14:30:00.000Z",
    "approvedBy": "admin_id_here"
  }
}
```

### 3. Reject Loan Request

**Endpoint:** `PUT /api/admin/loans/:requestId/reject`

**Request Body:**
```json
{
  "rejectionReason": "Insufficient income documentation provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan request rejected successfully",
  "data": {
    "requestId": "LOAN2501001",
    "status": "rejected",
    "rejectedAt": "2025-01-15T14:30:00.000Z",
    "rejectionReason": "Insufficient income documentation provided"
  }
}
```

### 4. Disburse Loan

**Endpoint:** `PUT /api/admin/loans/:requestId/disburse`

**Description:** Disburse approved loan and create EMI records.

**Request Body:**
```json
{
  "disbursedAmount": 50000,
  "disbursementMethod": "bank_transfer",
  "disbursementReference": "TXN123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan disbursed successfully and EMI records created",
  "data": {
    "requestId": "LOAN2501001",
    "status": "disbursed",
    "disbursedAmount": 50000,
    "disbursedAt": "2025-01-15T16:00:00.000Z",
    "disbursementMethod": "bank_transfer"
  }
}
```

### 5. Get Loan Statistics

**Endpoint:** `GET /api/admin/loans/statistics/overview`

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "Loan statistics retrieved successfully",
  "data": {
    "statusBreakdown": [
      {
        "status": "pending",
        "count": 5,
        "totalAmount": 250000,
        "averageAmount": 50000
      },
      {
        "status": "approved",
        "count": 3,
        "totalAmount": 150000,
        "averageAmount": 50000
      }
    ],
    "totalRequests": 8,
    "totalLoanAmount": 400000,
    "additionalStats": {
      "totalPendingRequests": 5,
      "totalApprovedRequests": 3,
      "totalDisbursedLoans": 2
    }
  }
}
```

### 6. Get Member Loan Summary

**Endpoint:** `GET /api/admin/loans/member/:memberId/summary`

**Response:**
```json
{
  "success": true,
  "message": "Member loan summary retrieved successfully",
  "data": {
    "member": {
      "name": "John Doe",
      "memberId": "202501001",
      "email": "john.doe@example.com"
    },
    "totalLoans": 2,
    "totalLoanAmount": 100000,
    "totalDisbursedAmount": 50000,
    "statusBreakdown": {
      "pending": 1,
      "approved": 0,
      "disbursed": 1,
      "completed": 0,
      "rejected": 0
    },
    "loanRequests": [
      {
        "requestId": "LOAN2501001",
        "loanAmount": 50000,
        "disbursedAmount": 50000,
        "status": "disbursed",
        "emiCount": 12,
        "paidEMIs": 2,
        "pendingEMIs": 10
      }
    ]
  }
}
```

## EMI Management

### EMI Record Structure

EMI records can be created for both:
1. **Investment EMIs**: Linked to investment plans
2. **Loan EMIs**: Linked to loan requests

**Key Fields:**
- `investmentId`: For investment-based EMIs
- `loanRequestId`: For loan-based EMIs
- `memberId`: Society member reference
- `emiAmount`: Monthly installment amount
- `dueDate`: EMI due date
- `gracePeriodEndDate`: End of grace period
- `status`: pending, paid, overdue
- `penaltyAmount`: Calculated penalty

### Automatic EMI Creation

When a loan is disbursed, the system automatically:
1. Creates EMI records for each month of the tenure
2. Calculates due dates and grace periods
3. Sets up payment tracking
4. Links EMIs to the loan request

## Payment Processing

### Payment Methods

1. **Cash Payments**
   - Member requests cash payment
   - Admin verifies and approves
   - Screenshot upload for verification

2. **Online Payments**
   - Razorpay integration for payment processing
   - Automatic payment verification
   - Real-time status updates

3. **Payment Screenshots**
   - Upload payment proof
   - Admin verification required
   - S3 storage for documents

### Payment Flow

1. Member initiates payment (cash or online)
2. For online: Razorpay order generation
3. Payment processing and verification
4. EMI status update
5. Admin approval for cash payments
6. Automatic penalty calculation if overdue

## Automatic Penalty System

### Penalty Configuration

**Admin Configuration:**
- Penalty percentage (default: 2% per month)
- Grace period (default: 5 days after due date)
- Maximum penalty cap
- Auto-calculation trigger date (15th of month)

### Penalty Calculation

**Trigger:** After 15th of each month
**Formula:** `penaltyAmount = emiAmount * penaltyPercentage * monthsOverdue`
**Example:** ₹5,000 EMI with 2% penalty = ₹100 per month overdue

### Automatic Process

1. **Daily Check:** System checks for overdue EMIs
2. **Penalty Application:** After 15th, penalties are calculated
3. **Notification:** Members receive penalty notifications
4. **Admin Review:** Admins can waive penalties if needed

## API Route Structure

### Society Member Routes
- **Base Path:** `/api/loan-requests`
- **Authentication:** Required (JWT token)
- **Authorization:** societyMember role

### Admin Routes
- **Base Path:** `/api/admin/loans`
- **Authentication:** Required (JWT token)
- **Authorization:** admin role

## Quick Reference - All Endpoints

### Society Member Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loan-requests` | Create loan request |
| GET | `/api/loan-requests` | Get member's loan requests |
| GET | `/api/loan-requests/:requestId` | Get loan request details |
| PUT | `/api/loan-requests/:requestId` | Update loan request |
| DELETE | `/api/loan-requests/:requestId` | Cancel loan request |
| POST | `/api/loan-requests/:requestId/documents` | Upload documents |
| DELETE | `/api/loan-requests/:requestId/documents/:documentId` | Delete document |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/loans` | Get all loan requests |
| GET | `/api/admin/loans/:requestId` | Get loan request details |
| PUT | `/api/admin/loans/:requestId/approve` | Approve loan request |
| PUT | `/api/admin/loans/:requestId/reject` | Reject loan request |
| PUT | `/api/admin/loans/:requestId/disburse` | Disburse loan |
| GET | `/api/admin/loans/statistics/overview` | Get loan statistics |
| GET | `/api/admin/loans/member/:memberId/summary` | Get member loan summary |

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "loanAmount",
      "message": "Loan amount must be between ₹1,000 and ₹10,00,000"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Loan request not found or access denied"
}
```

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

## Examples

### Complete Loan Request Flow

1. **Create Loan Request**
```bash
curl -X POST http://localhost:3000/api/loan-requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 50000,
    "loanPurpose": "Personal",
    "loanDescription": "Need loan for medical expenses",
    "tenureMonths": 12,
    "emiAmount": 4500,
    "interestRate": 12.5
  }'
```

2. **Upload Documents**
```bash
curl -X POST http://localhost:3000/api/loan-requests/LOAN2501001/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@aadhar_card.pdf" \
  -F "documentType=identity_proof" \
  -F "documentName=Aadhar Card"
```

3. **Admin Approval**
```bash
curl -X PUT http://localhost:3000/api/admin/loans/LOAN2501001/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "Approved based on good payment history"
  }'
```

4. **Loan Disbursement**
```bash
curl -X PUT http://localhost:3000/api/admin/loans/LOAN2501001/disburse \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "disbursedAmount": 50000,
    "disbursementMethod": "bank_transfer",
    "disbursementReference": "TXN123456789"
  }'
```

### Payment Processing Examples

1. **Cash Payment Request**
```bash
curl -X POST http://localhost:3000/api/society-member-payments/cash-payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emiId": "EMI2501001",
    "amount": 4500,
    "remarks": "Will pay at office tomorrow"
  }'
```

2. **Online Payment (Razorpay)**
```bash
curl -X POST http://localhost:3000/api/society-member-payments/generate-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emiId": "EMI2501001",
    "amount": 4500
  }'
```

3. **Upload Payment Screenshot**
```bash
curl -X POST http://localhost:3000/api/society-member-payments/PAY123456/screenshot \
  -H "Authorization: Bearer <token>" \
  -F "screenshot=@payment_proof.jpg" \
  -F "screenshotType=payment_proof" \
  -F "description=UPI payment screenshot"
```

## Route Registration Status

✅ **All routes are properly registered in app.js:**
- `/api/loan-requests` → Society Member Loan APIs
- `/api/admin/loans` → Admin Loan Management APIs
- `/api/society-member-payments` → Payment Processing APIs
- `/api/admin/payments` → Admin Payment Management APIs

## Summary

The Loan Management System provides a comprehensive solution for:

1. **Loan Request Management**: Complete workflow from application to disbursement
2. **EMI Tracking**: Automatic EMI creation and management for both investments and loans
3. **Payment Processing**: Multiple payment methods with verification
4. **Admin Controls**: Full administrative oversight and approval workflows
5. **Automatic Penalties**: Configurable penalty system with automatic calculation
6. **Document Management**: Secure document upload and storage
7. **Reporting**: Comprehensive statistics and member summaries

The system is fully integrated with the existing payment infrastructure and provides seamless loan management capabilities for society members and administrators.
