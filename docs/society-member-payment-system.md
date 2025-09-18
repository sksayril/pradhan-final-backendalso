# Society Member Payment System

## Overview

The Society Member Payment System is a comprehensive solution for managing payments related to investment plans for society members. It supports both cash and online payments, EMI tracking, penalty management, and provides detailed reporting capabilities.

## Features

### 🔄 Payment Types
- **Cash Payments**: Admin can record cash payments received from members
- **Online Payments**: Members can make payments through various online methods (UPI, Net Banking, Cards, Wallets)
- **Payment Screenshots**: Members can upload payment confirmation screenshots for verification

### 📊 EMI Management
- **EMI Schedule Generation**: Automatic EMI schedule creation for investment plans
- **EMI Tracking**: Real-time tracking of EMI payments and status
- **Overdue Management**: Identification and management of overdue EMIs
- **Penalty System**: Automatic penalty calculation and application for overdue payments
- **Grace Period**: Configurable grace period for late payments

### 📈 Reporting & Analytics
- **Member Payment Reports**: Comprehensive payment history for individual members
- **Investment Payment Summary**: Complete payment overview for each investment
- **Payment Statistics**: System-wide payment analytics and insights
- **Overdue Reports**: Detailed reports on overdue payments and penalties

## API Endpoints

### Society Member Payment Endpoints

#### 1. Generate Payment Order
```http
POST /api/society-member/payments/generate-order
```

**Authentication**: Society Member required

**Request Body**:
```json
{
  "investmentId": "64a1b2c3d4e5f6789012345",
  "emiNumber": 1,
  "amount": 5000,
  "paymentMethod": "upi"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment order generated successfully",
  "data": {
    "paymentId": "PAY2412001",
    "transactionId": "TXN1703123456ABC123",
    "amount": 5000,
    "paymentOrder": {
      "orderId": "TXN1703123456ABC123",
      "amount": 500000,
      "currency": "INR",
      "receipt": "PAY2412001"
    }
  }
}
```

#### 2. Process Payment Callback
```http
POST /api/society-member/payments/callback
```

**Request Body**:
```json
{
  "paymentId": "PAY2412001",
  "transactionId": "TXN1703123456ABC123",
  "gatewayResponse": {
    "gatewayName": "razorpay",
    "gatewayTransactionId": "pay_ABC123XYZ",
    "gatewayStatus": "captured",
    "gatewaySignature": "signature_hash"
  }
}
```

#### 3. Upload Payment Screenshot
```http
POST /api/society-member/payments/:paymentId/screenshot
```

**Authentication**: Society Member required

**Request**: Multipart form data
- `screenshot`: Image file
- `screenshotType`: "payment_confirmation" | "bank_statement" | "upi_screenshot" | "receipt" | "other"
- `description`: Optional description

#### 4. Get Payment History
```http
GET /api/society-member/payments/history?page=1&limit=10&status=completed
```

**Authentication**: Society Member required

**Query Parameters**:
- `status`: Payment status filter
- `paymentType`: Payment type filter
- `startDate`: Start date filter (ISO 8601)
- `endDate`: End date filter (ISO 8601)
- `page`: Page number
- `limit`: Items per page

#### 5. Get EMI Details
```http
GET /api/society-member/payments/emi/:investmentId
```

**Authentication**: Society Member required

**Response**:
```json
{
  "success": true,
  "data": {
    "investmentDetails": {
      "investmentId": "INV2412001",
      "principalAmount": 100000,
      "expectedMaturityAmount": 120000
    },
    "emiSummary": {
      "totalEMIs": 12,
      "paidEMIs": 5,
      "pendingEMIs": 7,
      "overdueEMIs": 2,
      "totalEMIAmount": 60000,
      "totalPaidAmount": 25000,
      "totalPendingAmount": 35000,
      "totalPenaltyAmount": 500
    },
    "emiRecords": [...],
    "overdueEMIs": [...],
    "nextDueEMI": {...}
  }
}
```

#### 6. Get Investment Payment Summary
```http
GET /api/society-member/payments/summary/investments
```

**Authentication**: Society Member required

### Admin Payment Management Endpoints

