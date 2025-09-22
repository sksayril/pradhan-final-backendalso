# CD Investment System

## Overview

The CD (Certificate of Deposit) Investment System allows both students and society members to request CD investments with fixed interest rates and tenures. The system includes admin approval workflow and comprehensive tracking of all CD investments.

## Key Features

- **User Investment Requests**: Users can request CD investments with specific amounts and tenures
- **Admin Approval Workflow**: Admins can approve or reject CD investment requests
- **Investment Capacity Management**: Users have investment limits to prevent over-investment
- **Fixed Interest Rates**: Predefined interest rates based on tenure
- **Comprehensive Tracking**: Full tracking of investment lifecycle from request to maturity
- **No Admin Plan Creation**: CD investments use fixed rates, no custom plans needed

## CD Investment Options

### Available Tenures and Interest Rates

| Tenure | Interest Rate | Label |
|--------|---------------|-------|
| 6 months | 6.5% | 6 Months |
| 12 months | 7.5% | 12 Months |
| 18 months | 8.0% | 18 Months |
| 24 months | 8.5% | 24 Months |
| 36 months | 9.0% | 36 Months |
| 48 months | 9.5% | 48 Months |
| 60 months | 10.0% | 60 Months |

### Investment Limits

- **Minimum Amount**: ₹1,000
- **Maximum Amount**: ₹10,00,000 per investment
- **Maximum Total Investment**: ₹5,00,000 per user (across all CD investments)

## API Endpoints

### User CD Investment Endpoints

