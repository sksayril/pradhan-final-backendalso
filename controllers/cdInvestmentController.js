const CDInvestment = require('../models/cdInvestment.model');
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');

// User CD Investment Functions

// Get CD investment options and user's investment capacity
const getCDInvestmentInfo = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    
    // CD investment options (fixed rates and tenures)
    const cdOptions = {
      tenures: [
        { months: 6, interestRate: 6.5, label: '6 Months' },
        { months: 12, interestRate: 7.5, label: '12 Months' },
        { months: 18, interestRate: 8.0, label: '18 Months' },
        { months: 24, interestRate: 8.5, label: '24 Months' },
        { months: 36, interestRate: 9.0, label: '36 Months' },
        { months: 48, interestRate: 9.5, label: '48 Months' },
        { months: 60, interestRate: 10.0, label: '60 Months' }
      ],
      minAmount: 1000,
      maxAmount: 1000000,
      features: [
        'Fixed interest rate',
        'Guaranteed returns',
        'Flexible tenure options',
        'Auto-renewal available',
        'Early withdrawal with penalty'
      ]
    };
    
    // Get user's existing CD investments
    const existingInvestments = await CDInvestment.find({
      userId: user._id,
      userType: userType === 'student' ? 'Student' : 'SocietyMember',
      status: { $in: ['approved', 'active'] }
    }).select('investmentAmount cdId status maturityDate');
    
    // Calculate total invested amount
    const totalInvested = existingInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    
    // Calculate remaining investment capacity
    const maxTotalInvestment = 500000; // Maximum total CD investment per user
    const remainingCapacity = Math.max(0, maxTotalInvestment - totalInvested);
    
    res.json({
      success: true,
      data: {
        cdOptions,
        userInfo: {
          userId: user._id,
          userType,
          userIdentifier: userType === 'student' ? user.studentId : user.memberId,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        },
        investmentCapacity: {
          totalInvested,
          remainingCapacity,
          maxTotalInvestment,
          canInvest: remainingCapacity > 0
        },
        existingInvestments: existingInvestments.map(inv => ({
          cdId: inv.cdId,
          amount: inv.investmentAmount,
          status: inv.status,
          maturityDate: inv.maturityDate
        }))
      }
    });
    
  } catch (error) {
    console.error('Get CD investment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching CD investment information'
    });
  }
};

// Request CD investment
const requestCDInvestment = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    const { investmentAmount, tenureMonths, purpose, notes } = req.body;
    
    // Validate investment amount
    if (investmentAmount < 1000 || investmentAmount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Investment amount must be between ₹1,000 and ₹10,00,000'
      });
    }
    
    // Validate tenure
    const validTenures = [6, 12, 18, 24, 36, 48, 60];
    if (!validTenures.includes(tenureMonths)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenure. Must be one of: 6, 12, 18, 24, 36, 48, 60 months'
      });
    }
    
    // Check user's investment capacity
    const existingInvestments = await CDInvestment.find({
      userId: user._id,
      userType: userType === 'student' ? 'Student' : 'SocietyMember',
      status: { $in: ['pending', 'approved', 'active'] }
    });
    
    const totalInvested = existingInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const maxTotalInvestment = 500000;
    
    if (totalInvested + investmentAmount > maxTotalInvestment) {
      return res.status(400).json({
        success: false,
        message: `Investment amount exceeds your remaining capacity. You can invest maximum ₹${maxTotalInvestment - totalInvested} more.`
      });
    }
    
    // Get interest rate based on tenure
    const interestRates = {
      6: 6.5, 12: 7.5, 18: 8.0, 24: 8.5, 36: 9.0, 48: 9.5, 60: 10.0
    };
    const interestRate = interestRates[tenureMonths];
    
    // Create CD investment request
    const cdInvestment = new CDInvestment({
      userId: user._id,
      userType: userType === 'student' ? 'Student' : 'SocietyMember',
      userEmail: user.email,
      userStudentId: userType === 'student' ? user.studentId : undefined,
      userMemberId: userType === 'societyMember' ? user.memberId : undefined,
      investmentAmount,
      tenureMonths,
      interestRate,
      purpose: purpose || 'CD Investment',
      notes: notes || '',
      status: 'pending'
    });
    
    // Calculate maturity details
    cdInvestment.calculateMaturity();
    
    // Save the investment (pre-save hook will handle cdId and maturityDate)
    await cdInvestment.save();
    
    res.status(201).json({
      success: true,
      message: 'CD investment request submitted successfully',
      data: {
        cdInvestment: {
          cdId: cdInvestment.cdId,
          investmentAmount: cdInvestment.investmentAmount,
          tenureMonths: cdInvestment.tenureMonths,
          interestRate: cdInvestment.interestRate,
          maturityAmount: cdInvestment.maturityAmount,
          totalInterest: cdInvestment.totalInterest,
          status: cdInvestment.status,
          requestDate: cdInvestment.requestDate
        }
      }
    });
    
  } catch (error) {
    console.error('Request CD investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while submitting CD investment request'
    });
  }
};

