# Student Fee Management API Endpoints

This document describes the student-side fee management APIs that allow students to view their fee requests, payment history, and pending fees.

## Table of Contents

1. [Get My Fee Requests](#1-get-my-fee-requests)
2. [Get My Payment History](#2-get-my-payment-history)
3. [Get My Pending Fees](#3-get-my-pending-fees)
4. [Get My Fee Summary](#4-get-my-fee-summary)

---

## 1. Get My Fee Requests

Retrieve all fee requests for the authenticated student with summary statistics.

**Endpoint:** `GET /api/student/fees/requests`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Example Request:**
```http
GET /api/student/fees/requests
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Your fee requests retrieved successfully",
  "data": {
    "summary": {
      "totalRequests": 3,
      "totalAmount": 15000,
      "totalPaid": 5000,
      "totalRemaining": 10000,
      "pendingRequests": 2,
      "overdueRequests": 1,
      "paidRequests": 1,
      "partialRequests": 0
    },
    "feeRequests": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Python Programming",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8,
          "durationUnit": "weeks",
          "instructor": "Dr. Smith"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z",
          "maxStudents": 30,
          "price": 5000,
          "currency": "INR",
          "timeSlots": [
            {
              "date": "2025-10-01T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120,
              "isActive": true
            }
          ]
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
        "createdBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

---

## 2. Get My Payment History

Retrieve all payment history for the authenticated student.

**Endpoint:** `GET /api/student/fees/payments/history`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Example Request:**
```http
GET /api/student/fees/payments/history
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Your payment history retrieved successfully",
  "data": {
    "summary": {
      "totalPayments": 2,
      "totalAmountPaid": 7500,
      "cashPayments": 1,
      "onlinePayments": 1,
      "bankTransferPayments": 0,
      "chequePayments": 0
    },
    "payments": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4570",
        "feeRequestId": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
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
      }
    ]
  }
}
```

---

## 3. Get My Pending Fees

Retrieve all pending and overdue fee requests for the authenticated student with urgency indicators.

**Endpoint:** `GET /api/student/fees/pending`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Example Request:**
```http
GET /api/student/fees/pending
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Your pending fees retrieved successfully",
  "data": {
    "summary": {
      "totalPendingRequests": 2,
      "totalAmountDue": 7500,
      "overdueCount": 1,
      "pendingCount": 1,
      "partialCount": 0,
      "urgentCount": 1
    },
    "pendingFees": [
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4569",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4567",
          "title": "Python Programming",
          "category": "Programming",
          "type": "online",
          "price": 5000,
          "currency": "INR",
          "duration": 8,
          "durationUnit": "weeks",
          "instructor": "Dr. Smith"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4568",
          "name": "Python Morning Batch",
          "startDate": "2025-10-01T00:00:00.000Z",
          "endDate": "2025-11-01T00:00:00.000Z",
          "maxStudents": 30,
          "price": 5000,
          "currency": "INR",
          "timeSlots": [
            {
              "date": "2025-10-01T00:00:00.000Z",
              "startTime": "09:00",
              "endTime": "11:00",
              "duration": 120,
              "isActive": true
            }
          ]
        },
        "totalAmount": 5000,
        "currency": "INR",
        "paymentMethod": "online",
        "status": "overdue",
        "paidAmount": 0,
        "remainingAmount": 5000,
        "dueDate": "2025-09-10T00:00:00.000Z",
        "requestDate": "2025-09-01T10:00:00.000Z",
        "notes": "Course fee for Python Programming",
        "createdBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "urgency": "overdue",
        "daysUntilDue": -5
      },
      {
        "_id": "60d0fe4f5b9f9b2b4c8b4571",
        "studentId": "60d0fe4f5b9f9b2b4c8b456a",
        "courseId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4572",
          "title": "JavaScript Fundamentals",
          "category": "Programming",
          "type": "offline",
          "price": 3000,
          "currency": "INR",
          "duration": 6,
          "durationUnit": "weeks",
          "instructor": "Ms. Johnson"
        },
        "batchId": {
          "_id": "60d0fe4f5b9f9b2b4c8b4573",
          "name": "JavaScript Evening Batch",
          "startDate": "2025-11-01T00:00:00.000Z",
          "endDate": "2025-12-15T00:00:00.000Z",
          "maxStudents": 25,
          "price": 3000,
          "currency": "INR",
          "timeSlots": [
            {
              "date": "2025-11-01T00:00:00.000Z",
              "startTime": "18:00",
              "endTime": "20:00",
              "duration": 120,
              "isActive": true
            }
          ]
        },
        "totalAmount": 3000,
        "currency": "INR",
        "paymentMethod": "cash",
        "status": "pending",
        "paidAmount": 0,
        "remainingAmount": 3000,
        "dueDate": "2025-10-25T00:00:00.000Z",
        "requestDate": "2025-09-20T10:00:00.000Z",
        "notes": "Course fee for JavaScript Fundamentals",
        "createdBy": {
          "_id": "60d0fe4f5b9f9b2b4c8b456b",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "urgency": "urgent",
        "daysUntilDue": 2
      }
    ]
  }
}
```

**Urgency Levels:**
- `overdue`: Payment is past due date
- `urgent`: Due within 3 days
- `soon`: Due within 7 days
- `normal`: Due more than 7 days away

---

## 4. Get My Fee Summary

Retrieve a comprehensive overview of all fee-related data for the authenticated student.

**Endpoint:** `GET /api/student/fees/summary`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Example Request:**
```http
GET /api/student/fees/summary
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Your fee summary retrieved successfully",
  "data": {
    "summary": {
      "feeRequests": {
        "total": 3,
        "pending": 1,
        "overdue": 1,
        "partial": 0,
        "paid": 1
      },
      "amounts": {
        "totalRequested": 15000,
        "totalPaid": 5000,
        "totalRemaining": 10000
      },
      "payments": {
        "total": 2,
        "totalAmount": 5000,
        "byMethod": {
          "cash": 1,
          "online": 1,
          "bank_transfer": 0,
          "cheque": 0
        }
      },
      "urgency": {
        "overdue": 1,
        "dueSoon": 1
      }
    }
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Student authentication required."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Student role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "No fee requests found for you"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve your fee requests"
}
```

---

## Business Logic Notes

1. **Student Access**: Students can only view their own fee data
2. **Authentication**: All endpoints require valid student JWT token
3. **Authorization**: Only students can access these endpoints
4. **Data Privacy**: Students cannot see other students' fee information
5. **Urgency Calculation**: Urgency is calculated based on due dates and current status
6. **Summary Statistics**: All endpoints provide relevant summary statistics
7. **Payment Methods**: Supports tracking of different payment methods (cash, online, bank transfer, cheque)
8. **Status Tracking**: Comprehensive status tracking (pending, overdue, partial, paid)
