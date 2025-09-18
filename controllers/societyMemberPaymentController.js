const Payment = require('../models/payment.model');
const EMIRecord = require('../models/emiRecord.model');
const Investment = require('../models/investment.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const SocietyMember = require('../models/societyMember.model');
const { uploadToS3, deleteFromS3 } = require('../config/aws');
const { createOrder, verifyPaymentSignature: verifyRazorpaySignature, capturePayment, getPaymentDetails: getRazorpayPaymentDetails, refundPayment } = require('../config/razorpay');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Generate payment order for online payments
const generatePaymentOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { investmentId, emiNumber, amount, paymentMethod } = req.body;
    const memberId = req.user.id;

    // Verify investment belongs to member
    const investment = await Investment.findOne({
      _id: investmentId,
      memberId: memberId
    }).populate('planId');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found or access denied'
      });
    }

    // Verify EMI if specified
    if (emiNumber) {
      const emiRecord = await EMIRecord.findOne({
        investmentId: investmentId,
        emiNumber: emiNumber,
        status: 'pending'
      });

      if (!emiRecord) {
        return res.status(404).json({
          success: false,
          message: 'EMI not found or already paid'
        });
      }

      if (amount !== emiRecord.emiAmount) {
        return res.status(400).json({
          success: false,
          message: `EMI amount should be ₹${emiRecord.emiAmount}`
        });
      }
    }

    // Create payment record
    const payment = new Payment({
      investmentId: investmentId,
      memberId: memberId,
      planId: investment.planId._id,
      paymentType: 'online',
      paymentMethod: paymentMethod,
      amount: amount,
      emiNumber: emiNumber,
      paymentFor: emiNumber ? 'emi' : 'principal',
      status: 'pending',
      dueDate: emiNumber ? (await EMIRecord.findOne({ investmentId, emiNumber })).dueDate : null
    });

    await payment.save();

    // Generate transaction ID (in real implementation, this would come from payment gateway)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    payment.transactionId = transactionId;
    await payment.save();

    // Create Razorpay order
    const orderResult = await createOrder(
      amount,
      'INR',
      payment.paymentId,
      {
        investmentId: investment.investmentId,
        memberId: req.user.memberId,
        emiNumber: emiNumber || 'N/A',
        paymentFor: emiNumber ? 'EMI Payment' : 'Principal Payment'
      }
    );

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }

    const paymentOrder = orderResult.order;

    res.status(200).json({
      success: true,
      message: 'Payment order generated successfully',
      data: {
        paymentId: payment.paymentId,
        transactionId: transactionId,
        amount: amount,
        paymentOrder: paymentOrder,
        investmentDetails: {
          investmentId: investment.investmentId,
          planName: investment.planId.planName,
          planType: investment.planId.planType
        }
      }
    });

  } catch (error) {
    console.error('Error generating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Process online payment callback
const processPaymentCallback = async (req, res) => {
  try {
    const { paymentId, transactionId, gatewayResponse } = req.body;

    const payment = await Payment.findOne({
      paymentId: paymentId,
      transactionId: transactionId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment with gateway response
    payment.gatewayResponse = {
      gatewayName: gatewayResponse.gatewayName || 'razorpay',
      gatewayTransactionId: gatewayResponse.gatewayTransactionId,
      gatewayOrderId: gatewayResponse.gatewayOrderId,
      gatewayPaymentId: gatewayResponse.gatewayPaymentId,
      gatewaySignature: gatewayResponse.gatewaySignature,
      gatewayStatus: gatewayResponse.gatewayStatus,
      gatewayResponse: gatewayResponse
    };

    // Verify payment signature
    const isSignatureValid = verifyRazorpaySignature(
      gatewayResponse.razorpay_order_id,
      gatewayResponse.razorpay_payment_id,
      gatewayResponse.razorpay_signature
    );
    
    if (isSignatureValid && gatewayResponse.gatewayStatus === 'captured') {
      payment.status = 'completed';
      payment.processedDate = new Date();
      
      // Update EMI record if applicable
      if (payment.emiNumber) {
        await updateEMIRecord(payment);
      }
      
      // Update investment payment history
      await updateInvestmentPaymentHistory(payment);
      
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          paymentId: payment.paymentId,
          status: payment.status,
          amount: payment.amount
        }
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: {
          paymentId: payment.paymentId,
          status: payment.status
        }
      });
    }

  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Upload payment screenshot
const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { screenshotType, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot file is required'
      });
    }

    const payment = await Payment.findOne({
      paymentId: paymentId,
      memberId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    // Upload to S3
    const uploadResult = await uploadToS3(req.file, 'payment-screenshots');

    // Add screenshot to payment record
    payment.addPaymentScreenshot({
      screenshotType: screenshotType,
      fileUrl: uploadResult.Location,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      description: description
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment screenshot uploaded successfully',
      data: {
        paymentId: payment.paymentId,
        screenshotUrl: uploadResult.Location,
        screenshotType: screenshotType
      }
    });

  } catch (error) {
    console.error('Error uploading payment screenshot:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member's payment history
const getPaymentHistory = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { 
      status, 
      paymentType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const options = {
      status,
      paymentType,
      startDate,
      endDate
    };

    const payments = await Payment.getPaymentsByMember(new mongoose.Types.ObjectId(memberId), options)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });

    const totalPayments = await Payment.countDocuments({ memberId: new mongoose.Types.ObjectId(memberId) });

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments: payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / limit),
          totalPayments: totalPayments,
          hasNext: page < Math.ceil(totalPayments / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member's EMI details
const getEMIDetails = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { investmentId } = req.params;

    // Verify investment belongs to member
    const investment = await Investment.findOne({
      _id: investmentId,
      memberId: memberId
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found or access denied'
      });
    }

    const emiRecords = await EMIRecord.getEMIsByInvestment(investmentId);
    const overdueEMIs = emiRecords.filter(emi => emi.isOverdue());
    const pendingEMIs = emiRecords.filter(emi => emi.status === 'pending');
    const paidEMIs = emiRecords.filter(emi => emi.status === 'paid');

    // Calculate summary
    const totalEMIs = emiRecords.length;
    const totalEMIAmount = emiRecords.reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPaidAmount = emiRecords.reduce((sum, emi) => sum + emi.totalPaidAmount, 0);
    const totalPendingAmount = emiRecords.reduce((sum, emi) => 
      sum + (emi.status === 'pending' ? emi.emiAmount : 0), 0);
    const totalPenaltyAmount = emiRecords.reduce((sum, emi) => sum + emi.penaltyAmount, 0);

    res.status(200).json({
      success: true,
      message: 'EMI details retrieved successfully',
      data: {
        investmentDetails: {
          investmentId: investment.investmentId,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount
        },
        emiSummary: {
          totalEMIs: totalEMIs,
          totalEMIAmount: totalEMIAmount,
          totalPaidAmount: totalPaidAmount,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          paidEMIs: paidEMIs.length,
          pendingEMIs: pendingEMIs.length,
          overdueEMIs: overdueEMIs.length
        },
        emiRecords: emiRecords.map(emi => emi.getEMISummary()),
        overdueEMIs: overdueEMIs.map(emi => emi.getEMISummary()),
        nextDueEMI: pendingEMIs.length > 0 ? pendingEMIs[0].getEMISummary() : null
      }
    });

  } catch (error) {
    console.error('Error getting EMI details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member's investment payment summary
const getInvestmentPaymentSummary = async (req, res) => {
  try {
    const memberId = req.user.id;

    // Get all investments for the member
    const investments = await Investment.find({ memberId })
      .populate('planId', 'planName planType interestRate tenureMonths');

    const investmentSummaries = [];

    for (const investment of investments) {
      const emiRecords = await EMIRecord.getEMIsByInvestment(investment._id);
      const payments = await Payment.getPaymentsByInvestment(investment._id);
      
      const totalEMIs = emiRecords.length;
      const paidEMIs = emiRecords.filter(emi => emi.status === 'paid').length;
      const pendingEMIs = emiRecords.filter(emi => emi.status === 'pending').length;
      const overdueEMIs = emiRecords.filter(emi => emi.isOverdue()).length;
      
      const totalPaidAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPendingAmount = emiRecords
        .filter(emi => emi.status === 'pending')
        .reduce((sum, emi) => sum + emi.emiAmount, 0);

      investmentSummaries.push({
        investmentId: investment.investmentId,
        planName: investment.planId.planName,
        planType: investment.planId.planType,
        principalAmount: investment.principalAmount,
        expectedMaturityAmount: investment.expectedMaturityAmount,
        emiProgress: {
          total: totalEMIs,
          paid: paidEMIs,
          pending: pendingEMIs,
          overdue: overdueEMIs
        },
        paymentSummary: {
          totalPaid: totalPaidAmount,
          totalPending: totalPendingAmount,
          completionPercentage: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
        },
        nextDueDate: emiRecords
          .filter(emi => emi.status === 'pending')
          .sort((a, b) => a.dueDate - b.dueDate)[0]?.dueDate || null,
        status: investment.status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investment payment summary retrieved successfully',
      data: {
        totalInvestments: investments.length,
        investments: investmentSummaries
      }
    });

  } catch (error) {
    console.error('Error getting investment payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const memberId = req.user.id;

    const payment = await Payment.findOne({
      paymentId: paymentId,
      memberId: new mongoose.Types.ObjectId(memberId)
    })
    .populate('investmentId', 'investmentId principalAmount')
    .populate('planId', 'planName planType interestRate')
    .populate('verifiedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: {
        payment: payment,
        summary: payment.getPaymentSummary()
      }
    });

  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to verify payment signature
const verifyPaymentSignature = (gatewayResponse) => {
  // Implement payment gateway signature verification
  // This is a placeholder - implement based on your payment gateway
  return true;
};

// Helper function to update EMI record
const updateEMIRecord = async (payment) => {
  if (payment.emiNumber) {
    const emiRecord = await EMIRecord.findOne({
      investmentId: payment.investmentId,
      emiNumber: payment.emiNumber
    });

    if (emiRecord) {
      emiRecord.markAsPaid(payment.amount, payment._id, payment.processedDate);
      await emiRecord.save();
    }
  }
};

// Helper function to update investment payment history
const updateInvestmentPaymentHistory = async (payment) => {
  const investment = await Investment.findById(payment.investmentId);
  if (investment) {
    investment.recordPayment(
      payment.amount,
      payment.paymentFor,
      payment.emiNumber,
      payment.transactionId,
      `Online payment via ${payment.paymentMethod}`
    );
    await investment.save();
  }
};

// Create cash payment request
const createCashPaymentRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { investmentId, emiNumber, amount, remarks } = req.body;
    const memberId = req.user.id;

    // Verify investment belongs to member
    const investment = await Investment.findOne({
      _id: investmentId,
      memberId: memberId
    }).populate('planId');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found or access denied'
      });
    }

    // Verify EMI if specified
    if (emiNumber) {
      const emiRecord = await EMIRecord.findOne({
        investmentId: investmentId,
        emiNumber: emiNumber,
        status: 'pending'
      });

      if (!emiRecord) {
        return res.status(404).json({
          success: false,
          message: 'EMI not found or already paid'
        });
      }

      if (amount !== emiRecord.emiAmount) {
        return res.status(400).json({
          success: false,
          message: `EMI amount should be ₹${emiRecord.emiAmount}`
        });
      }
    }

    // Create cash payment record
    const payment = new Payment({
      investmentId: investmentId,
      memberId: memberId,
      planId: investment.planId._id,
      paymentType: 'cash',
      paymentMethod: 'cash',
      amount: amount,
      emiNumber: emiNumber,
      paymentFor: emiNumber ? 'emi' : 'principal',
      status: 'pending',
      verificationStatus: 'pending',
      dueDate: emiNumber ? (await EMIRecord.findOne({ investmentId, emiNumber })).dueDate : null,
      remarks: remarks
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Cash payment request created successfully',
      data: {
        paymentId: payment.paymentId,
        amount: amount,
        paymentType: 'cash',
        status: 'pending',
        verificationStatus: 'pending',
        investmentDetails: {
          investmentId: investment.investmentId,
          planName: investment.planId.planName,
          planType: investment.planId.planType
        },
        nextSteps: 'Please visit the office with cash payment and show this payment ID to complete the transaction.'
      }
    });

  } catch (error) {
    console.error('Error creating cash payment request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get pending EMIs for member
const getPendingEMIs = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { 
      month, 
      year, 
      investmentId, 
      page = 1, 
      limit = 10 
    } = req.query;

    const options = {};
    if (month && year) {
      options.month = parseInt(month);
      options.year = parseInt(year);
    }
    if (investmentId) options.investmentId = investmentId;

    const pendingEMIs = await EMIRecord.getPendingEMIsByMonth(options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPendingEMIs = await EMIRecord.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending'
    });

    const totalPendingAmount = pendingEMIs.reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPenaltyAmount = pendingEMIs.reduce((sum, emi) => sum + emi.penaltyAmount, 0);

    res.status(200).json({
      success: true,
      message: 'Pending EMIs retrieved successfully',
      data: {
        pendingEMIs: pendingEMIs.map(emi => ({
          ...emi.getEMISummary(),
          memberDetails: {
            name: `${emi.memberId.firstName} ${emi.memberId.lastName}`,
            memberId: emi.memberId.memberId,
            email: emi.memberId.email,
            phoneNumber: emi.memberId.phoneNumber
          },
          investmentDetails: {
            investmentId: emi.investmentId.investmentId,
            planName: emi.planId.planName,
            planType: emi.planId.planType
          }
        })),
        summary: {
          totalPendingEMIs: totalPendingEMIs,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          overdueEMIs: pendingEMIs.filter(emi => emi.isOverdue()).length
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPendingEMIs / limit),
          totalPendingEMIs: totalPendingEMIs,
          hasNext: page < Math.ceil(totalPendingEMIs / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending EMIs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get pending EMIs grouped by month
const getPendingEMIsByMonth = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { investmentId } = req.query;

    const options = {};
    if (investmentId) options.investmentId = investmentId;

    const pendingEMIsByMonth = await EMIRecord.getPendingEMIsGroupedByMonth(options);

    // Calculate overall summary
    const totalPendingEMIs = pendingEMIsByMonth.reduce((sum, month) => sum + month.count, 0);
    const totalPendingAmount = pendingEMIsByMonth.reduce((sum, month) => sum + month.totalAmount, 0);
    const totalPenaltyAmount = pendingEMIsByMonth.reduce((sum, month) => sum + month.totalPenalty, 0);

    res.status(200).json({
      success: true,
      message: 'Pending EMIs grouped by month retrieved successfully',
      data: {
        pendingEMIsByMonth: pendingEMIsByMonth.map(month => ({
          month: month._id.month,
          year: month._id.year,
          monthName: new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'long' }),
          emiCount: month.count,
          totalAmount: month.totalAmount,
          totalPenalty: month.totalPenalty,
          emis: month.emis.map(emi => ({
            ...emi.getEMISummary(),
            memberDetails: {
              name: `${emi.memberId.firstName} ${emi.memberId.lastName}`,
              memberId: emi.memberId.memberId,
              email: emi.memberId.email,
              phoneNumber: emi.memberId.phoneNumber
            },
            investmentDetails: {
              investmentId: emi.investmentId.investmentId,
              planName: emi.planId.planName,
              planType: emi.planId.planType
            }
          }))
        })),
        overallSummary: {
          totalPendingEMIs: totalPendingEMIs,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          monthsWithPendingEMIs: pendingEMIsByMonth.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending EMIs by month:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get payment options for EMI
const getPaymentOptions = async (req, res) => {
  try {
    const { emiId } = req.params;
    const memberId = req.user.id;

    const emiRecord = await EMIRecord.findById(emiId)
      .populate('investmentId')
      .populate('planId')
      .populate('memberId');

    if (!emiRecord) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    if (emiRecord.memberId._id.toString() !== memberId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (emiRecord.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'EMI is already paid'
      });
    }

    const totalAmount = emiRecord.emiAmount + emiRecord.penaltyAmount;

    res.status(200).json({
      success: true,
      message: 'Payment options retrieved successfully',
      data: {
        emiDetails: emiRecord.getEMISummary(),
        paymentOptions: {
          cash: {
            available: true,
            amount: totalAmount,
            description: 'Pay in cash at the office',
            instructions: 'Visit the office with exact amount and show EMI ID'
          },
          online: {
            available: true,
            amount: totalAmount,
            description: 'Pay online using Razorpay',
            supportedMethods: ['upi', 'net_banking', 'credit_card', 'debit_card', 'wallet'],
            instructions: 'Complete payment online and get instant confirmation'
          }
        },
        memberDetails: {
          name: `${emiRecord.memberId.firstName} ${emiRecord.memberId.lastName}`,
          memberId: emiRecord.memberId.memberId,
          email: emiRecord.memberId.email
        },
        investmentDetails: {
          investmentId: emiRecord.investmentId.investmentId,
          planName: emiRecord.planId.planName,
          planType: emiRecord.planId.planType
        }
      }
    });

  } catch (error) {
    console.error('Error getting payment options:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  generatePaymentOrder,
  processPaymentCallback,
  uploadPaymentScreenshot,
  getPaymentHistory,
  getEMIDetails,
  getInvestmentPaymentSummary,
  getPaymentDetails,
  createCashPaymentRequest,
  getPendingEMIs,
  getPendingEMIsByMonth,
  getPaymentOptions
};
