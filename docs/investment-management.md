# Investment Management System Documentation

This document provides comprehensive documentation for the Investment Management System, including FD (Fixed Deposit), RD (Recurring Deposit), and CD (Certificate of Deposit) plans for society members with enhanced EMI cost structure and detailed calculations. **Note: All validation constraints have been removed - the system accepts any data without validation.**

## Table of Contents

1. [Overview](#overview)
2. [Investment Plan Types](#investment-plan-types)
3. [EMI Cost Structure](#emi-cost-structure)
4. [Admin APIs](#admin-apis)
5. [Society Member APIs](#society-member-apis)
6. [EMI Tracking & Penalty System](#emi-tracking--penalty-system)
7. [Investment Calculations](#investment-calculations)
8. [Examples](#examples)
9. [Error Handling](#error-handling)

## Overview

The Investment Management System provides comprehensive functionality for managing investment plans and individual investments for society members. It includes:

- **Three Investment Types**: FD, RD, CD with different calculation methods
- **Enhanced EMI Cost Structure**: Detailed cost breakdowns for all plan types
- **Admin Management**: Create, update, and manage investment plans with EMI cost configuration
- **Member Self-Service**: View plans, calculate returns, track investments with detailed cost analysis
- **EMI Tracking**: Complete EMI schedule management for RD plans
- **Penalty System**: Automated penalty calculation and tracking
- **Return Calculations**: Real-time maturity amount calculations with sample EMI costs
- **Cost Analysis**: Detailed breakdown of investment costs, returns, and monthly earnings
- **No Validation Constraints**: System accepts any data without validation - all fields are optional and flexible
- **Auto-Generated Plan IDs**: Investment plans automatically get unique plan IDs in format `PLAN2511001`

## Investment Plan Types

### 1. Fixed Deposit (FD)
- **Description**: One-time investment with fixed tenure
- **Calculation**: Compound interest based on compounding frequency
- **Features**: Fixed amount, guaranteed returns, no monthly payments

### 2. Recurring Deposit (RD)
- **Description**: Monthly installment-based investment
- **Calculation**: Compound interest on monthly installments
- **Features**: Monthly EMI tracking, penalty for missed payments
- **EMI Management**: Complete schedule with due dates and status tracking

### 3. Certificate of Deposit (CD)
- **Description**: Similar to FD but with certificate number
- **Calculation**: Same as FD with additional certificate tracking
- **Features**: Unique certificate number, document management

## Flexible Validation System

**Important Note**: All validation constraints have been removed from the investment plan system. This means:

- **No Required Fields**: All fields are optional - you can create plans with minimal data
- **No Minimum/Maximum Limits**: Any amount, interest rate, or percentage is accepted
- **No Plan Type Restrictions**: Any plan type can be used (not limited to FD, RD, CD)
- **No Character Limits**: No restrictions on text field lengths
- **No Enum Restrictions**: Any value is accepted for all fields
- **Flexible EMI Structure**: Any EMI cost structure configuration is accepted

### Example - Minimal Plan Creation
```json
{
  "planName": "Test Plan"
}
```

### Example - Extreme Values (All Accepted)
```json
{
  "planName": "Extreme Plan",
  "planType": "ANY_TYPE",
  "interestRate": 999,
  "penaltyConfig": {
    "penaltyPercentage": 100
  },
  "emiCostStructure": {
    "fd": {
      "minimumInvestment": 1,
      "maximumInvestment": 2
    }
  }
}
```

## EMI Cost Structure

Each investment plan includes a detailed EMI cost structure that defines the investment parameters and cost calculations for different plan types.

### FD (Fixed Deposit) EMI Cost Structure
```json
{
  "fd": {
    "minimumInvestment": 10000,
    "maximumInvestment": 1000000,
    "investmentIncrements": 1000
  }
}
```

**Features:**
- One-time investment amount
- Flexible investment increments
- No monthly payments required
- Compound interest calculation

### RD (Recurring Deposit) EMI Cost Structure
```json
{
  "rd": {
    "minimumMonthlyInstallment": 1000,
    "maximumMonthlyInstallment": 50000,
    "installmentIncrements": 100,
    "gracePeriodDays": 5
  }
}
```

**Features:**
- Monthly installment payments
- Configurable installment amounts
- Grace period for payments
- EMI schedule tracking

### CD (Certificate of Deposit) EMI Cost Structure
```json
{
  "cd": {
    "minimumCertificateValue": 25000,
    "maximumCertificateValue": 2000000,
    "certificateIncrements": 1000,
    "certificateNumberPrefix": "CD"
  }
}
```

**Features:**
- Certificate-based investment
- Higher minimum investment
- Unique certificate numbers
- Document management

### EMI Cost Calculation Examples

#### FD Example
- **Investment Amount**: ₹50,000
- **Interest Rate**: 7.5% per annum
- **Tenure**: 24 months
- **Maturity Amount**: ₹57,810
- **Total Interest**: ₹7,810
- **Monthly Interest Earned**: ₹325.42

#### RD Example
- **Monthly Installment**: ₹5,000
- **Interest Rate**: 7.5% per annum
- **Tenure**: 24 months
- **Total Investment**: ₹120,000
- **Maturity Amount**: ₹130,200
- **Total Interest**: ₹10,200
- **Monthly Interest Earned**: ₹425

#### CD Example
- **Certificate Value**: ₹1,00,000
- **Interest Rate**: 8.0% per annum
- **Tenure**: 36 months
- **Maturity Amount**: ₹1,26,532
- **Total Interest**: ₹26,532
- **Monthly Interest Earned**: ₹737

## Admin APIs

### Investment Plan Management

#### POST /api/admin/investment/plans
Create a new investment plan.

**Request Body:**
```json
{
  "planName": "High Yield FD Plan",
  "planType": "FD",
  "description": "High interest fixed deposit plan for long-term investment",
  "minimumAmount": 10000,
  "maximumAmount": 1000000,
  "interestRate": 8.5,
  "tenureMonths": 24,
  "compoundingFrequency": "quarterly",
  "penaltyConfig": {
    "latePaymentPenalty": 100,
    "penaltyPercentage": 2,
    "gracePeriodDays": 5
  },
  "emiCostStructure": {
    "fd": {
      "minimumInvestment": 10000,
      "maximumInvestment": 1000000,
      "investmentIncrements": 1000
    }
  },
  "features": [
    {
      "feature": "High Interest Rate",
      "description": "Competitive interest rate of 8.5%"
    },
    {
      "feature": "Flexible Tenure",
      "description": "Choose from 12 to 24 months"
    }
  ],
  "termsAndConditions": [
    {
      "term": "Minimum investment period is 12 months"
    },
    {
      "term": "Early withdrawal may attract penalty"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment plan created successfully",
  "data": {
    "plan": {
      "_id": "plan_id",
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5,
      "tenureMonths": 24,
      "minimumAmount": 10000,
      "maximumAmount": 1000000,
      "isActive": true,
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
          "monthlyInterest": 75,
          "emiCost": {
            "oneTimeInvestment": 10000,
            "monthlyInterestEarned": 75,
            "totalReturn": 1800
          }
        }
      ],
      "createdAt": "2025-11-01T10:30:00.000Z"
    }
  }
}
```

#### GET /api/admin/investment/plans
Get all investment plans with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `planType` (optional): Filter by plan type (FD, RD, CD)
- `isActive` (optional): Filter by active status
- `search` (optional): Search in plan name or description

**Response:**
```json
{
  "success": true,
  "message": "Investment plans retrieved successfully",
  "data": {
    "plans": [
      {
        "_id": "plan_id",
        "planId": "PLAN2511001",
        "planName": "High Yield FD Plan",
        "planType": "FD",
        "interestRate": 8.5,
        "tenureMonths": 24,
        "minimumAmount": 10000,
        "maximumAmount": 1000000,
        "isActive": true,
        "statistics": {
          "totalInvestments": 25,
          "totalAmountInvested": 2500000,
          "activeInvestments": 20
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalPlans": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/admin/investment/plans/:planId
Get specific investment plan details.

#### PUT /api/admin/investment/plans/:planId
Update investment plan.

#### DELETE /api/admin/investment/plans/:planId
Delete investment plan (only if no active investments).

#### PATCH /api/admin/investment/plans/:planId/status
Toggle plan status (activate/deactivate).

**Request Body:**
```json
{
  "isActive": false
}
```

#### GET /api/admin/investment/plans/:planId/statistics
Get plan statistics and performance metrics.

**Response:**
```json
{
  "success": true,
  "message": "Plan statistics retrieved successfully",
  "data": {
    "plan": {
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5
    },
    "statistics": {
      "totalInvestments": 25,
      "activeInvestments": 20,
      "completedInvestments": 5,
      "totalAmountInvested": 2500000,
      "totalInterestEarned": 125000,
      "emiStatistics": {
        "totalEMIs": 240,
        "paidEMIs": 200,
        "pendingEMIs": 40,
        "overdueEMIs": 5
      }
    }
  }
}
```

#### POST /api/admin/investment/plans/:planId/calculate-emi
Calculate EMI cost for specific amount.

**Request Body:**
```json
{
  "amount": 50000,
  "planType": "FD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "EMI cost calculated successfully",
  "data": {
    "plan": {
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5,
      "tenureMonths": 24
    },
    "emiCost": {
      "planType": "FD",
      "principalAmount": 50000,
      "maturityAmount": 59000,
      "totalInterest": 9000,
      "monthlyInterest": 375,
      "emiCost": {
        "oneTimeInvestment": 50000,
        "monthlyInterestEarned": 375,
        "totalReturn": 9000
      },
      "costBreakdown": {
        "investment": 50000,
        "interest": 9000,
        "maturity": 59000
      }
    }
  }
}
```

#### GET /api/admin/investment/plans/:planId/sample-emi-costs
Get sample EMI costs for different investment amounts.

**Response:**
```json
{
  "success": true,
  "message": "Sample EMI costs retrieved successfully",
  "data": {
    "plan": {
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5,
      "tenureMonths": 24
    },
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
      },
      {
        "planType": "FD",
        "principalAmount": 505000,
        "maturityAmount": 595900,
        "totalInterest": 90900,
        "monthlyInterest": 3787.5
      },
      {
        "planType": "FD",
        "principalAmount": 1000000,
        "maturityAmount": 1180000,
        "totalInterest": 180000,
        "monthlyInterest": 7500
      }
    ]
  }
}
```

### Investment Management

#### POST /api/admin/investment/investments
Create investment for society member.

**Request Body:**
```json
{
  "planId": "plan_id",
  "memberId": "member_id",
  "principalAmount": 50000,
  "monthlyInstallment": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "investmentId": "INV2511001",
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "principalAmount": 50000,
      "expectedMaturityAmount": 59000,
      "investmentDate": "2025-11-01T10:30:00.000Z",
      "maturityDate": "2027-11-01T10:30:00.000Z",
      "status": "active"
    }
  }
}
```

#### GET /api/admin/investment/investments
Get all investments with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `planId`: Filter by plan
- `memberId`: Filter by member
- `status`: Filter by status (active, completed, cancelled, defaulted)
- `planType`: Filter by plan type

## Society Member APIs

### Investment Plan Discovery

#### GET /api/society-member/investment/plans
Get available investment plans.

**Query Parameters:**
- `planType` (optional): Filter by plan type
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
        "planName": "High Yield FD Plan",
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

#### GET /api/society-member/investment/plans/:planId
Get detailed plan information with sample calculations.

**Response:**
```json
{
  "success": true,
  "message": "Plan details retrieved successfully",
  "data": {
    "plan": {
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5,
      "tenureMonths": 24,
      "minimumAmount": 10000,
      "maximumAmount": 1000000,
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
          "monthlyInterest": 75,
          "emiCost": {
            "oneTimeInvestment": 10000,
            "monthlyInterestEarned": 75,
            "totalReturn": 1800
          },
          "costBreakdown": {
            "investment": 10000,
            "interest": 1800,
            "maturity": 11800
          }
        },
        {
          "planType": "FD",
          "principalAmount": 50000,
          "maturityAmount": 59000,
          "totalInterest": 9000,
          "monthlyInterest": 375,
          "emiCost": {
            "oneTimeInvestment": 50000,
            "monthlyInterestEarned": 375,
            "totalReturn": 9000
          },
          "costBreakdown": {
            "investment": 50000,
            "interest": 9000,
            "maturity": 59000
          }
        }
      ]
    }
  }
}
```

#### POST /api/society-member/investment/plans/:planId/calculate
Calculate returns for specific amount.

**Request Body:**
```json
{
  "principalAmount": 100000,
  "monthlyInstallment": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment returns calculated successfully",
  "data": {
    "plan": {
      "planName": "High Yield FD Plan",
      "planType": "FD",
      "interestRate": 8.5,
      "tenureMonths": 24
    },
    "emiCost": {
      "planType": "FD",
      "principalAmount": 100000,
      "maturityAmount": 118000,
      "totalInterest": 18000,
      "monthlyInterest": 750,
      "emiCost": {
        "oneTimeInvestment": 100000,
        "monthlyInterestEarned": 750,
        "totalReturn": 18000
      },
      "costBreakdown": {
        "investment": 100000,
        "interest": 18000,
        "maturity": 118000
      }
    },
    "calculation": {
      "annualizedReturn": "18.00%"
    }
  }
}
```

### Investment Tracking

#### GET /api/society-member/investment/investments
Get member's investments.

**Query Parameters:**
- `status` (optional): Filter by status
- `planType` (optional): Filter by plan type

**Response:**
```json
{
  "success": true,
  "message": "Member investments retrieved successfully",
  "data": {
    "investments": [
      {
        "investmentId": "INV2511001",
        "status": "active",
        "principalAmount": 100000,
        "expectedMaturityAmount": 118000,
        "totalInterestEarned": 5000,
        "totalPenaltyPaid": 0,
        "emiProgress": {
          "total": 24,
          "paid": 12,
          "pending": 12,
          "overdue": 0
        },
        "investmentDate": "2025-11-01T10:30:00.000Z",
        "maturityDate": "2027-11-01T10:30:00.000Z"
      }
    ]
  }
}
```

#### GET /api/society-member/investment/investments/:investmentId
Get detailed investment information.

#### GET /api/society-member/investment/investments/:investmentId/emi-schedule
Get EMI schedule for RD investments.

**Response:**
```json
{
  "success": true,
  "message": "EMI schedule retrieved successfully",
  "data": {
    "investmentId": "INV2511001",
    "planName": "Monthly RD Plan",
    "summary": {
      "totalEMIs": 24,
      "paidEMIs": 12,
      "pendingEMIs": 12,
      "overdueEMIs": 0
    },
    "emiSchedule": [
      {
        "emiNumber": 1,
        "dueDate": "2025-12-01T00:00:00.000Z",
        "amount": 5000,
        "status": "paid",
        "paidDate": "2025-11-30T10:30:00.000Z",
        "penaltyAmount": 0,
        "remarks": "Paid on time",
        "isOverdue": false
      },
      {
        "emiNumber": 2,
        "dueDate": "2026-01-01T00:00:00.000Z",
        "amount": 5000,
        "status": "pending",
        "paidDate": null,
        "penaltyAmount": 0,
        "remarks": null,
        "isOverdue": false
      }
    ]
  }
}
```

#### GET /api/society-member/investment/summary
Get investment summary dashboard.

**Response:**
```json
{
  "success": true,
  "message": "Investment summary retrieved successfully",
  "data": {
    "summary": {
      "totalInvestments": 3,
      "activeInvestments": 2,
      "completedInvestments": 1,
      "totalPrincipalAmount": 300000,
      "totalExpectedMaturity": 354000,
      "totalInterestEarned": 15000,
      "totalPenaltyPaid": 200,
      "netReturn": 14800
    },
    "planTypeBreakdown": {
      "FD": {
        "count": 2,
        "totalAmount": 200000
      },
      "RD": {
        "count": 1,
        "totalAmount": 100000
      }
    },
    "recentInvestments": [
      {
        "investmentId": "INV2511001",
        "planName": "High Yield FD Plan",
        "planType": "FD",
        "principalAmount": 100000,
        "status": "active",
        "investmentDate": "2025-11-01T10:30:00.000Z"
      }
    ],
    "upcomingEMIs": [
      {
        "investmentId": "INV2511002",
        "planName": "Monthly RD Plan",
        "emiNumber": 13,
        "dueDate": "2026-01-01T00:00:00.000Z",
        "amount": 5000,
        "isOverdue": false
      }
    ]
  }
}
```

## EMI Tracking & Penalty System

### EMI Status Types
- **pending**: EMI not yet paid
- **paid**: EMI paid on time
- **overdue**: EMI past due date
- **penalty_applied**: Penalty applied for late payment

### Penalty Configuration
```json
{
  "penaltyConfig": {
    "latePaymentPenalty": 100,
    "penaltyPercentage": 2,
    "gracePeriodDays": 5
  }
}
```

### Penalty Calculation
- **Fixed Penalty**: ₹100 for each late payment
- **Percentage Penalty**: 2% of EMI amount
- **Grace Period**: 5 days after due date before penalty applies

### EMI Tracking Features
- **Due Date Management**: Automatic due date calculation
- **Status Updates**: Real-time status tracking
- **Penalty Application**: Automatic penalty calculation
- **Payment Recording**: Complete payment history
- **Overdue Alerts**: Identification of overdue EMIs

## Investment Calculations

### FD/CD Calculation
```javascript
// Compound Interest Formula
const rate = interestRate / 100;
const time = tenureMonths / 12;
const compoundFrequency = getFrequency(compoundingFrequency);

const maturityAmount = principal * Math.pow((1 + rate / compoundFrequency), compoundFrequency * time);
```

### RD Calculation
```javascript
// RD Formula
const rate = interestRate / 100;
const months = tenureMonths;

const maturityAmount = monthlyInstallment * 
  ((Math.pow(1 + rate/12, months) - 1) / (rate/12)) * 
  (1 + rate/12);
```

### Compounding Frequencies
- **Monthly**: 12 times per year
- **Quarterly**: 4 times per year
- **Half-yearly**: 2 times per year
- **Yearly**: 1 time per year

## Examples

### Creating a Minimal Plan (No Validation)
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Test Plan"
  }'
```

### Creating an FD Plan with Extreme Values
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Extreme FD Plan",
    "planType": "FD",
    "description": "Extreme values test plan",
    "minimumAmount": 1,
    "maximumAmount": 999999999,
    "interestRate": 999,
    "tenureMonths": 1,
    "compoundingFrequency": "any_frequency",
    "penaltyConfig": {
      "latePaymentPenalty": 999999,
      "penaltyPercentage": 100,
      "gracePeriodDays": 999
    },
    "emiCostStructure": {
      "fd": {
        "minimumInvestment": 1,
        "maximumInvestment": 999999999,
        "investmentIncrements": 1
      }
    }
  }'
```

### Creating a Standard FD Plan
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Premium FD Plan",
    "planType": "FD",
    "description": "Premium fixed deposit with high returns",
    "minimumAmount": 25000,
    "maximumAmount": 5000000,
    "interestRate": 9.0,
    "tenureMonths": 36,
    "compoundingFrequency": "quarterly",
    "emiCostStructure": {
      "fd": {
        "minimumInvestment": 25000,
        "maximumInvestment": 5000000,
        "investmentIncrements": 1000
      }
    }
  }'
```

### Creating an RD Plan
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Monthly RD Plan",
    "planType": "RD",
    "description": "Monthly recurring deposit plan",
    "minimumAmount": 1000,
    "maximumAmount": 50000,
    "interestRate": 7.5,
    "tenureMonths": 24,
    "monthlyInstallment": 5000,
    "penaltyConfig": {
      "latePaymentPenalty": 50,
      "penaltyPercentage": 1,
      "gracePeriodDays": 3
    },
    "emiCostStructure": {
      "rd": {
        "minimumMonthlyInstallment": 1000,
        "maximumMonthlyInstallment": 50000,
        "installmentIncrements": 100,
        "gracePeriodDays": 3
      }
    }
  }'
```

### Creating Investment for Member
```bash
curl -X POST http://localhost:3100/api/admin/investment/investments \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_id",
    "memberId": "member_id",
    "principalAmount": 100000
  }'
