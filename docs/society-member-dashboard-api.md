# Society Member Dashboard & Chat System API Documentation

## Overview

The Society Member Dashboard provides a comprehensive overview of all member activities, including upcoming EMIs, loan management, investment tracking, and real-time chat functionality. This system offers a complete member experience with notifications, quick actions, and detailed statistics.

## Table of Contents

1. [Dashboard APIs](#dashboard-apis)
2. [Chat System APIs](#chat-system-apis)
3. [API Route Structure](#api-route-structure)
4. [Quick Reference - All Endpoints](#quick-reference---all-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Dashboard APIs

### 1. Get Comprehensive Dashboard Data

**Endpoint:** `GET /api/society-member/dashboard`

**Description:** Retrieves all dashboard data including member info, upcoming EMIs, loans, investments, payments, statistics, notifications, and quick actions.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "member": {
      "name": "John Doe",
      "memberId": "202501001",
      "email": "john.doe@example.com",
      "phoneNumber": "+919876543210",
      "societyName": "Sample Society",
      "position": "Member",
      "isActive": true,
      "isVerified": true,
      "kycStatus": "approved",
      "lastLogin": "2025-01-15T10:30:00.000Z"
    },
    "upcomingEMIs": [
      {
        "emiId": "EMI2509001",
        "emiNumber": 1,
        "emiAmount": 5000,
        "dueDate": "2025-01-20T00:00:00.000Z",
        "gracePeriodEndDate": "2025-01-25T00:00:00.000Z",
        "penaltyAmount": 0,
        "status": "pending",
        "isOverdue": false,
        "daysUntilDue": 5,
        "type": "loan",
        "loanRequestId": "LOAN2509001",
        "loanPurpose": "Personal"
      }
    ],
    "myLoans": {
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
      "recentLoans": [
        {
          "requestId": "LOAN2509001",
          "loanAmount": 50000,
          "disbursedAmount": 50000,
          "loanPurpose": "Personal",
          "status": "disbursed",
          "createdAt": "2025-01-15T10:30:00.000Z",
          "disbursedAt": "2025-01-15T16:00:00.000Z",
          "emiCount": 12,
          "paidEMIs": 0,
          "pendingEMIs": 12,
          "overdueEMIs": 0
        }
      ]
    },
    "myInvestments": {
      "totalInvestments": 1,
      "totalInvestmentAmount": 50000,
      "totalMaturityAmount": 60000,
      "statusBreakdown": {
        "active": 1,
        "completed": 0,
        "paused": 0
      },
      "recentInvestments": [
        {
          "investmentId": "INV861786",
          "principalAmount": 50000,
          "monthlyInstallment": 5000,
          "expectedMaturityAmount": 60000,
          "investmentDate": "2024-01-01T00:00:00.000Z",
          "maturityDate": "2025-01-01T00:00:00.000Z",
          "status": "active",
          "planName": "Monthly RD Plan",
          "planType": "RD",
          "interestRate": 8.5
        }
      ]
    },
    "recentPayments": [
      {
        "paymentId": "PAY75048993",
        "amount": 5000,
        "paymentType": "cash",
        "paymentMethod": "cash",
        "status": "pending",
        "verificationStatus": "pending",
        "paymentDate": "2025-01-15T10:30:00.000Z",
        "emiNumber": 1,
        "remarks": "Sample cash payment for testing"
      }
    ],
    "dashboardStats": {
      "emiStats": {
        "total": 13,
        "paid": 0,
        "pending": 13,
        "overdue": 0,
        "paymentRate": 0
      },
      "paymentStats": {
        "total": 1,
        "successful": 0,
        "pending": 1,
        "successRate": 0
      },
      "amountStats": {
        "totalPaid": 0,
        "totalPending": 65000
      }
    },
    "notifications": [
      {
        "type": "upcoming_emi",
        "title": "EMI Payment Due Soon",
        "message": "EMI #1 of ₹5000 is due in 5 days",
        "priority": "medium",
        "actionRequired": true,
        "emiId": "EMI2509001",
        "amount": 5000
      }
    ],
    "quickActions": [
      {
        "id": "view_emis",
        "title": "View EMIs",
        "description": "Check your upcoming and pending EMIs",
        "icon": "calendar",
        "route": "/api/society-member-payments/pending-emis",
        "available": true
      },
      {
        "id": "make_payment",
        "title": "Make Payment",
        "description": "Pay your pending EMIs online or cash",
        "icon": "payment",
        "route": "/api/society-member-payments/generate-order",
        "available": true
      },
      {
        "id": "apply_loan",
        "title": "Apply for Loan",
        "description": "Submit a new loan application",
        "icon": "loan",
        "route": "/api/loan-requests",
        "available": true
      }
    ]
  }
}
```

### 2. Get Upcoming EMIs

**Endpoint:** `GET /api/society-member/dashboard/upcoming-emis`

**Description:** Get upcoming EMIs for the next 3 months.

**Response:**
```json
{
  "success": true,
  "message": "Upcoming EMIs retrieved successfully",
  "data": [
    {
      "emiId": "EMI2509001",
      "emiNumber": 1,
      "emiAmount": 5000,
      "dueDate": "2025-01-20T00:00:00.000Z",
      "gracePeriodEndDate": "2025-01-25T00:00:00.000Z",
      "penaltyAmount": 0,
      "status": "pending",
      "isOverdue": false,
      "daysUntilDue": 5,
      "type": "loan",
      "loanRequestId": "LOAN2509001",
      "loanPurpose": "Personal"
    }
  ]
}
```

### 3. Get My Loans Summary

**Endpoint:** `GET /api/society-member/dashboard/my-loans`

**Description:** Get comprehensive loan summary for the member.

**Response:**
```json
{
  "success": true,
  "message": "Loans summary retrieved successfully",
  "data": {
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
    "recentLoans": [
      {
        "requestId": "LOAN2509001",
        "loanAmount": 50000,
        "disbursedAmount": 50000,
        "loanPurpose": "Personal",
        "status": "disbursed",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "disbursedAt": "2025-01-15T16:00:00.000Z",
        "emiCount": 12,
        "paidEMIs": 0,
        "pendingEMIs": 12,
        "overdueEMIs": 0
      }
    ]
  }
}
```

### 4. Get My Investments Summary

**Endpoint:** `GET /api/society-member/dashboard/my-investments`

**Description:** Get comprehensive investment summary for the member.

**Response:**
```json
{
  "success": true,
  "message": "Investments summary retrieved successfully",
  "data": {
    "totalInvestments": 1,
    "totalInvestmentAmount": 50000,
    "totalMaturityAmount": 60000,
    "statusBreakdown": {
      "active": 1,
      "completed": 0,
      "paused": 0
    },
    "recentInvestments": [
      {
        "investmentId": "INV861786",
        "principalAmount": 50000,
        "monthlyInstallment": 5000,
        "expectedMaturityAmount": 60000,
        "investmentDate": "2024-01-01T00:00:00.000Z",
        "maturityDate": "2025-01-01T00:00:00.000Z",
        "status": "active",
        "planName": "Monthly RD Plan",
        "planType": "RD",
        "interestRate": 8.5
      }
    ]
  }
}
```

### 5. Get Recent Payments

**Endpoint:** `GET /api/society-member/dashboard/recent-payments`

**Description:** Get recent payment history (last 5 payments).

**Response:**
```json
{
  "success": true,
  "message": "Recent payments retrieved successfully",
  "data": [
    {
      "paymentId": "PAY75048993",
      "amount": 5000,
      "paymentType": "cash",
      "paymentMethod": "cash",
      "status": "pending",
      "verificationStatus": "pending",
      "paymentDate": "2025-01-15T10:30:00.000Z",
      "emiNumber": 1,
      "remarks": "Sample cash payment for testing"
    }
  ]
}
```

### 6. Get Dashboard Statistics

**Endpoint:** `GET /api/society-member/dashboard/statistics`

**Description:** Get comprehensive dashboard statistics.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "emiStats": {
      "total": 13,
      "paid": 0,
      "pending": 13,
      "overdue": 0,
      "paymentRate": 0
    },
    "paymentStats": {
      "total": 1,
      "successful": 0,
      "pending": 1,
      "successRate": 0
    },
    "amountStats": {
      "totalPaid": 0,
      "totalPending": 65000
    }
  }
}
```

### 7. Get Notifications

**Endpoint:** `GET /api/society-member/dashboard/notifications`

**Description:** Get member notifications and alerts.

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "type": "upcoming_emi",
      "title": "EMI Payment Due Soon",
      "message": "EMI #1 of ₹5000 is due in 5 days",
      "priority": "medium",
      "actionRequired": true,
      "emiId": "EMI2509001",
      "amount": 5000
    },
    {
      "type": "overdue_emi",
      "title": "Overdue EMI Payment",
      "message": "EMI #2 of ₹5000 is overdue by 3 days",
      "priority": "high",
      "actionRequired": true,
      "emiId": "EMI2509002",
      "amount": 5000
    }
  ]
}
```

### 8. Get Quick Actions

**Endpoint:** `GET /api/society-member/dashboard/quick-actions`

**Description:** Get available quick actions for the member.

**Response:**
```json
{
  "success": true,
  "message": "Quick actions retrieved successfully",
  "data": [
    {
      "id": "view_emis",
      "title": "View EMIs",
      "description": "Check your upcoming and pending EMIs",
      "icon": "calendar",
      "route": "/api/society-member-payments/pending-emis",
      "available": true
    },
    {
      "id": "make_payment",
      "title": "Make Payment",
      "description": "Pay your pending EMIs online or cash",
      "icon": "payment",
      "route": "/api/society-member-payments/generate-order",
      "available": true
    },
    {
      "id": "apply_loan",
      "title": "Apply for Loan",
      "description": "Submit a new loan application",
      "icon": "loan",
      "route": "/api/loan-requests",
      "available": true
    }
  ]
}
```

## Chat System APIs

### 1. Create New Chat

**Endpoint:** `POST /api/society-member/chat`

**Description:** Create a new chat conversation.

**Request Body:**
```json
{
  "subject": "Loan Application Inquiry",
  "chatType": "member_to_admin",
  "category": "loan_inquiry",
  "priority": "medium",
  "participants": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "chatId": "CHAT2509001",
    "subject": "Loan Application Inquiry",
    "chatType": "member_to_admin",
    "category": "loan_inquiry",
    "priority": "medium",
    "status": "active",
    "participants": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "memberId": "202501001",
        "email": "john.doe@example.com"
      }
    ],
    "messageCount": 0,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Member's Chats