#### 1. Get CD Investment Information
```http
GET /api/cd-investment/info
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cdOptions": {
      "tenures": [
        {
          "months": 12,
          "interestRate": 7.5,
          "label": "12 Months"
        }
      ],
      "minAmount": 1000,
      "maxAmount": 1000000,
      "features": [
        "Fixed interest rate",
        "Guaranteed returns",
        "Flexible tenure options",
        "Auto-renewal available",
        "Early withdrawal with penalty"
      ]
    },
    "userInfo": {
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userType": "student",
      "userIdentifier": "PETF123456",
      "email": "student@example.com",
      "name": "John Doe"
    },
    "investmentCapacity": {
      "totalInvested": 50000,
      "remainingCapacity": 450000,
      "maxTotalInvestment": 500000,
      "canInvest": true
    },
    "existingInvestments": [
      {
        "cdId": "CD12345678",
        "amount": 50000,
        "status": "active",
        "maturityDate": "2025-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Request CD Investment
```http
POST /api/cd-investment/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "investmentAmount": 50000,
  "tenureMonths": 12,
  "purpose": "Education fund",
  "notes": "Planning for higher studies"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CD investment request submitted successfully",
  "data": {
    "cdInvestment": {
      "cdId": "CD87654321",
      "investmentAmount": 50000,
      "tenureMonths": 12,
      "interestRate": 7.5,
      "maturityAmount": 53750,
      "totalInterest": 3750,
      "status": "pending",
      "requestDate": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 3. Get My CD Investments
```http
GET /api/cd-investment/my-investments?status=active&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "cdId": "CD12345678",
        "investmentAmount": 50000,
        "tenureMonths": 12,
        "interestRate": 7.5,
        "maturityAmount": 53750,
        "totalInterest": 3750,
        "status": "active",
        "requestDate": "2024-01-15T10:30:00.000Z",
        "approvalDate": "2024-01-16T09:00:00.000Z",
        "maturityDate": "2025-01-16T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    },
    "summary": {
      "active": {
        "count": 1,
        "totalAmount": 50000
      },
      "pending": {
        "count": 0,
        "totalAmount": 0
      }
    }
  }
}
```

#### 4. Get CD Investment Details
```http
GET /api/cd-investment/CD12345678
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "investment": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "cdId": "CD12345678",
      "investmentAmount": 50000,
      "tenureMonths": 12,
      "interestRate": 7.5,
      "maturityAmount": 53750,
      "totalInterest": 3750,
      "status": "active",
      "isMatured": false,
      "remainingTenure": 300,
      "userDisplayName": "Student: PETF123456",
      "requestDate": "2024-01-15T10:30:00.000Z",
      "approvalDate": "2024-01-16T09:00:00.000Z",
      "maturityDate": "2025-01-16T09:00:00.000Z"
    }
  }
}
```

### Admin CD Investment Endpoints

#### 1. Get Pending CD Requests
```http
GET /api/admin/cd-investment/pending-requests?page=1&limit=20&userType=student
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "cdId": "CD87654321",
        "userId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "student@example.com",
          "studentId": "PETF123456"
        },
        "investmentAmount": 50000,
        "tenureMonths": 12,
        "interestRate": 7.5,
        "maturityAmount": 53750,
        "totalInterest": 3750,
        "status": "pending",
        "requestDate": "2024-01-15T10:30:00.000Z",
        "purpose": "Education fund"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    },
    "summary": {
      "Student": {
        "count": 1,
        "totalAmount": 50000
      },
      "SocietyMember": {
        "count": 0,
        "totalAmount": 0
      }
    }
  }
}
```

#### 2. Approve CD Request
```http
PATCH /api/admin/cd-investment/CD87654321/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "adminNotes": "Approved after verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CD investment request approved successfully",
  "data": {
    "investment": {
      "cdId": "CD87654321",
      "status": "approved",
      "approvalDate": "2024-01-16T09:00:00.000Z",
      "maturityDate": "2025-01-16T09:00:00.000Z",
      "adminNotes": "Approved after verification"
    }
  }
}
```

#### 3. Reject CD Request
```http
PATCH /api/admin/cd-investment/CD87654321/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient documentation provided",
  "adminNotes": "Please provide additional KYC documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CD investment request rejected successfully",
  "data": {
    "investment": {
      "cdId": "CD87654321",
      "status": "rejected",
      "rejectionReason": "Insufficient documentation provided",
      "adminNotes": "Please provide additional KYC documents"
    }
  }
}
```

#### 4. Get All CD Investments
```http
GET /api/admin/cd-investment/all-investments?status=active&userType=student&page=1&limit=20&search=PETF123456
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "cdId": "CD12345678",
        "userId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "student@example.com",
          "studentId": "PETF123456"
        },
        "investmentAmount": 50000,
        "tenureMonths": 12,
        "interestRate": 7.5,
        "maturityAmount": 53750,
        "totalInterest": 3750,
        "status": "active",
        "requestDate": "2024-01-15T10:30:00.000Z",
        "approvalDate": "2024-01-16T09:00:00.000Z",
        "maturityDate": "2025-01-16T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    },
    "statistics": {
      "overall": {
        "totalInvestments": 1,
        "totalAmount": 50000,
        "totalMaturityAmount": 53750,
        "totalInterest": 3750,
        "avgInvestmentAmount": 50000,
        "avgInterestRate": 7.5
      },
      "byStatus": {
        "active": {
          "count": 1,
          "totalAmount": 50000
        }
      },
      "byUserType": {
        "Student": {
          "count": 1,
          "totalAmount": 50000
        }
      }
    }
  }
}
```

## CD Investment Lifecycle

### 1. Request Phase
- User submits CD investment request with amount and tenure
- System validates investment amount and user capacity
- Request is created with status "pending"
- Unique CD ID is auto-generated

### 2. Approval Phase
- Admin reviews pending requests
- Admin can approve or reject with reasons
- Upon approval, maturity date is calculated
- Status changes to "approved"

### 3. Active Phase
- CD investment is active and earning interest
- User can view investment details and maturity information
- System tracks remaining tenure

### 4. Maturity Phase
- CD reaches maturity date
- Status can be updated to "matured"
- User can withdraw or renew investment

## Business Rules

### Investment Limits
- Minimum investment: ₹1,000
- Maximum investment: ₹10,00,000 per CD
- Maximum total investment: ₹5,00,000 per user
- Investment capacity is checked before approval

### Interest Calculation
- Simple interest calculation: Principal × Rate × Time
- Interest rates are fixed based on tenure
- Maturity amount = Principal + Interest

### CD ID Generation
- Format: CD + 8 random digits (e.g., CD12345678)
- Auto-generated and unique
- Used for tracking and reference

### Status Management
- **pending**: Request submitted, awaiting admin approval
- **approved**: Admin approved, CD is active
- **active**: CD is earning interest
- **matured**: CD has reached maturity date
- **cancelled**: User cancelled before approval
- **rejected**: Admin rejected the request

## Error Handling

### Common Error Responses

#### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Investment amount must be between ₹1,000 and ₹10,00,000",
    "Tenure must be one of: 6, 12, 18, 24, 36, 48, 60 months"
  ]
}
```

#### Capacity Exceeded
```json
{
  "success": false,
  "message": "Investment amount exceeds your remaining capacity. You can invest maximum ₹450,000 more."
}
```

#### CD Not Found
```json
{
  "success": false,
  "message": "CD investment not found"
}
```

#### Invalid Status Change
```json
{
  "success": false,
  "message": "CD investment request is already approved"
}
```

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own investments
3. **Admin Privileges**: Only admins can approve/reject requests
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: API endpoints have rate limiting protection

## Usage Examples

### Frontend Integration

```javascript
// Get CD investment information
const getCDInfo = async () => {
  const response = await fetch('/api/cd-investment/info', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Request CD investment
const requestCDInvestment = async (amount, tenure, purpose) => {
  const response = await fetch('/api/cd-investment/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      investmentAmount: amount,
      tenureMonths: tenure,
      purpose: purpose,
    }),
  });
  return response.json();
};