// Get user's CD investments
const getMyCDInvestments = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {
      userId: user._id,
      userType: userType === 'student' ? 'Student' : 'SocietyMember'
    };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const investments = await CDInvestment.find(query)
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await CDInvestment.countDocuments(query);
    
    // Calculate summary statistics
    const summary = await CDInvestment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        investments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        summary: summary.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('Get my CD investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching CD investments'
    });
  }
};

// Get specific CD investment details
const getCDInvestmentDetails = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    const { cdId } = req.params;
    
    const investment = await CDInvestment.findOne({
      cdId: cdId.toUpperCase(),
      userId: user._id,
      userType: userType === 'student' ? 'Student' : 'SocietyMember'
    });
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'CD investment not found'
      });
    }
    
    // Add calculated fields
    const investmentWithCalculations = {
      ...investment.toObject(),
      isMatured: investment.isMatured(),
      remainingTenure: investment.getRemainingTenure(),
      userDisplayName: investment.userDisplayName
    };
    
    res.json({
      success: true,
      data: {
        investment: investmentWithCalculations
      }
    });
    
  } catch (error) {
    console.error('Get CD investment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching CD investment details'
    });
  }
};

// Admin CD Investment Functions

// Get all pending CD investment requests
const getPendingCDRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, sortBy = 'requestDate', sortOrder = 'desc' } = req.query;
    
    const query = { status: 'pending' };
    if (userType) {
      query.userType = userType === 'student' ? 'Student' : 'SocietyMember';
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const requests = await CDInvestment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await CDInvestment.countDocuments(query);
    
    // Get summary statistics
    const summary = await CDInvestment.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        summary: summary.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('Get pending CD requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending CD requests'
    });
  }
};

// Approve CD investment request
const approveCDRequest = async (req, res) => {
  try {
    const { cdId } = req.params;
    const { adminNotes } = req.body;
    const admin = req.user;
    
    const investment = await CDInvestment.findOne({ cdId: cdId.toUpperCase() });
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'CD investment request not found'
      });
    }
    
    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `CD investment request is already ${investment.status}`
      });
    }
    
    // Update investment status
    investment.status = 'approved';
    investment.approvalDate = new Date();
    investment.approvedBy = admin._id;
    investment.adminNotes = adminNotes || '';
    
    // Set maturity date
    investment.maturityDate = new Date();
    investment.maturityDate.setMonth(investment.maturityDate.getMonth() + investment.tenureMonths);
    
    await investment.save();
    
    res.json({
      success: true,
      message: 'CD investment request approved successfully',
      data: {
        investment: {
          cdId: investment.cdId,
          status: investment.status,
          approvalDate: investment.approvalDate,
          maturityDate: investment.maturityDate,
          adminNotes: investment.adminNotes
        }
      }
    });
    
  } catch (error) {
    console.error('Approve CD request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving CD request'
    });
  }
};

