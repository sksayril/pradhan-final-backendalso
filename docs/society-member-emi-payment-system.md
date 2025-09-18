# Society Member EMI Payment System API Documentation

## Overview

This document provides comprehensive API documentation for the Society Member EMI Payment System, which includes both cash and online payment options with Razorpay integration, pending EMI tracking, and admin management capabilities.

## Table of Contents

1. [Authentication](#authentication)
2. [API Route Structure](#api-route-structure)
3. [Society Member Payment APIs](#society-member-payment-apis)
4. [Admin Payment Management APIs](#admin-payment-management-apis)
5. [Error Handling](#error-handling)
6. [Response Formats](#response-formats)
7. [Environment Variables](#environment-variables)
8. [Installation and Setup](#installation-and-setup)
9. [Security Considerations](#security-considerations)
10. [Rate Limiting](#rate-limiting)
11. [Testing](#testing)
12. [Quick Reference - All Endpoints](#quick-reference---all-endpoints)
13. [Route Registration Status](#route-registration-status)

## Authentication

All APIs require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Route Structure

The Society Member EMI Payment System uses the following route structure:

- **Society Member APIs**: `/api/society-member-payments/*`
- **Admin APIs**: `/api/admin/payments/*`

All routes are properly registered in the main application and ready for use.

## Society Member Payment APIs

### 1. Generate Payment Order (Online Payment)

**Endpoint:** `POST /api/society-member-payments/generate-order`

**Description:** Creates a Razorpay payment order for online EMI payments.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "investmentId": "64a1b2c3d4e5f6789012345",
  "emiNumber": 1,
  "amount": 5000,
  "paymentMethod": "upi"
}
```

**Validation Rules:**
- `investmentId`: Valid MongoDB ObjectId, required
- `emiNumber`: Positive integer, optional
- `amount`: Float > 0, required
- `paymentMethod`: One of ['upi', 'net_banking', 'credit_card', 'debit_card', 'wallet'], required

**Response:**
```json
{
  "success": true,
  "message": "Payment order generated successfully",
  "data": {
    "paymentId": "PAY2412001",
    "transactionId": "TXN1703123456789ABC123",
    "amount": 5000,
    "paymentOrder": {
      "id": "order_ABC123XYZ",
      "amount": 500000,
      "currency": "INR",
      "receipt": "PAY2412001",
      "status": "created",
      "notes": {
        "investmentId": "INV2412001",
        "memberId": "MEM2412001",
        "emiNumber": "1",
        "paymentFor": "EMI Payment"
      }
    },
    "investmentDetails": {
      "investmentId": "INV2412001",
      "planName": "Monthly RD Plan",
      "planType": "RD"
    }
  }
}
```

### 2. Process Payment Callback

**Endpoint:** `POST /api/society-member-payments/callback`

**Description:** Handles payment gateway webhook callbacks and verifies payment signatures.

**Request Body:**
```json
{
  "paymentId": "PAY2412001",
  "transactionId": "TXN1703123456789ABC123",
  "gatewayResponse": {
    "razorpay_order_id": "order_ABC123XYZ",
    "razorpay_payment_id": "pay_XYZ789ABC",
    "razorpay_signature": "signature_hash_here",
    "gatewayStatus": "captured"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "PAY2412001",
    "status": "completed",
    "amount": 5000
  }
}
```

### 3. Create Cash Payment Request

**Endpoint:** `POST /api/society-member-payments/cash-payment`

**Description:** Creates a cash payment request that requires admin verification.

**Request Body:**
```json
{
  "investmentId": "64a1b2c3d4e5f6789012345",
  "emiNumber": 1,
  "amount": 5000,
  "remarks": "Will pay at office tomorrow"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cash payment request created successfully",
  "data": {
    "paymentId": "PAY2412002",
    "amount": 5000,
    "paymentType": "cash",
    "status": "pending",
    "verificationStatus": "pending",
    "investmentDetails": {
      "investmentId": "INV2412001",
      "planName": "Monthly RD Plan",
      "planType": "RD"
    },
    "nextSteps": "Please visit the office with cash payment and show this payment ID to complete the transaction."
  }
}
```

### 4. Get Pending EMIs

**Endpoint:** `GET /api/society-member-payments/pending-emis`

**Description:** Retrieves pending EMIs for the authenticated member with optional filtering.

**Query Parameters:**
- `month`: Integer (1-12), optional
- `year`: Integer (≥2020), optional
- `investmentId`: MongoDB ObjectId, optional
- `page`: Integer (≥1), default: 1
- `limit`: Integer (1-100), default: 10

**Example Request:**
```
GET /api/society-member-payments/pending-emis?month=12&year=2024&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Pending EMIs retrieved successfully",
  "data": {
    "pendingEMIs": [
      {
        "emiId": "EMI2412001",
        "emiNumber": 1,
        "emiAmount": 5000,
        "dueDate": "2024-12-15T00:00:00.000Z",
        "status": "pending",
        "paidAmount": 0,
        "penaltyAmount": 0,
        "totalPaidAmount": 0,
        "paidDate": null,
        "isOverdue": false,
        "isInGracePeriod": false,
        "remindersCount": 0,
        "paymentIds": [],
        "memberDetails": {
          "name": "John Doe",
          "memberId": "MEM2412001",
          "email": "john@example.com",
          "phoneNumber": "+919876543210"
        },
        "investmentDetails": {
          "investmentId": "INV2412001",
          "planName": "Monthly RD Plan",
          "planType": "RD"
        }
      }
    ],
    "summary": {
      "totalPendingEMIs": 5,
      "totalPendingAmount": 25000,
      "totalPenaltyAmount": 0,
      "overdueEMIs": 1
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPendingEMIs": 5,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 5. Get Pending EMIs Grouped by Month

**Endpoint:** `GET /api/society-member-payments/pending-emis/monthly`

**Description:** Retrieves pending EMIs grouped by month for better organization.

**Query Parameters:**
- `investmentId`: MongoDB ObjectId, optional

**Response:**
```json
{
  "success": true,
  "message": "Pending EMIs grouped by month retrieved successfully",
  "data": {
    "pendingEMIsByMonth": [
      {
        "month": 12,
        "year": 2024,
        "monthName": "December",
        "emiCount": 3,
        "totalAmount": 15000,
        "totalPenalty": 0,
        "emis": [
          {
            "emiId": "EMI2412001",
            "emiNumber": 1,
            "emiAmount": 5000,
            "dueDate": "2024-12-15T00:00:00.000Z",
            "status": "pending",
            "memberDetails": {
              "name": "John Doe",
              "memberId": "MEM2412001",
              "email": "john@example.com",
              "phoneNumber": "+919876543210"
            },
            "investmentDetails": {
              "investmentId": "INV2412001",
              "planName": "Monthly RD Plan",
              "planType": "RD"
            }
          }
        ]
      }
    ],
    "overallSummary": {
      "totalPendingEMIs": 5,
      "totalPendingAmount": 25000,
      "totalPenaltyAmount": 0,
      "monthsWithPendingEMIs": 2
    }
  }
}
```

### 6. Get Payment Options for EMI

**Endpoint:** `GET /api/society-member-payments/payment-options/:emiId`

**Description:** Retrieves available payment options for a specific EMI.

**Path Parameters:**
- `emiId`: MongoDB ObjectId, required

**Response:**
```json
{
  "success": true,
  "message": "Payment options retrieved successfully",
  "data": {
    "emiDetails": {
      "emiId": "EMI2412001",
      "emiNumber": 1,
      "emiAmount": 5000,
      "dueDate": "2024-12-15T00:00:00.000Z",
      "status": "pending",
      "penaltyAmount": 0,
      "totalPaidAmount": 0
    },
    "paymentOptions": {
      "cash": {
        "available": true,
        "amount": 5000,
        "description": "Pay in cash at the office",
        "instructions": "Visit the office with exact amount and show EMI ID"
      },
      "online": {
        "available": true,
        "amount": 5000,
        "description": "Pay online using Razorpay",
        "supportedMethods": ["upi", "net_banking", "credit_card", "debit_card", "wallet"],
        "instructions": "Complete payment online and get instant confirmation"
      }
    },
    "memberDetails": {
      "name": "John Doe",
      "memberId": "MEM2412001",
      "email": "john@example.com"
    },
    "investmentDetails": {
      "investmentId": "INV2412001",
      "planName": "Monthly RD Plan",
      "planType": "RD"
    }
  }
}
```

### 7. Upload Payment Screenshot

**Endpoint:** `POST /api/society-member-payments/:paymentId/screenshot`

**Description:** Uploads payment screenshots for verification.

**Path Parameters:**
- `paymentId`: String, required

**Request Body (multipart/form-data):**
- `screenshot`: File, required
- `screenshotType`: String, required (one of: 'payment_confirmation', 'bank_statement', 'upi_screenshot', 'receipt', 'other')
- `description`: String, optional

**Response:**
```json
{
  "success": true,
  "message": "Payment screenshot uploaded successfully",
  "data": {
    "paymentId": "PAY2412001",
    "screenshotUrl": "https://s3.amazonaws.com/bucket/payment-screenshots/screenshot.jpg",
    "screenshotType": "payment_confirmation"
  }
}
```

### 8. Get Payment History

**Endpoint:** `GET /api/society-member-payments/history`

**Description:** Retrieves payment history for the authenticated member.

**Query Parameters:**
- `status`: String, optional (pending, processing, completed, failed, cancelled, refunded)
- `paymentType`: String, optional (cash, online, cheque, bank_transfer)
- `startDate`: ISO8601 date, optional
- `endDate`: ISO8601 date, optional
- `page`: Integer (≥1), default: 1
- `limit`: Integer (1-100), default: 10

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "payments": [
      {
        "paymentId": "PAY2412001",
        "transactionId": "TXN1703123456789ABC123",
        "amount": 5000,
        "paymentType": "online",
        "paymentMethod": "upi",
        "status": "completed",
        "verificationStatus": "verified",
        "paymentDate": "2024-12-01T10:30:00.000Z",
        "paymentFor": "emi",
        "emiNumber": 1,
        "screenshots": 1,
        "remarks": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPayments": 5,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Admin Payment Management APIs

### 1. Get Pending Cash Payments

**Endpoint:** `GET /api/admin/payments/pending-cash-payments`

**Description:** Retrieves all pending cash payments requiring admin verification.

**Query Parameters:**
- `memberId`: MongoDB ObjectId, optional
- `investmentId`: MongoDB ObjectId, optional
- `startDate`: ISO8601 date, optional
- `endDate`: ISO8601 date, optional
- `page`: Integer (≥1), default: 1
- `limit`: Integer (1-100), default: 10

**Response:**
```json
{
  "success": true,
  "message": "Pending cash payments retrieved successfully",
  "data": {
    "pendingPayments": [
      {
        "paymentId": "PAY2412002",
        "transactionId": null,
        "amount": 5000,
        "paymentType": "cash",
        "paymentMethod": "cash",
        "status": "pending",
        "verificationStatus": "pending",
        "paymentDate": "2024-12-01T10:30:00.000Z",
        "paymentFor": "emi",
        "emiNumber": 1,
        "screenshots": 0,
        "remarks": "Will pay at office tomorrow",
        "memberDetails": {
          "name": "John Doe",
          "memberId": "MEM2412001",
          "email": "john@example.com",
          "phoneNumber": "+919876543210"
        },
        "investmentDetails": {
          "investmentId": "INV2412001",
          "planName": "Monthly RD Plan",
          "planType": "RD"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPendingPayments": 3,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 2. Verify Cash Payment

**Endpoint:** `PUT /api/admin/payments/verify-cash/:paymentId`

**Description:** Verifies and approves/rejects cash payments.

**Path Parameters:**
- `paymentId`: String, required

**Request Body:**
```json
{
  "verificationStatus": "verified",
  "remarks": "Payment received and verified",
  "receiptNumber": "RCP2412001",
  "receivedAmount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cash payment verified successfully",
  "data": {
    "paymentDetails": {
      "paymentId": "PAY2412002",
      "status": "completed",
      "verificationStatus": "verified",
      "amount": 5000
    },
    "verificationDetails": {
      "verificationStatus": "verified",
      "verifiedBy": "64a1b2c3d4e5f6789012345",
      "verifiedDate": "2024-12-01T15:30:00.000Z",
      "remarks": "Payment received and verified",
      "receiptNumber": "RCP2412001"
    },
    "memberDetails": {
      "name": "John Doe",
      "memberId": "MEM2412001",
      "email": "john@example.com"
    },
    "investmentDetails": {
      "investmentId": "INV2412001",
      "planName": "Monthly RD Plan",
      "planType": "RD"
    }
  }
}
```

### 3. Get All Pending EMIs

**Endpoint:** `GET /api/admin/payments/pending-emis`

**Description:** Retrieves all pending EMIs across all members for admin review.

**Query Parameters:**
- `memberId`: MongoDB ObjectId, optional
- `investmentId`: MongoDB ObjectId, optional
- `month`: Integer (1-12), optional
- `year`: Integer (≥2020), optional
- `overdue`: Boolean, optional
- `page`: Integer (≥1), default: 1
- `limit`: Integer (1-100), default: 10

**Response:**
```json
{
  "success": true,
  "message": "All pending EMIs retrieved successfully",
  "data": {
    "pendingEMIs": [
      {
        "emiId": "EMI2412001",
        "emiNumber": 1,
        "emiAmount": 5000,
        "dueDate": "2024-12-15T00:00:00.000Z",
        "status": "pending",
        "paidAmount": 0,
        "penaltyAmount": 0,
        "totalPaidAmount": 0,
        "paidDate": null,
        "isOverdue": false,
        "isInGracePeriod": false,
        "remindersCount": 0,
        "paymentIds": [],
        "memberDetails": {
          "name": "John Doe",
          "memberId": "MEM2412001",
          "email": "john@example.com",
          "phoneNumber": "+919876543210"
        },
        "investmentDetails": {
          "investmentId": "INV2412001",
          "planName": "Monthly RD Plan",
          "planType": "RD"
        }
      }
    ],
    "summary": {
      "totalPendingEMIs": 25,
      "totalPendingAmount": 125000,
      "totalPenaltyAmount": 2500,
      "overdueEMIs": 5,
      "gracePeriodEMIs": 3
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalPendingEMIs": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 4. Get Pending EMIs Grouped by Month (Admin)

**Endpoint:** `GET /api/admin/payments/pending-emis/monthly`

**Description:** Retrieves pending EMIs grouped by month for admin overview.

**Query Parameters:**
- `memberId`: MongoDB ObjectId, optional
- `investmentId`: MongoDB ObjectId, optional

**Response:**
```json
{
  "success": true,
  "message": "Pending EMIs grouped by month retrieved successfully",
  "data": {
    "pendingEMIsByMonth": [
      {
        "month": 12,
        "year": 2024,
        "monthName": "December",
        "emiCount": 15,
        "totalAmount": 75000,
        "totalPenalty": 1500,
        "emis": [
          {
            "emiId": "EMI2412001",
            "emiNumber": 1,
            "emiAmount": 5000,
            "dueDate": "2024-12-15T00:00:00.000Z",
            "status": "pending",
            "memberDetails": {
              "name": "John Doe",
              "memberId": "MEM2412001",
              "email": "john@example.com",
              "phoneNumber": "+919876543210"
            },
            "investmentDetails": {
              "investmentId": "INV2412001",
              "planName": "Monthly RD Plan",
              "planType": "RD"
            }
          }
        ]
      }
    ],
    "overallSummary": {
      "totalPendingEMIs": 25,
      "totalPendingAmount": 125000,
      "totalPenaltyAmount": 2500,
      "monthsWithPendingEMIs": 2
    }
  }
}
```

### 5. Get Member Payment Summary

**Endpoint:** `GET /api/admin/payments/member-summary/:memberId`

**Description:** Retrieves comprehensive payment summary for a specific member.

**Path Parameters:**
- `memberId`: MongoDB ObjectId, required

**Response:**
```json
{
  "success": true,
  "message": "Member payment summary retrieved successfully",
  "data": {
    "memberDetails": {
      "memberId": "MEM2412001",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210"
    },
    "investmentSummary": {
      "totalInvestments": 2,
      "investments": [
        {
          "investmentId": "INV2412001",
          "planName": "Monthly RD Plan",
          "planType": "RD",
          "principalAmount": 100000,
          "expectedMaturityAmount": 120000,
          "emiProgress": {
            "total": 12,
            "paid": 3,
            "pending": 9,
            "overdue": 1
          },
          "paymentSummary": {
            "totalPaid": 15000,
            "totalPending": 45000,
            "completionPercentage": 25
          },
          "nextDueDate": "2024-12-15T00:00:00.000Z",
          "status": "active"
        }
      ]
    },
    "paymentSummary": {
      "totalPayments": 5,
      "cashPayments": 2,
      "onlinePayments": 3,
      "totalPaidAmount": 15000,
      "pendingPayments": 1
    }
  }
}
```

### 6. Get Payment Statistics

**Endpoint:** `GET /api/admin/payments/statistics`

**Description:** Retrieves comprehensive payment and EMI statistics.

**Query Parameters:**
- `startDate`: ISO8601 date, optional
- `endDate`: ISO8601 date, optional
- `memberId`: MongoDB ObjectId, optional
- `investmentId`: MongoDB ObjectId, optional

**Response:**
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "paymentStatistics": {
      "totalPayments": 150,
      "totalAmount": 750000,
      "completedPayments": 140,
      "completedAmount": 700000,
      "pendingPayments": 8,
      "pendingAmount": 40000,
      "failedPayments": 2,
      "failedAmount": 10000
    },
    "emiStatistics": {
      "totalEMIs": 500,
      "totalEMIAmount": 2500000,
      "paidEMIs": 400,
      "paidAmount": 2000000,
      "pendingEMIs": 100,
      "pendingAmount": 500000,
      "overdueEMIs": 15,
      "overdueAmount": 75000,
      "totalPenaltyAmount": 5000
    },
    "insights": {
      "totalCashPayments": 80,
      "totalOnlinePayments": 70,
      "pendingCashPayments": 5,
      "pendingVerifications": 8,
      "cashVsOnlineRatio": 88
    },
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "EMI record not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Response Formats

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)",
  "errors": [
    // Validation errors array (optional)
  ]
}
```

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Database
MONGODB_URI=mongodb://localhost:27017/society_management

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

## Installation and Setup

1. Install dependencies:
```bash
npm install razorpay
```

2. Configure Razorpay credentials in your `.env` file

3. The system will automatically handle:
   - Payment order creation
   - Signature verification
   - EMI status updates
   - Payment history tracking
   - Admin verification workflows

## Security Considerations

1. **Payment Signature Verification**: All Razorpay payments are verified using HMAC signatures
2. **Input Validation**: All inputs are validated using express-validator
3. **Authentication**: JWT-based authentication for all endpoints
4. **Authorization**: Role-based access control (admin vs society member)
5. **Data Sanitization**: All user inputs are sanitized before database operations

## Rate Limiting

Consider implementing rate limiting for payment endpoints to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

// Apply to payment endpoints
app.use('/api/society-member-payments/generate-order', paymentLimiter);
```

## Testing

Use the following test scenarios:

1. **Online Payment Flow**:
   - Generate payment order
   - Simulate successful payment callback
   - Verify EMI status update

2. **Cash Payment Flow**:
   - Create cash payment request
   - Admin verification (approve/reject)
   - Verify EMI status update

3. **Pending EMI Tracking**:
   - Create multiple EMIs
   - Test month-wise grouping
   - Test filtering and pagination

4. **Admin Management**:
   - Test all admin endpoints
   - Verify statistics accuracy
   - Test member-specific queries

## Quick Reference - All Endpoints

### Society Member Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/society-member-payments/generate-order` | Generate Razorpay payment order |
| POST | `/api/society-member-payments/callback` | Process payment callback |
| POST | `/api/society-member-payments/cash-payment` | Create cash payment request |
| GET | `/api/society-member-payments/pending-emis` | Get pending EMIs |
| GET | `/api/society-member-payments/pending-emis/monthly` | Get EMIs grouped by month |
| GET | `/api/society-member-payments/payment-options/:emiId` | Get payment options for EMI |
| POST | `/api/society-member-payments/:paymentId/screenshot` | Upload payment screenshot |
| GET | `/api/society-member-payments/history` | Get payment history |
| GET | `/api/society-member-payments/:paymentId` | Get payment details |
| GET | `/api/society-member-payments/emi/:investmentId` | Get EMI details for investment |
| GET | `/api/society-member-payments/summary/investments` | Get investment payment summary |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/payments/pending-cash-payments` | Get pending cash payments |
| PUT | `/api/admin/payments/verify-cash/:paymentId` | Verify cash payment |
| GET | `/api/admin/payments/pending-emis` | Get all pending EMIs |
| GET | `/api/admin/payments/pending-emis/monthly` | Get EMIs grouped by month |
| GET | `/api/admin/payments/member-summary/:memberId` | Get member payment summary |
| GET | `/api/admin/payments/statistics` | Get payment statistics |

## Route Registration Status

✅ **All routes are properly registered in `app.js`:**
- Society Member Payment Routes: `/api/society-member-payments`
- Admin Payment Routes: `/api/admin/payments`

✅ **Dependencies installed:**
- Razorpay package: `npm install razorpay`

✅ **Configuration files created:**
- Razorpay config: `config/razorpay.js`
- Enhanced EMI model: `models/emiRecord.model.js`
- Payment controllers: `controllers/societyMemberPaymentController.js`, `controllers/adminSocietyMemberPaymentController.js`

The system is ready for production use with all endpoints functional and properly documented.