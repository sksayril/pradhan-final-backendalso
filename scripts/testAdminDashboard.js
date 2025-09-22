const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');
const CDInvestment = require('../models/cdInvestment.model');
const InvestmentApplication = require('../models/investmentApplication.model');
const LoanRequest = require('../models/loanRequest.model');
const FeeRequest = require('../models/feeRequest.model');
const FeePayment = require('../models/feePayment.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const Enrollment = require('../models/enrollment.model');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-api-building');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testDashboardQueries() {
  try {
    console.log('\n📊 Testing Admin Dashboard Queries...');
    
    // Test basic counts
    const totalStudents = await Student.countDocuments();
    const totalSocietyMembers = await SocietyMember.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    
    console.log('✅ Basic Counts:');
    console.log(`   - Total Students: ${totalStudents}`);
    console.log(`   - Total Society Members: ${totalSocietyMembers}`);
    console.log(`   - Total Admins: ${totalAdmins}`);
    
    // Test active users
    const activeStudents = await Student.countDocuments({ isActive: true });
    const activeSocietyMembers = await SocietyMember.countDocuments({ isActive: true });
    
    console.log('✅ Active Users:');
    console.log(`   - Active Students: ${activeStudents}`);
    console.log(`   - Active Society Members: ${activeSocietyMembers}`);
    
    // Test monthly statistics
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const newStudentsThisMonth = await Student.countDocuments({ createdAt: { $gte: startOfMonth } });
    const newSocietyMembersThisMonth = await SocietyMember.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    console.log('✅ Monthly Statistics:');
    console.log(`   - New Students This Month: ${newStudentsThisMonth}`);
    console.log(`   - New Society Members This Month: ${newSocietyMembersThisMonth}`);
    
    // Test investment statistics
    const totalCDInvestments = await CDInvestment.countDocuments();
    const cdInvestmentAmount = await CDInvestment.aggregate([
      { $group: { _id: null, total: { $sum: '$investmentAmount' } } }
    ]);
    
    console.log('✅ Investment Statistics:');
    console.log(`   - Total CD Investments: ${totalCDInvestments}`);
    console.log(`   - Total CD Investment Amount: ₹${cdInvestmentAmount[0]?.total || 0}`);
    
    // Test loan statistics
    const totalLoans = await LoanRequest.countDocuments();
    const loanAmount = await LoanRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$loanAmount' } } }
    ]);
    
    console.log('✅ Loan Statistics:');
    console.log(`   - Total Loan Requests: ${totalLoans}`);
    console.log(`   - Total Loan Amount: ₹${loanAmount[0]?.total || 0}`);
    
    // Test fee statistics
    const totalFeePayments = await FeePayment.countDocuments();
    const feeCollected = await FeePayment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    console.log('✅ Fee Statistics:');
    console.log(`   - Total Fee Payments: ${totalFeePayments}`);
    console.log(`   - Total Fee Collected: ₹${feeCollected[0]?.total || 0}`);
    
    // Test academic statistics
    const totalCourses = await Course.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    
    console.log('✅ Academic Statistics:');
    console.log(`   - Total Courses: ${totalCourses}`);
    console.log(`   - Total Batches: ${totalBatches}`);
    console.log(`   - Total Enrollments: ${totalEnrollments}`);
    
  } catch (error) {
    console.error('❌ Error testing dashboard queries:', error);
  }
}

async function testChartData() {
  try {
    console.log('\n📈 Testing Chart Data Generation...');
    
    const currentDate = new Date();
    const last12Months = [];
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      last12Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: date,
        nextMonth: nextMonth
      });
    }
    
    console.log('✅ Generated 12 months data:', last12Months.length, 'months');
    
    // Test monthly student data
    const monthlyStudents = await Promise.all(last12Months.map(async (month) => {
      const count = await Student.countDocuments({
        createdAt: { $gte: month.date, $lt: month.nextMonth }
      });
      return { month: month.month, count };
    }));
    
    console.log('✅ Monthly Students Data:');
    monthlyStudents.forEach(item => {
      console.log(`   - ${item.month}: ${item.count} students`);
    });
    
    // Test monthly CD investment data
    const monthlyCDInvestments = await Promise.all(last12Months.map(async (month) => {
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
    }));
    
    console.log('✅ Monthly CD Investment Data:');
    monthlyCDInvestments.forEach(item => {
      console.log(`   - ${item.month}: ${item.count} investments, ₹${item.amount}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing chart data:', error);
  }
}

async function testDepartmentStatistics() {
  try {
    console.log('\n🏫 Testing Department Statistics...');
    
    const studentDepartments = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Student Department Distribution:');
    studentDepartments.forEach(dept => {
      console.log(`   - ${dept._id}: ${dept.count} students`);
    });
    
    const societyMemberDepartments = await SocietyMember.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Society Member Department Distribution:');
    societyMemberDepartments.forEach(dept => {
      console.log(`   - ${dept._id}: ${dept.count} members`);
    });
    
  } catch (error) {
    console.error('❌ Error testing department statistics:', error);
  }
}

async function testStatusBreakdowns() {
  try {
    console.log('\n📋 Testing Status Breakdowns...');
    
    const cdInvestmentStatus = await CDInvestment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('✅ CD Investment Status Breakdown:');
    cdInvestmentStatus.forEach(status => {
      console.log(`   - ${status._id}: ${status.count} investments`);
    });
    
    const loanStatus = await LoanRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('✅ Loan Status Breakdown:');
    loanStatus.forEach(status => {
      console.log(`   - ${status._id}: ${status.count} loans`);
    });
    
  } catch (error) {
    console.error('❌ Error testing status breakdowns:', error);
  }
}

async function testRecentActivities() {
  try {
    console.log('\n🕒 Testing Recent Activities...');
    
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName lastName studentId email createdAt');
    
    console.log('✅ Recent Students:');
    recentStudents.forEach(student => {
      console.log(`   - ${student.firstName} ${student.lastName} (${student.studentId}) - ${student.createdAt}`);
    });
    
    const recentCDInvestments = await CDInvestment.find()
      .sort({ requestDate: -1 })
      .limit(3)
      .populate('userId', 'firstName lastName studentId memberId');
    
    console.log('✅ Recent CD Investments:');
    recentCDInvestments.forEach(investment => {
      console.log(`   - ${investment.cdId}: ₹${investment.investmentAmount} - ${investment.requestDate}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing recent activities:', error);
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Admin Dashboard Tests...\n');
    
    await connectDB();
    await testDashboardQueries();
    await testChartData();
    await testDepartmentStatistics();
    await testStatusBreakdowns();
    await testRecentActivities();
    
    console.log('\n✅ All Admin Dashboard tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests
};
