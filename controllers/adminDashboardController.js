const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');
const CDInvestment = require('../models/cdInvestment.model');
const InvestmentApplication = require('../models/investmentApplication.model');
const LoanRequest = require('../models/loanRequest.model');
const FeeRequest = require('../models/feeRequest.model');
const FeePayment = require('../models/feePayment.model');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const Attendance = require('../models/attendance.model');

// Get comprehensive admin dashboard data
const getAdminDashboard = async (req, res) => {
  try {
    const admin = req.user;
    
    // Get current date for calculations
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Parallel execution of all queries for better performance
    const [
      // User Statistics
      totalStudents,
      totalSocietyMembers,
      totalAdmins,
      activeStudents,
      activeSocietyMembers,
      newStudentsThisMonth,
      newSocietyMembersThisMonth,
      
      // Investment Statistics
      totalCDInvestments,
      totalCDInvestmentAmount,
      pendingCDRequests,
      approvedCDInvestments,
      totalInvestmentApplications,
      totalInvestmentAmount,
      pendingInvestmentApplications,
      
      // Loan Statistics
      totalLoanRequests,
      totalLoanAmount,
      pendingLoanRequests,
      approvedLoans,
      totalLoanDisbursed,
      
      // Fee Statistics
      totalFeeRequests,
      totalFeeAmount,
      pendingFeeRequests,
      totalFeePayments,
      totalFeeCollected,
      
      // Course and Enrollment Statistics
      totalCourses,
      totalBatches,
      totalEnrollments,
      activeEnrollments,
      
      // Attendance Statistics
      totalAttendanceRecords,
      attendanceThisMonth,
      
      // Recent Activities
      recentStudents,
      recentSocietyMembers,
      recentCDInvestments,
      recentLoanRequests,
      recentFeePayments
    ] = await Promise.all([
      // User Statistics
      Student.countDocuments(),
      SocietyMember.countDocuments(),
      Admin.countDocuments(),
      Student.countDocuments({ isActive: true }),
      SocietyMember.countDocuments({ isActive: true }),
      Student.countDocuments({ createdAt: { $gte: startOfMonth } }),
      SocietyMember.countDocuments({ createdAt: { $gte: startOfMonth } }),
      
      // Investment Statistics
      CDInvestment.countDocuments(),
      CDInvestment.aggregate([{ $group: { _id: null, total: { $sum: '$investmentAmount' } } }]),
      CDInvestment.countDocuments({ status: 'pending' }),
      CDInvestment.countDocuments({ status: 'approved' }),
      InvestmentApplication.countDocuments(),
      InvestmentApplication.aggregate([{ $group: { _id: null, total: { $sum: '$investmentAmount' } } }]),
      InvestmentApplication.countDocuments({ status: 'pending' }),
      
      // Loan Statistics
      LoanRequest.countDocuments(),
      LoanRequest.aggregate([{ $group: { _id: null, total: { $sum: '$loanAmount' } } }]),
      LoanRequest.countDocuments({ status: 'pending' }),
      LoanRequest.countDocuments({ status: 'approved' }),
      LoanRequest.aggregate([
        { $match: { status: 'disbursed' } },
        { $group: { _id: null, total: { $sum: '$disbursedAmount' } } }
      ]),
      
      // Fee Statistics
      FeeRequest.countDocuments(),
      FeeRequest.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      FeeRequest.countDocuments({ status: 'pending' }),
      FeePayment.countDocuments(),
      FeePayment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      
      // Course and Enrollment Statistics
      Course.countDocuments(),
      Batch.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      
      // Attendance Statistics
      Attendance.countDocuments(),
      Attendance.countDocuments({ date: { $gte: startOfMonth } }),
      
      // Recent Activities
      Student.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName studentId email createdAt'),
      SocietyMember.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName memberId email createdAt'),
      CDInvestment.find().sort({ requestDate: -1 }).limit(5).select('cdId investmentAmount status requestDate userEmail userStudentId userMemberId'),
      LoanRequest.find().sort({ requestDate: -1 }).limit(5).select('loanAmount status requestDate'),
      FeePayment.find().sort({ paymentDate: -1 }).limit(5).select('amount paymentDate')
    ]);

    // Process aggregation results
    const totalCDInvestmentAmountValue = totalCDInvestmentAmount[0]?.total || 0;
    const totalInvestmentAmountValue = totalInvestmentAmount[0]?.total || 0;
    const totalLoanAmountValue = totalLoanAmount[0]?.total || 0;
    const totalLoanDisbursedValue = totalLoanDisbursed[0]?.total || 0;
    const totalFeeAmountValue = totalFeeAmount[0]?.total || 0;
    const totalFeeCollectedValue = totalFeeCollected[0]?.total || 0;

    // Get chart data
    const chartData = await getChartData();

    // Get monthly statistics for trends
    const monthlyStats = await getMonthlyStatistics();

    // Get department-wise statistics
    const departmentStats = await getDepartmentStatistics();

    // Get status-wise breakdowns
    const statusBreakdowns = await getStatusBreakdowns();

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        },
        overview: {
          totalUsers: totalStudents + totalSocietyMembers,
          totalStudents,
          totalSocietyMembers,
          totalAdmins,
          activeUsers: activeStudents + activeSocietyMembers,
          newUsersThisMonth: newStudentsThisMonth + newSocietyMembersThisMonth
        },
        investments: {
          cdInvestments: {
            total: totalCDInvestments,
            totalAmount: totalCDInvestmentAmountValue,
            pending: pendingCDRequests,
            approved: approvedCDInvestments
          },
          regularInvestments: {
            total: totalInvestmentApplications,
            totalAmount: totalInvestmentAmountValue,
            pending: pendingInvestmentApplications
          },
          combined: {
            totalInvestments: totalCDInvestments + totalInvestmentApplications,
            totalAmount: totalCDInvestmentAmountValue + totalInvestmentAmountValue
          }
        },
        loans: {
          totalRequests: totalLoanRequests,
          totalAmount: totalLoanAmountValue,
          pending: pendingLoanRequests,
          approved: approvedLoans,
          disbursed: totalLoanDisbursedValue
        },
        fees: {
          totalRequests: totalFeeRequests,
          totalAmount: totalFeeAmountValue,
          pending: pendingFeeRequests,
          totalPayments: totalFeePayments,
          totalCollected: totalFeeCollectedValue
        },
        academics: {
          totalCourses,
          totalBatches,
          totalEnrollments,
          activeEnrollments,
          totalAttendanceRecords,
          attendanceThisMonth
        },
        charts: chartData,
        monthlyStats,
        departmentStats,
        statusBreakdowns,
        recentActivities: {
          students: recentStudents,
          societyMembers: recentSocietyMembers,
          cdInvestments: recentCDInvestments,
          loanRequests: recentLoanRequests,
          feePayments: recentFeePayments
        },
        summary: {
          totalRevenue: totalFeeCollectedValue + totalLoanDisbursedValue,
          totalInvestments: totalCDInvestmentAmountValue + totalInvestmentAmountValue,
          totalPendingApprovals: pendingCDRequests + pendingInvestmentApplications + pendingLoanRequests + pendingFeeRequests,
          systemHealth: {
            activeUsers: activeStudents + activeSocietyMembers,
            activeCourses: totalCourses,
            activeBatches: totalBatches,
            systemUptime: process.uptime()
          }
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching admin dashboard data'
    });
  }
};