```

### Member Viewing Available Plans
```bash
curl -X GET "http://localhost:3100/api/society-member/investment/plans?planType=FD&minAmount=10000" \
  -H "Authorization: Bearer <member_token>"
```

### Calculating Returns
```bash
curl -X POST http://localhost:3100/api/society-member/investment/plans/plan_id/calculate \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "principalAmount": 100000,
    "monthlyInstallment": 10000
  }'
```

### Calculating EMI Cost (Admin)
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans/plan_id/calculate-emi \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "planType": "FD"
  }'
```

### Getting Sample EMI Costs
```bash
curl -X GET http://localhost:3100/api/admin/investment/plans/plan_id/sample-emi-costs \
  -H "Authorization: Bearer <admin_token>"
```

### Getting Available Plans with EMI Costs
```bash
curl -X GET "http://localhost:3100/api/society-member/investment/plans?planType=FD&minAmount=10000" \
  -H "Authorization: Bearer <member_token>"
```

## Key Features Summary

### No Validation System
- **Complete Flexibility**: No validation constraints - accept any data
- **Optional Fields**: All fields are optional - create plans with minimal data
- **No Limits**: No minimum/maximum limits on any values
- **Any Plan Type**: Not restricted to FD, RD, CD - any type accepted
- **Extreme Values**: Accept any interest rate, penalty percentage, or amount

### Enhanced EMI Cost Structure
- **FD Plans**: One-time investment with detailed cost breakdown
- **RD Plans**: Monthly installment tracking with EMI schedule
- **CD Plans**: Certificate-based investment with unique numbering

### Cost Calculation Features
- **Real-time Calculations**: Instant EMI cost calculations for any amount
- **Sample Costs**: Pre-calculated examples for different investment levels
- **Detailed Breakdowns**: Investment, interest, and maturity amount breakdowns
- **Monthly Returns**: Monthly interest earned calculations

### Admin Management Features
- **Plan Creation**: Create plans with any data - no validation required
- **Cost Analysis**: Calculate EMI costs for specific amounts
- **Sample Generation**: Generate sample EMI costs for different amounts
- **Statistics**: Track plan performance and investment metrics

### Member Self-Service Features
- **Plan Discovery**: View available plans with EMI cost information
- **Return Calculations**: Calculate returns for specific investment amounts
- **Investment Tracking**: Monitor investment progress and EMI schedules
- **Cost Analysis**: Detailed cost breakdowns for informed decision making

### Error Handling
- **No Validation Errors**: System will not reject requests due to validation
- **Simple Error Messages**: Only technical errors are returned
- **Flexible Input**: Accept any JSON structure and data types