#### 1. Add Cash Payment
```http
POST /api/admin/payments/cash-payment
```

**Authentication**: Admin required

**Request Body**:
```json
{
  "memberId": "64a1b2c3d4e5f6789012345",
  "investmentId": "64a1b2c3d4e5f6789012346",
  "emiNumber": 1,
  "amount": 5000,
  "paymentFor": "emi",
  "receiptNumber": "RCP001",
  "remarks": "Cash payment received"
}
```

#### 2. Verify Online Payment
```http
PUT /api/admin/payments/verify/:paymentId
```

**Authentication**: Admin required

**Request Body**:
```json
{
  "verificationStatus": "verified",
  "remarks": "Payment verified successfully"
}
```

#### 3. Get Member Payment Report
```http
GET /api/admin/payments/report/member/:memberId?startDate=2024-01-01&endDate=2024-12-31
```

**Authentication**: Admin required

**Query Parameters**:
- `startDate`: Report start date
- `endDate`: Report end date
- `includeEMIDetails`: Include EMI details (boolean)
- `includeOverdue`: Include overdue EMIs (boolean)

#### 4. Get Pending Payments
```http
GET /api/admin/payments/pending?paymentType=online&page=1&limit=10
```

**Authentication**: Admin required

#### 5. Get Payment Statistics
```http
GET /api/admin/payments/statistics?startDate=2024-01-01&endDate=2024-12-31
```

**Authentication**: Admin required

### EMI Tracking Endpoints

#### 1. Generate EMI Schedule
```http
POST /api/admin/emi-tracking/generate/:investmentId
```

**Authentication**: Admin required

#### 2. Get EMI Schedule
```http
GET /api/admin/emi-tracking/schedule/:investmentId
```

**Authentication**: Admin required

#### 3. Get Overdue EMIs
```http
GET /api/admin/emi-tracking/overdue?memberId=64a1b2c3d4e5f6789012345&page=1&limit=10
```

**Authentication**: Admin required

#### 4. Apply Penalty
```http
POST /api/admin/emi-tracking/penalty/:emiId
```

**Authentication**: Admin required

**Request Body**:
```json
{
  "penaltyAmount": 100,
  "penaltyRate": 2,
  "reason": "Late payment penalty"
}
```

#### 5. Waive Penalty
```http
POST /api/admin/emi-tracking/waive-penalty/:emiId
```

**Authentication**: Admin required

**Request Body**:
```json
{
  "reason": "Member facing financial difficulties"
}
```

#### 6. Send EMI Reminder
```http
POST /api/admin/emi-tracking/reminder/:emiId
```

**Authentication**: Admin required

**Request Body**:
```json
{
  "reminderType": "overdue",
  "reminderMethod": "email",
  "message": "Your EMI payment is overdue. Please make payment at the earliest."
}
```

#### 7. Get EMI Statistics
```http
GET /api/admin/emi-tracking/statistics?memberId=64a1b2c3d4e5f6789012345
```

**Authentication**: Admin required

## Data Models

### Payment Model
```javascript
{
  paymentId: String,           // Auto-generated payment ID
  transactionId: String,       // Gateway transaction ID
  investmentId: ObjectId,      // Reference to Investment
  memberId: ObjectId,          // Reference to SocietyMember
  planId: ObjectId,            // Reference to InvestmentPlan
  paymentType: String,         // 'cash' | 'online' | 'cheque' | 'bank_transfer'
  paymentMethod: String,       // Payment method details
  amount: Number,              // Payment amount
  emiNumber: Number,           // EMI number (if applicable)
  paymentFor: String,          // 'principal' | 'emi' | 'penalty' | 'interest'
  status: String,              // Payment status
  gatewayResponse: Object,     // Gateway response data
  cashPaymentDetails: Object,  // Cash payment specific details
  paymentScreenshots: Array,   // Uploaded screenshots
  verificationStatus: String,  // Verification status
  paymentDate: Date,           // Payment date
  remarks: String              // Additional remarks
}
```