// Get chart data for dashboard
const getChartData = async () => {
  try {
    const currentDate = new Date();
    const last12Months = [];
    
    // Generate last 12 months data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      last12Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: date,
        nextMonth: nextMonth
      });
    }

    // Get monthly data for different metrics
    const [
      monthlyStudents,
      monthlySocietyMembers,
      monthlyCDInvestments,
      monthlyLoans,
      monthlyFees
    ] = await Promise.all([
      // Monthly students
      Promise.all(last12Months.map(async (month) => {
        const count = await Student.countDocuments({
          createdAt: { $gte: month.date, $lt: month.nextMonth }
        });
        return { month: month.month, count };
      })),
      
      // Monthly society members
      Promise.all(last12Months.map(async (month) => {
        const count = await SocietyMember.countDocuments({
          createdAt: { $gte: month.date, $lt: month.nextMonth }
        });
        return { month: month.month, count };
      })),
      
      // Monthly CD investments
      Promise.all(last12Months.map(async (month) => {
        const result = await CDInvestment.aggregate([
          {
            $match: {
              requestDate: { $gte: month.date, $lt: month.nextMonth }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$investmentAmount' }
            }
          }
        ]);
        return {
          month: month.month,
          count: result[0]?.count || 0,
          amount: result[0]?.amount || 0
        };
      })),
      
      // Monthly loans
      Promise.all(last12Months.map(async (month) => {
        const result = await LoanRequest.aggregate([
          {
            $match: {
              requestDate: { $gte: month.date, $lt: month.nextMonth }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$loanAmount' }
            }
          }
        ]);
        return {
          month: month.month,
          count: result[0]?.count || 0,
          amount: result[0]?.amount || 0
        };
      })),
      
      // Monthly fees
      Promise.all(last12Months.map(async (month) => {
        const result = await FeePayment.aggregate([
          {
            $match: {
              paymentDate: { $gte: month.date, $lt: month.nextMonth }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$amount' }
            }
          }
        ]);
        return {
          month: month.month,
          count: result[0]?.count || 0,
          amount: result[0]?.amount || 0
        };
      }))
    ]);

    return {
      userGrowth: {
        students: monthlyStudents,
        societyMembers: monthlySocietyMembers
      },
      financial: {
        cdInvestments: monthlyCDInvestments,
        loans: monthlyLoans,
        fees: monthlyFees
      }
    };

  } catch (error) {
    console.error('Chart data error:', error);
    return {
      userGrowth: { students: [], societyMembers: [] },
      financial: { cdInvestments: [], loans: [], fees: [] }
    };
  }
};