// Get user's CD investments
const getMyCDInvestments = async (status = null) => {
  const url = status 
    ? `/api/cd-investment/my-investments?status=${status}`
    : '/api/cd-investment/my-investments';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

### Admin Functions

```javascript
// Get pending requests
const getPendingRequests = async () => {
  const response = await fetch('/api/admin/cd-investment/pending-requests', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Approve CD request
const approveCDRequest = async (cdId, adminNotes) => {
  const response = await fetch(`/api/admin/cd-investment/${cdId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ adminNotes }),
  });
  return response.json();
};

// Reject CD request
const rejectCDRequest = async (cdId, rejectionReason, adminNotes) => {
  const response = await fetch(`/api/admin/cd-investment/${cdId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ rejectionReason, adminNotes }),
  });
  return response.json();
};
```

## Database Schema

### CDInvestment Model

```javascript
{
  userId: ObjectId,           // Reference to Student or SocietyMember
  userType: String,           // 'Student' or 'SocietyMember'
  userEmail: String,          // User's email
  userStudentId: String,      // Student ID (if student)
  userMemberId: String,       // Member ID (if society member)
  cdId: String,               // Unique CD identifier
  investmentAmount: Number,    // Investment amount
  tenureMonths: Number,       // Tenure in months
  interestRate: Number,       // Interest rate percentage
  maturityAmount: Number,     // Total maturity amount
  totalInterest: Number,      // Total interest earned
  maturityDate: Date,         // Maturity date
  status: String,             // Investment status
  requestDate: Date,          // Request submission date
  approvalDate: Date,         // Admin approval date
  approvedBy: ObjectId,       // Admin who approved
  rejectionReason: String,    // Rejection reason (if rejected)
  purpose: String,            // Investment purpose
  notes: String,              // User notes
  adminNotes: String,         // Admin notes
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

## Best Practices

1. **User Experience**: Always show investment capacity before allowing requests
2. **Admin Workflow**: Implement proper approval/rejection workflow with reasons
3. **Error Handling**: Provide clear error messages for validation failures
4. **Security**: Validate all inputs and implement proper authorization
5. **Performance**: Use pagination for large datasets
6. **Monitoring**: Track investment statistics and user behavior
7. **Documentation**: Maintain clear documentation for all API endpoints

## Future Enhancements

1. **Auto-renewal**: Automatic renewal of matured CDs
2. **Early withdrawal**: Allow early withdrawal with penalty
3. **Payment integration**: Integrate with payment gateways
4. **Notifications**: Email/SMS notifications for maturity dates
5. **Reporting**: Advanced reporting and analytics
6. **Mobile app**: Dedicated mobile application
7. **API versioning**: Version control for API changes
