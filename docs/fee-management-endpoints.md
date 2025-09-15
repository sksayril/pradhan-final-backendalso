# Fee Management API Endpoints

This document describes the comprehensive fee management system for admins to handle student fee requests, payments, and tracking.

## Table of Contents

1. [Create Fee Request](#1-create-fee-request)
2. [Get All Fee Requests](#2-get-all-fee-requests)
3. [Get Student Fee Requests](#3-get-student-fee-requests)
4. [Record Fee Payment](#4-record-fee-payment)
5. [Get Fee Payment History](#5-get-fee-payment-history)
6. [Get Fee Statistics](#6-get-fee-statistics)

---

## 1. Create Fee Request

Create a new fee request for a student enrolled in a specific course batch.

**Endpoint:** `POST /api/fee-management/requests/create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "60d0fe4f5b9f9b2b4c8b456a",
  "courseId": "60d0fe4f5b9f9b2b4c8b4567",
  "batchId": "60d0fe4f5b9f9b2b4c8b4568",
  "totalAmount": 5000,
  "currency": "INR",
  "paymentMethod": "online",
  "dueDate": "2025-10-15T00:00:00.000Z",
  "notes": "Course fee for Python Programming"
}
```

**Field Descriptions:**
- `studentId` (required): MongoDB ObjectId of the student
- `courseId` (required): MongoDB ObjectId of the course
- `batchId` (required): MongoDB ObjectId of the batch
- `totalAmount` (required): Total fee amount (number, minimum 0)
- `currency` (optional): Currency code (default: "INR")
- `paymentMethod` (required): Either "online" or "cash"
- `dueDate` (required): Due date for payment (ISO date string)
- `notes` (optional): Additional notes (max 500 characters)

**Response:**
```json
{
  "success": true,
  "message": "Fee request created successfully",
  "data": {
    "feeRequest": {
      "_id": "60d0fe4f5b9f9b2b4c8b4569",
      "studentId": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "studentId": "STU001"
      },
      "courseId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Python Programming",
        "category": "Programming",
        "type": "online"
      },
      "batchId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "name": "Python Morning Batch",
        "startDate": "2025-10-01T00:00:00.000Z",
        "endDate": "2025-11-01T00:00:00.000Z"
      },
      "totalAmount": 5000,
      "currency": "INR",
      "paymentMethod": "online",
      "status": "pending",
      "paidAmount": 0,
      "remainingAmount": 5000,
      "dueDate": "2025-10-15T00:00:00.000Z",
      "requestDate": "2025-09-15T10:00:00.000Z",
      "notes": "Course fee for Python Programming",
      "createdBy": "60d0fe4f5b9f9b2b4c8b456b"
    }
  }
}
```

---

## 2. Get All Fee Requests

Retrieve all fee requests with filtering, pagination, and sorting options.

**Endpoint:** `GET /api/fee-management/requests`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "createdAt")
- `sortOrder` (optional): Sort order - "asc" or "desc" (default: "desc")
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `status` (optional): Filter by status (pending, paid, partial, overdue)
- `paymentMethod` (optional): Filter by payment method (online, cash)

**Example Request:**
```http
GET /api/fee-management/requests?page=1&limit=10&status=pending&paymentMethod=online
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fee requests retrieved successfully",
  "data": {
    "feeRequests": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "studentId": "STU001"
        },
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Python Programming",
          "category": "Programming",
          "type": "online"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z"
        },
        "totalAmount": 5000,
        "currency": "INR",
        "paymentMethod": "online",
        "status": "pending",
        "paidAmount": 0,
        "remainingAmount": 5000,
        "dueDate": "2025-10-15T00:00:00.000Z",
        "requestDate": "2025-09-15T10:00:00.000Z",
        "createdBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFeeRequests": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 3. Get Student Fee Requests

Retrieve all fee requests for a specific student with summary statistics.

**Endpoint:** `GET /api/fee-management/requests/student/:studentId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `studentId` (required): MongoDB ObjectId of the student

**Example Request:**
```http
GET /api/fee-management/requests/student/60d0fe4f5b9f9b2b4c8b456a
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fee requests retrieved successfully for student 60d0fe4f5b9f9b2b4c8b456a",
  "data": {
    "summary": {
      "totalRequests": 3,
      "totalAmount": 15000,
      "totalPaid": 5000,
      "totalRemaining": 10000,
      "pendingRequests": 2,
      "overdueRequests": 1,
      "paidRequests": 1
    },
    "feeRequests": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Python Programming",
          "category": "Programming",
          "type": "online"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z"
        },
        "totalAmount": 5000,
        "currency": "INR",
        "paymentMethod": "online",
        "status": "paid",
        "paidAmount": 5000,
        "remainingAmount": 0,
        "dueDate": "2025-10-15T00:00:00.000Z",
        "requestDate": "2025-09-15T10:00:00.000Z",
        "paymentDate": "2025-09-20T14:30:00.000Z"
      }
    ]
  }
}
```

---

## 4. Record Fee Payment

Record a payment for a fee request (for cash collection or manual entry).

**Endpoint:** `POST /api/fee-management/payments/record`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "feeRequestId": "60d0fe4f5b9f9b2b4c8b4569",
  "amount": 2500,
  "paymentMethod": "cash",
  "transactionId": "TXN123456789",
  "paymentReference": "CASH-001",
  "notes": "Partial payment received in cash"
}
```

**Field Descriptions:**
- `feeRequestId` (required): MongoDB ObjectId of the fee request
- `amount` (required): Payment amount (number, minimum 0)
- `paymentMethod` (required): Payment method (online, cash, bank_transfer, cheque)
- `transactionId` (optional): Transaction ID for online payments
- `paymentReference` (optional): Payment reference number
- `notes` (optional): Additional notes (max 500 characters)

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "_id": "60d0fe4f5b9f9b2b4c8b4570",
      "feeRequestId": "60d0fe4f5b9f9b2b4c8b4569",
      "studentId": {
        "_id": "60d0fe4f5b9f9b2b4c8b456a",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "studentId": "STU001"
      },
      "courseId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4567",
        "title": "Python Programming",
        "category": "Programming",
        "type": "online"
      },
      "batchId": {
        "_id": "60d0fe4f5b9f9b2b4c8b4568",
        "name": "Python Morning Batch",
        "startDate": "2025-10-01T00:00:00.000Z",
        "endDate": "2025-11-01T00:00:00.000Z"
      },
      "amount": 2500,
      "currency": "INR",
      "paymentMethod": "cash",
      "paymentStatus": "completed",
      "paymentDate": "2025-09-20T14:30:00.000Z",
      "transactionId": "TXN123456789",
      "paymentReference": "CASH-001",
      "receiptNumber": "CASH-1734567890-0001",
      "notes": "Partial payment received in cash",
      "collectedBy": {
        "_id": "60d0fe4f5b9f9b2b4c8b456b",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      }
    },
    "updatedFeeRequest": {
      "id": "60d0fe4f5b9f9b2b4c8b4569",
      "totalAmount": 5000,
      "paidAmount": 2500,
      "remainingAmount": 2500,
      "status": "partial"
    }
  }
}
```

---

## 5. Get Fee Payment History

Retrieve payment history with filtering and pagination options.

**Endpoint:** `GET /api/fee-management/payments/history`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "paymentDate")
- `sortOrder` (optional): Sort order - "asc" or "desc" (default: "desc")
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID
- `batchId` (optional): Filter by batch ID
- `paymentMethod` (optional): Filter by payment method
- `paymentStatus` (optional): Filter by payment status

**Example Request:**
```http
GET /api/fee-management/payments/history?page=1&limit=10&paymentMethod=cash
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4570",
        "feeRequestId": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": {
          "_id": "60d0fe4f5b9f9b2b4c8b456a",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "studentId": "STU001"
        },
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Python Programming",
          "category": "Programming",
          "type": "online"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z"
        },
        "amount": 2500,
        "currency": "INR",
        "paymentMethod": "cash",
        "paymentStatus": "completed",
        "paymentDate": "2025-09-20T14:30:00.000Z",
        "receiptNumber": "CASH-1734567890-0001",
        "notes": "Partial payment received in cash",
        "collectedBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalPayments": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 6. Get Fee Statistics

Retrieve comprehensive fee management statistics and analytics.

**Endpoint:** `GET /api/fee-management/statistics`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example Request:**
```http
GET /api/fee-management/statistics
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fee statistics retrieved successfully",
  "data": {
    "summary": {
      "totalFeeRequests": 150,
      "totalAmount": 750000,
      "totalPaid": 450000,
      "totalRemaining": 300000,
      "overdueCount": 25
    },
    "statusBreakdown": [
      { "_id": "pending", "count": 50 },
      { "_id": "paid", "count": 75 },
      { "_id": "partial", "count": 25 },
      { "_id": "overdue", "count": 25 }
    ],
    "paymentMethodBreakdown": [
      { "_id": "online", "count": 80 },
      { "_id": "cash", "count": 70 }
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: studentId, courseId, batchId, totalAmount, paymentMethod, dueDate"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Admin authentication required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create fee request"
}
```

---

## Business Logic Notes

1. **Fee Request Creation**: Only one active fee request per student per batch is allowed
2. **Payment Recording**: Payment amount cannot exceed remaining amount
3. **Status Updates**: Fee request status is automatically updated based on payment amounts
4. **Receipt Generation**: Cash payments automatically generate unique receipt numbers
5. **Overdue Tracking**: Fee requests automatically become overdue after the due date
6. **Enrollment Validation**: Students must be enrolled in the batch to create fee requests