**Endpoint:** `GET /api/society-member/chat`

**Query Parameters:**
- `status` (optional): Filter by status (active, closed, archived)
- `chatType` (optional): Filter by chat type
- `category` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Chats retrieved successfully",
  "data": {
    "chats": [
      {
        "chatId": "CHAT2509001",
        "subject": "Loan Application Inquiry",
        "chatType": "member_to_admin",
        "category": "loan_inquiry",
        "priority": "medium",
        "status": "active",
        "messageCount": 3,
        "lastMessage": {
          "content": "Thank you for your response",
          "sentBy": {
            "firstName": "John",
            "lastName": "Doe",
            "memberId": "202501001"
          },
          "sentAt": "2025-01-15T11:00:00.000Z"
        },
        "unreadCount": [
          {
            "participant": "member_id_here",
            "count": 0
          }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalChats": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 3. Get Chat Details

**Endpoint:** `GET /api/society-member/chat/:chatId`

**Response:**
```json
{
  "success": true,
  "message": "Chat details retrieved successfully",
  "data": {
    "chatId": "CHAT2509001",
    "subject": "Loan Application Inquiry",
    "chatType": "member_to_admin",
    "category": "loan_inquiry",
    "priority": "medium",
    "status": "active",
    "participants": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "memberId": "202501001",
        "email": "john.doe@example.com"
      }
    ],
    "messageCount": 3,
    "lastMessage": {
      "content": "Thank you for your response",
      "sentBy": {
        "firstName": "John",
        "lastName": "Doe",
        "memberId": "202501001"
      },
      "sentAt": "2025-01-15T11:00:00.000Z"
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Send Message

**Endpoint:** `POST /api/society-member/chat/:chatId/messages`

**Content-Type:** `multipart/form-data` (for file attachments)

**Request Body:**
```json
{
  "content": "Hello, I have a question about my loan application",
  "messageType": "text",
  "replyTo": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "MSG2509001",
    "chatId": "chat_object_id",
    "sender": {
      "firstName": "John",
      "lastName": "Doe",
      "memberId": "202501001",
      "email": "john.doe@example.com"
    },
    "content": "Hello, I have a question about my loan application",
    "messageType": "text",
    "status": "sent",
    "attachments": [],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 5. Get Chat Messages

**Endpoint:** `GET /api/society-member/chat/:chatId/messages`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Chat messages retrieved successfully",
  "data": {
    "messages": [
      {
        "messageId": "MSG2509001",
        "sender": {
          "firstName": "John",
          "lastName": "Doe",
          "memberId": "202501001",
          "email": "john.doe@example.com"
        },
        "content": "Hello, I have a question about my loan application",
        "messageType": "text",
        "status": "sent",
        "attachments": [],
        "readBy": [
          {
            "user": "admin_id_here",
            "readAt": "2025-01-15T10:35:00.000Z"
          }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 6. Edit Message

**Endpoint:** `PUT /api/society-member/chat/messages/:messageId`

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": {
    "messageId": "MSG2509001",
    "content": "Updated message content",
    "metadata": {
      "isEdited": true,
      "editedAt": "2025-01-15T10:40:00.000Z"
    }
  }
}
```

### 7. Delete Message

**Endpoint:** `DELETE /api/society-member/chat/messages/:messageId`

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### 8. Get Chat Statistics

**Endpoint:** `GET /api/society-member/chat/statistics/overview`

**Response:**
```json
{
  "success": true,
  "message": "Chat statistics retrieved successfully",
  "data": {
    "totalChats": 5,
    "activeChats": 3,
    "totalMessages": 25,
    "unreadMessages": 2
  }
}
```

## API Route Structure

### Dashboard Routes
- **Base Path:** `/api/society-member/dashboard`
- **Authentication:** Required (JWT token)
- **Authorization:** societyMember role

### Chat Routes
- **Base Path:** `/api/society-member/chat`
- **Authentication:** Required (JWT token)
- **Authorization:** societyMember role

## Quick Reference - All Endpoints

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/society-member/dashboard` | Get comprehensive dashboard data |
| GET | `/api/society-member/dashboard/upcoming-emis` | Get upcoming EMIs |
| GET | `/api/society-member/dashboard/my-loans` | Get loans summary |
| GET | `/api/society-member/dashboard/my-investments` | Get investments summary |
| GET | `/api/society-member/dashboard/recent-payments` | Get recent payments |
| GET | `/api/society-member/dashboard/statistics` | Get dashboard statistics |
| GET | `/api/society-member/dashboard/notifications` | Get notifications |
| GET | `/api/society-member/dashboard/quick-actions` | Get quick actions |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/society-member/chat` | Create new chat |
| GET | `/api/society-member/chat` | Get member's chats |
| GET | `/api/society-member/chat/:chatId` | Get chat details |
| POST | `/api/society-member/chat/:chatId/messages` | Send message |
| GET | `/api/society-member/chat/:chatId/messages` | Get chat messages |
| PUT | `/api/society-member/chat/messages/:messageId` | Edit message |
| DELETE | `/api/society-member/chat/messages/:messageId` | Delete message |
| GET | `/api/society-member/chat/statistics/overview` | Get chat statistics |

## Data Models

### Chat Model
```javascript
{
  chatId: String, // CHAT2509001
  participants: [ObjectId], // SocietyMember references
  chatType: String, // member_to_admin, member_to_member, group, support
  subject: String,
  status: String, // active, closed, archived
  priority: String, // low, medium, high, urgent
  category: String, // general, loan_inquiry, payment_issue, etc.
  lastMessage: {
    content: String,
    sentBy: ObjectId,
    sentAt: Date
  },
  messageCount: Number,
  unreadCount: [{
    participant: ObjectId,
    count: Number
  }]
}
```

### ChatMessage Model
```javascript
{
  messageId: String, // MSG2509001
  chatId: ObjectId,
  sender: ObjectId,
  content: String,
  messageType: String, // text, image, file, system, etc.
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  }],
  status: String, // sent, delivered, read, failed
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  replyTo: ObjectId,
  metadata: {
    isEdited: Boolean,
    editedAt: Date,
    isDeleted: Boolean,
    deletedAt: Date
  }
}
```

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "subject",
      "message": "Subject must be between 5 and 200 characters"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Chat not found or access denied"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Access denied. Invalid token."
}
```

## Examples

### Complete Dashboard Flow

1. **Get Dashboard Data**
```bash
curl -X GET http://localhost:3000/api/society-member/dashboard \
  -H "Authorization: Bearer <token>"
```

2. **Create Chat**
```bash
curl -X POST http://localhost:3000/api/society-member/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Loan Application Inquiry",
    "chatType": "member_to_admin",
    "category": "loan_inquiry",
    "priority": "medium"
  }'
```

3. **Send Message**
```bash
curl -X POST http://localhost:3000/api/society-member/chat/CHAT2509001/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, I have a question about my loan application",
    "messageType": "text"
  }'
```

4. **Get Chat Messages**
```bash
curl -X GET http://localhost:3000/api/society-member/chat/CHAT2509001/messages \
  -H "Authorization: Bearer <token>"
```

## Route Registration Status

✅ **All routes are properly registered in app.js:**
- `/api/society-member/dashboard` → Dashboard APIs
- `/api/society-member/chat` → Chat System APIs

## Summary

The Society Member Dashboard & Chat System provides:

1. **Comprehensive Dashboard**: Complete overview of member activities
2. **Upcoming EMIs**: Track pending payments and due dates
3. **Loan Management**: View loan applications and status
4. **Investment Tracking**: Monitor investment portfolio
5. **Payment History**: Recent payment transactions
6. **Real-time Chat**: Communicate with admins and other members
7. **Notifications**: Important alerts and reminders
8. **Quick Actions**: Easy access to common tasks
9. **Statistics**: Detailed analytics and insights

The system is fully integrated with the existing loan management and payment infrastructure, providing a seamless member experience.
