# Investment Management System - Enhanced with EMI Cost Structure

## Overview

The Investment Management System provides comprehensive functionality for managing FD (Fixed Deposit), RD (Recurring Deposit), and CD (Certificate of Deposit) investment plans for society members. The system includes detailed EMI cost calculations, penalty management, and investment tracking.

## Features

### Investment Plan Types

1. **FD (Fixed Deposit)**
   - One-time investment
   - Fixed interest rate
   - Compound interest calculation
   - Flexible investment amounts

2. **RD (Recurring Deposit)**
   - Monthly installment payments
   - EMI schedule management
   - Grace period for payments
   - Penalty tracking for missed payments

3. **CD (Certificate of Deposit)**
   - Certificate-based investment
   - Unique certificate numbers
   - Fixed maturity terms
   - Higher interest rates

### EMI Cost Structure

Each investment plan includes detailed EMI cost structure:

#### FD EMI Cost Structure
```json
{
  "fd": {
    "minimumInvestment": 10000,
    "maximumInvestment": 1000000,
    "investmentIncrements": 1000
  }
}
```

#### RD EMI Cost Structure
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

#### CD EMI Cost Structure
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

## API Endpoints

### Admin Investment Management

#### 1. Create Investment Plan
**POST** `/api/admin/investment/plans`

**Request Body:**
```json
{
  "planName": "Premium FD Plan",
  "planType": "FD",
  "description": "High-yield fixed deposit plan",
  "minimumAmount": 10000,
  "maximumAmount": 1000000,
  "interestRate": 7.5,
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
      "description": "7.5% annual interest rate"
    }
  ],
  "termsAndConditions": [
    {
      "term": "Minimum investment period is 12 months"
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
      "planName": "Premium FD Plan",
      "planType": "FD",
      "interestRate": 7.5,
      "tenureMonths": 24,
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
          "maturityAmount": 11562,
          "totalInterest": 1562,
          "monthlyInterest": 65.08,
          "emiCost": {
            "oneTimeInvestment": 10000,
            "monthlyInterestEarned": 65.08,
            "totalReturn": 1562
          }
        }
      ]
    }
  }
}
```