// Get monthly statistics
const getMonthlyStatistics = async () => {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [
      currentMonthStats,
      lastMonthStats
    ] = await Promise.all([
      // Current month
      Promise.all([
        Student.countDocuments({ createdAt: { $gte: currentMonth } }),
        SocietyMember.countDocuments({ createdAt: { $gte: currentMonth } }),
        CDInvestment.aggregate([
          { $match: { requestDate: { $gte: currentMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$investmentAmount' } } }
        ]),
        LoanRequest.aggregate([
          { $match: { requestDate: { $gte: currentMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$loanAmount' } } }
        ]),
        FeePayment.aggregate([
          { $match: { paymentDate: { $gte: currentMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
        ])
      ]),
      
      // Last month
      Promise.all([
        Student.countDocuments({ createdAt: { $gte: lastMonth, $lte: endOfLastMonth } }),
        SocietyMember.countDocuments({ createdAt: { $gte: lastMonth, $lte: endOfLastMonth } }),
        CDInvestment.aggregate([
          { $match: { requestDate: { $gte: lastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$investmentAmount' } } }
        ]),
        LoanRequest.aggregate([
          { $match: { requestDate: { $gte: lastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$loanAmount' } } }
        ]),
        FeePayment.aggregate([
          { $match: { paymentDate: { $gte: lastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
        ])
      ])
    ]);

    const current = {
      students: currentMonthStats[0],
      societyMembers: currentMonthStats[1],
      cdInvestments: { count: currentMonthStats[2][0]?.count || 0, amount: currentMonthStats[2][0]?.amount || 0 },
      loans: { count: currentMonthStats[3][0]?.count || 0, amount: currentMonthStats[3][0]?.amount || 0 },
      fees: { count: currentMonthStats[4][0]?.count || 0, amount: currentMonthStats[4][0]?.amount || 0 }
    };

    const last = {
      students: lastMonthStats[0],
      societyMembers: lastMonthStats[1],
      cdInvestments: { count: lastMonthStats[2][0]?.count || 0, amount: lastMonthStats[2][0]?.amount || 0 },
      loans: { count: lastMonthStats[3][0]?.count || 0, amount: lastMonthStats[3][0]?.amount || 0 },
      fees: { count: lastMonthStats[4][0]?.count || 0, amount: lastMonthStats[4][0]?.amount || 0 }
    };

    // Calculate growth percentages
    const calculateGrowth = (current, last) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - last) / last) * 100);
    };

    return {
      current,
      last,
      growth: {
        students: calculateGrowth(current.students, last.students),
        societyMembers: calculateGrowth(current.societyMembers, last.societyMembers),
        cdInvestments: calculateGrowth(current.cdInvestments.count, last.cdInvestments.count),
        loans: calculateGrowth(current.loans.count, last.loans.count),
        fees: calculateGrowth(current.fees.count, last.fees.count)
      }
    };

  } catch (error) {
    console.error('Monthly statistics error:', error);
    return { current: {}, last: {}, growth: {} };
  }
};

// Get department-wise statistics
const getDepartmentStatistics = async () => {
  try {
    const [
      studentDepartments,
      societyMemberDepartments,
      courseDepartments
    ] = await Promise.all([
      Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SocietyMember.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Course.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      students: studentDepartments,
      societyMembers: societyMemberDepartments,
      courses: courseDepartments
    };

  } catch (error) {
    console.error('Department statistics error:', error);
    return { students: [], societyMembers: [], courses: [] };
  }
};

// Get status-wise breakdowns
const getStatusBreakdowns = async () => {
  try {
    const [
      cdInvestmentStatus,
      loanStatus,
      feeRequestStatus,
      enrollmentStatus
    ] = await Promise.all([
      CDInvestment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      LoanRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      FeeRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Enrollment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return {
      cdInvestments: cdInvestmentStatus,
      loans: loanStatus,
      feeRequests: feeRequestStatus,
      enrollments: enrollmentStatus
    };

  } catch (error) {
    console.error('Status breakdown error:', error);
    return { cdInvestments: [], loans: [], feeRequests: [], enrollments: [] };
  }
};

// Get quick stats for dashboard widgets
const getQuickStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingApprovals,
      totalRevenue,
      activeCourses
    ] = await Promise.all([
      Student.countDocuments() + SocietyMember.countDocuments(),
      CDInvestment.countDocuments({ status: 'pending' }) +
      InvestmentApplication.countDocuments({ status: 'pending' }) +
      LoanRequest.countDocuments({ status: 'pending' }) +
      FeeRequest.countDocuments({ status: 'pending' }),
      FeePayment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Course.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingApprovals,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeCourses
      }
    });

  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching quick stats'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getQuickStats
};