// Reject CD investment request
const rejectCDRequest = async (req, res) => {
  try {
    const { cdId } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const admin = req.user;
    
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason must be at least 10 characters long'
      });
    }
    
    const investment = await CDInvestment.findOne({ cdId: cdId.toUpperCase() });
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'CD investment request not found'
      });
    }
    
    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `CD investment request is already ${investment.status}`
      });
    }
    
    // Update investment status
    investment.status = 'rejected';
    investment.rejectionReason = rejectionReason;
    investment.adminNotes = adminNotes || '';
    
    await investment.save();
    
    res.json({
      success: true,
      message: 'CD investment request rejected successfully',
      data: {
        investment: {
          cdId: investment.cdId,
          status: investment.status,
          rejectionReason: investment.rejectionReason,
          adminNotes: investment.adminNotes
        }
      }
    });
    
  } catch (error) {
    console.error('Reject CD request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting CD request'
    });
  }
};

// Get all CD investments (admin view)
const getAllCDInvestments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      userType, 
      sortBy = 'requestDate', 
      sortOrder = 'desc',
      search
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (userType) query.userType = userType === 'student' ? 'Student' : 'SocietyMember';
    
    // Search functionality
    if (search) {
      query.$or = [
        { cdId: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userStudentId: { $regex: search, $options: 'i' } },
        { userMemberId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const investments = await CDInvestment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await CDInvestment.countDocuments(query);
    
    // Get comprehensive statistics
    const statistics = await CDInvestment.aggregate([
      {
        $group: {
          _id: null,
          totalInvestments: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' },
          totalMaturityAmount: { $sum: '$maturityAmount' },
          totalInterest: { $sum: '$totalInterest' },
          avgInvestmentAmount: { $avg: '$investmentAmount' },
          avgInterestRate: { $avg: '$interestRate' }
        }
      }
    ]);
    
    const statusStats = await CDInvestment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);
    
    const userTypeStats = await CDInvestment.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        investments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        statistics: {
          overall: statistics[0] || {
            totalInvestments: 0,
            totalAmount: 0,
            totalMaturityAmount: 0,
            totalInterest: 0,
            avgInvestmentAmount: 0,
            avgInterestRate: 0
          },
          byStatus: statusStats.reduce((acc, item) => {
            acc[item._id] = {
              count: item.count,
              totalAmount: item.totalAmount
            };
            return acc;
          }, {}),
          byUserType: userTypeStats.reduce((acc, item) => {
            acc[item._id] = {
              count: item.count,
              totalAmount: item.totalAmount
            };
            return acc;
          }, {})
        }
      }
    });
    
  } catch (error) {
    console.error('Get all CD investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching CD investments'
    });
  }
};

// Get CD investment details (admin view)
const getCDInvestmentDetailsAdmin = async (req, res) => {
  try {
    const { cdId } = req.params;
    
    const investment = await CDInvestment.findOne({ cdId: cdId.toUpperCase() });
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'CD investment not found'
      });
    }
    
    // Add calculated fields
    const investmentWithCalculations = {
      ...investment.toObject(),
      isMatured: investment.isMatured(),
      remainingTenure: investment.getRemainingTenure(),
      userDisplayName: investment.userDisplayName
    };
    
    res.json({
      success: true,
      data: {
        investment: investmentWithCalculations
      }
    });
    
  } catch (error) {
    console.error('Get CD investment details admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching CD investment details'
    });
  }
};

module.exports = {
  // User functions
  getCDInvestmentInfo,
  requestCDInvestment,
  getMyCDInvestments,
  getCDInvestmentDetails,
  
  // Admin functions
  getPendingCDRequests,
  approveCDRequest,
  rejectCDRequest,
  getAllCDInvestments,
  getCDInvestmentDetailsAdmin
};