#### 2. Calculate EMI Cost for Specific Amount
**POST** `/api/admin/investment/plans/:planId/calculate-emi`

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
      "planName": "Premium FD Plan",
      "planType": "FD",
      "interestRate": 7.5,
      "tenureMonths": 24
    },
    "emiCost": {
      "planType": "FD",
      "principalAmount": 50000,
      "maturityAmount": 57810,
      "totalInterest": 7810,
      "monthlyInterest": 325.42,
      "emiCost": {
        "oneTimeInvestment": 50000,
        "monthlyInterestEarned": 325.42,
        "totalReturn": 7810
      },
      "costBreakdown": {
        "investment": 50000,
        "interest": 7810,
        "maturity": 57810
      }
    }
  }
}
```

#### 3. Get Sample EMI Costs
**GET** `/api/admin/investment/plans/:planId/sample-emi-costs`

**Response:**
```json
{
  "success": true,
  "message": "Sample EMI costs retrieved successfully",
  "data": {
    "plan": {
      "planName": "Premium FD Plan",
      "planType": "FD",
      "interestRate": 7.5,
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
        "maturityAmount": 11562,
        "totalInterest": 1562,
        "monthlyInterest": 65.08
      },
      {
        "planType": "FD",
        "principalAmount": 505000,
        "maturityAmount": 583891,
        "totalInterest": 78891,
        "monthlyInterest": 3287.13
      },
      {
        "planType": "FD",
        "principalAmount": 1000000,
        "maturityAmount": 1156200,
        "totalInterest": 156200,
        "monthlyInterest": 6508.33
      }
    ]
  }
}
```

### Society Member Investment APIs

#### 1. Get Available Plans with EMI Costs
**GET** `/api/society-member/investment/plans`

**Response:**
```json
{
  "success": true,
  "message": "Available investment plans retrieved successfully",
  "data": {
    "plans": [
      {
        "_id": "plan_id",
        "planName": "Premium FD Plan",
        "planType": "FD",
        "interestRate": 7.5,
        "tenureMonths": 24,
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
            "maturityAmount": 11562,
            "totalInterest": 1562,
            "monthlyInterest": 65.08
          }
        ]
      }
    ]
  }
}
```

#### 2. Get Plan Details with EMI Cost Structure
**GET** `/api/society-member/investment/plans/:planId`

**Response:**
```json
{
  "success": true,
  "message": "Plan details retrieved successfully",
  "data": {
    "plan": {
      "_id": "plan_id",
      "planName": "Premium FD Plan",
      "planType": "FD",
      "description": "High-yield fixed deposit plan",
      "interestRate": 7.5,
      "tenureMonths": 24,
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
          "maturityAmount": 11562,
          "totalInterest": 1562,
          "monthlyInterest": 65.08,
          "emiCost": {
            "oneTimeInvestment": 10000,
            "monthlyInterestEarned": 65.08,
            "totalReturn": 1562
          },
          "costBreakdown": {
            "investment": 10000,
            "interest": 1562,
            "maturity": 11562
          }
        }
      ]
    }
  }
}
```

#### 3. Calculate Investment Returns
**POST** `/api/society-member/investment/plans/:planId/calculate`

**Request Body:**
```json
{
  "principalAmount": 50000,
  "monthlyInstallment": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment returns calculated successfully",
  "data": {
    "plan": {
      "planName": "Premium FD Plan",
      "planType": "FD",
      "interestRate": 7.5,
      "tenureMonths": 24
    },
    "emiCost": {
      "planType": "FD",
      "principalAmount": 50000,
      "maturityAmount": 57810,
      "totalInterest": 7810,
      "monthlyInterest": 325.42,
      "emiCost": {
        "oneTimeInvestment": 50000,
        "monthlyInterestEarned": 325.42,
        "totalReturn": 7810
      },
      "costBreakdown": {
        "investment": 50000,
        "interest": 7810,
        "maturity": 57810
      }
    },
    "calculation": {
      "annualizedReturn": "7.50%"
    }
  }
}
```

## EMI Cost Calculation Examples

### FD (Fixed Deposit) Example
- **Principal Amount:** ₹50,000
- **Interest Rate:** 7.5% per annum
- **Tenure:** 24 months
- **Compounding:** Quarterly

**Calculation:**
- Maturity Amount: ₹57,810
- Total Interest: ₹7,810
- Monthly Interest Earned: ₹325.42

### RD (Recurring Deposit) Example
- **Monthly Installment:** ₹5,000
- **Interest Rate:** 7.5% per annum
- **Tenure:** 24 months

**Calculation:**
- Total Investment: ₹120,000 (₹5,000 × 24)
- Maturity Amount: ₹130,200
- Total Interest: ₹10,200
- Monthly Interest Earned: ₹425

### CD (Certificate of Deposit) Example
- **Certificate Value:** ₹1,00,000
- **Interest Rate:** 8.0% per annum
- **Tenure:** 36 months
- **Compounding:** Quarterly

**Calculation:**
- Maturity Amount: ₹1,26,532
- Total Interest: ₹26,532
- Monthly Interest Earned: ₹737

## Penalty System

### Late Payment Penalties
- **Grace Period:** 5 days (configurable)
- **Penalty Amount:** ₹100 per late payment
- **Penalty Percentage:** 2% of installment amount
- **Maximum Penalty:** ₹1,000 per EMI

### Penalty Calculation Example
For a missed EMI of ₹5,000:
- Base Penalty: ₹100
- Percentage Penalty: ₹100 (2% of ₹5,000)
- Total Penalty: ₹200

## Investment Tracking

### EMI Schedule for RD Plans
```json
{
  "emiSchedule": [
    {
      "emiNumber": 1,
      "dueDate": "2024-02-01",
      "amount": 5000,
      "status": "paid",
      "paidDate": "2024-02-01",
      "penaltyAmount": 0
    },
    {
      "emiNumber": 2,
      "dueDate": "2024-03-01",
      "amount": 5000,
      "status": "overdue",
      "penaltyAmount": 200
    }
  ]
}
```

### Investment Summary
```json
{
  "summary": {
    "totalInvestments": 3,
    "activeInvestments": 2,
    "completedInvestments": 1,
    "totalPrincipalAmount": 200000,
    "totalExpectedMaturity": 220000,
    "totalInterestEarned": 15000,
    "totalPenaltyPaid": 500,
    "netReturn": 14500
  }
}
```

## Error Handling

### Common Error Responses

**Plan Not Found:**
```json
{
  "success": false,
  "message": "Investment plan not found"
}
```

**Invalid Amount:**
```json
{
  "success": false,
  "message": "Principal amount must be between ₹10000 and ₹1000000"
}
```

**Plan Not Active:**
```json
{
  "success": false,
  "message": "Investment plan is not available for new investments"
}
```

## Security Features

1. **Authentication Required:** All endpoints require valid JWT token
2. **Admin Authorization:** Plan creation and management requires admin role
3. **Input Validation:** All inputs are validated and sanitized
4. **Rate Limiting:** API endpoints have rate limiting protection
5. **Data Encryption:** Sensitive data is encrypted in transit and at rest

## Usage Examples

### Creating an FD Plan
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Premium FD Plan",
    "planType": "FD",
    "description": "High-yield fixed deposit plan",
    "minimumAmount": 10000,
    "maximumAmount": 1000000,
    "interestRate": 7.5,
    "tenureMonths": 24,
    "compoundingFrequency": "quarterly",
    "emiCostStructure": {
      "fd": {
        "minimumInvestment": 10000,
        "maximumInvestment": 1000000,
        "investmentIncrements": 1000
      }
    }
  }'
```

### Calculating EMI Cost
```bash
curl -X POST http://localhost:3100/api/admin/investment/plans/PLAN_ID/calculate-emi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "planType": "FD"
  }'
```

### Getting Available Plans
```bash
curl -X GET http://localhost:3100/api/society-member/investment/plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

1. **Plan Creation:** Always include EMI cost structure when creating plans
2. **Amount Validation:** Validate investment amounts against plan limits
3. **Penalty Management:** Set reasonable penalty amounts and grace periods
4. **Interest Calculation:** Use appropriate compounding frequencies
5. **Documentation:** Maintain clear terms and conditions for each plan
6. **Monitoring:** Track investment performance and member satisfaction
7. **Security:** Regularly audit access controls and data protection measures

## Future Enhancements

1. **Auto-renewal:** Automatic renewal of matured investments
2. **Partial Withdrawal:** Allow partial withdrawals with penalties
3. **Interest Rate Changes:** Dynamic interest rate adjustments
4. **Tax Calculations:** Automatic TDS and tax calculations
5. **Mobile App:** Dedicated mobile application for members
6. **Notifications:** SMS and email notifications for EMI due dates
7. **Analytics:** Advanced analytics and reporting features