### EMI Record Model
```javascript
{
  emiId: String,               // Auto-generated EMI ID
  investmentId: ObjectId,      // Reference to Investment
  memberId: ObjectId,          // Reference to SocietyMember
  planId: ObjectId,            // Reference to InvestmentPlan
  emiNumber: Number,           // EMI sequence number
  emiAmount: Number,           // EMI amount
  dueDate: Date,               // Due date
  gracePeriodEndDate: Date,    // Grace period end date
  status: String,              // EMI status
  paidDate: Date,              // Payment date
  paidAmount: Number,          // Amount paid
  penaltyAmount: Number,       // Penalty amount
  paymentIds: Array,           // Reference to Payment records
  penaltyDetails: Object,      // Penalty information
  calculationDetails: Object,  // EMI calculation details
  reminders: Array             // Reminder history
}
```

## Payment Flow

### Online Payment Flow
1. **Member initiates payment**: Member calls generate payment order API
2. **Payment order created**: System creates payment record with pending status
3. **Gateway integration**: Payment order sent to payment gateway
4. **Payment processing**: Member completes payment on gateway
5. **Callback received**: Gateway sends callback with payment status
6. **Verification**: Admin verifies payment (if required)
7. **EMI update**: EMI record updated with payment details
8. **Investment update**: Investment payment history updated

### Cash Payment Flow
1. **Admin records payment**: Admin adds cash payment through API
2. **Immediate completion**: Payment marked as completed
3. **EMI update**: EMI record updated immediately
4. **Investment update**: Investment payment history updated

## Security Features

### Authentication & Authorization
- JWT-based authentication for all endpoints
- Role-based access control (Admin vs Society Member)
- Member can only access their own payment data
- Admin has full access to all payment data

### Data Validation
- Comprehensive input validation for all endpoints
- Sanitization of user inputs
- File upload validation for screenshots
- Amount and date validation

### Payment Security
- Payment signature verification
- Secure file upload to AWS S3
- Encrypted sensitive data storage
- Audit trail for all payment operations

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request / Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Internal server error

## Integration Guide

### Payment Gateway Integration
The system is designed to work with multiple payment gateways. To integrate a new gateway:

1. Update the `generatePaymentOrder` function in `societyMemberPaymentController.js`
2. Implement gateway-specific signature verification
3. Update the callback processing logic
4. Add gateway-specific configuration

### File Upload Integration
Payment screenshots are uploaded to AWS S3. To configure:

1. Set up AWS S3 bucket
2. Configure AWS credentials in environment variables
3. Update S3 configuration in `config/aws.js`

## Testing

### Test Scenarios
1. **Payment Order Generation**: Test with valid and invalid investment IDs
2. **Payment Callback**: Test with valid and invalid signatures
3. **Cash Payment**: Test admin cash payment recording
4. **EMI Tracking**: Test EMI schedule generation and updates
5. **Penalty Management**: Test penalty application and waiver
6. **File Upload**: Test screenshot upload functionality

### Sample Test Data
```javascript
// Sample investment for testing
const testInvestment = {
  investmentId: "INV2412001",
  memberId: "64a1b2c3d4e5f6789012345",
  planId: "64a1b2c3d4e5f6789012346",
  principalAmount: 100000,
  monthlyInstallment: 5000
};

// Sample EMI record
const testEMI = {
  emiNumber: 1,
  emiAmount: 5000,
  dueDate: "2024-02-01",
  status: "pending"
};
```

## Monitoring & Analytics

### Key Metrics
- Total payments processed
- Payment success rate
- Average payment processing time
- Overdue EMI percentage
- Penalty collection rate

### Reports Available
- Daily payment summary
- Monthly payment trends
- Member payment history
- Overdue payment reports
- Penalty collection reports

## Maintenance

### Regular Tasks
1. **Database cleanup**: Archive old payment records
2. **File cleanup**: Remove old screenshot files
3. **Performance monitoring**: Monitor API response times
4. **Security updates**: Keep dependencies updated

### Backup Strategy
- Daily database backups
- S3 file backups
- Configuration backups
- Log file retention

## Support

For technical support or questions about the payment system:
- Check API documentation
- Review error logs
- Contact system administrator
- Refer to troubleshooting guide

---

*Last updated: December 2024*
*Version: 1.0.0*
