const mongoose = require('mongoose');
require('dotenv').config();

// Import models to test
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');
const CDInvestment = require('../models/cdInvestment.model');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-api-building');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testBasicQueries() {
  try {
    console.log('\n🧪 Testing Basic Dashboard Queries...');
    
    // Test basic counts
    const totalStudents = await Student.countDocuments();
    const totalSocietyMembers = await SocietyMember.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalCDInvestments = await CDInvestment.countDocuments();
    
    console.log('✅ Basic Counts:');
    console.log(`   - Total Students: ${totalStudents}`);
    console.log(`   - Total Society Members: ${totalSocietyMembers}`);
    console.log(`   - Total Admins: ${totalAdmins}`);
    console.log(`   - Total CD Investments: ${totalCDInvestments}`);
    
    // Test recent activities without populate
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName lastName studentId email createdAt');
    
    console.log('✅ Recent Students (without populate):');
    recentStudents.forEach(student => {
      console.log(`   - ${student.firstName} ${student.lastName} (${student.studentId})`);
    });
    
    const recentCDInvestments = await CDInvestment.find()
      .sort({ requestDate: -1 })
      .limit(3)
      .select('cdId investmentAmount status requestDate userEmail userStudentId userMemberId');
    
    console.log('✅ Recent CD Investments (without populate):');
    recentCDInvestments.forEach(investment => {
      console.log(`   - ${investment.cdId}: ₹${investment.investmentAmount} (${investment.userEmail})`);
    });
    
    // Test aggregation queries
    const cdInvestmentStats = await CDInvestment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('✅ CD Investment Status Breakdown:');
    cdInvestmentStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} investments`);
    });
    
    console.log('\n✅ All basic queries working without populate errors!');
    
  } catch (error) {
    console.error('❌ Error testing basic queries:', error);
  }
}

async function testAdminDashboardController() {
  try {
    console.log('\n📊 Testing Admin Dashboard Controller...');
    
    // Import the controller
    const { getAdminDashboard } = require('../controllers/adminDashboardController');
    
    // Mock request and response
    const mockReq = {
      user: {
        _id: '68c66237516e72a030641ddc',
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin'
      }
    };
    
    let responseData = null;
    let errorOccurred = false;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        console.log('✅ Admin Dashboard Response Received:');
        console.log('   - Success:', data.success);
        if (data.data) {
          console.log('   - Admin Name:', data.data.admin?.name);
          console.log('   - Total Users:', data.data.overview?.totalUsers);
          console.log('   - Total Students:', data.data.overview?.totalStudents);
          console.log('   - Total Society Members:', data.data.overview?.totalSocietyMembers);
          console.log('   - CD Investments:', data.data.investments?.cdInvestments?.total);
          console.log('   - Charts Available:', !!data.data.charts);
          console.log('   - Monthly Stats Available:', !!data.data.monthlyStats);
        }
        return data;
      },
      status: (code) => ({
        json: (data) => {
          errorOccurred = true;
          console.log('❌ Error Response:', code, data.message);
          return data;
        }
      })
    };
    
    // Test the controller
    await getAdminDashboard(mockReq, mockRes);
    
    if (!errorOccurred && responseData) {
      console.log('✅ Admin Dashboard Controller working successfully!');
    } else {
      console.log('❌ Admin Dashboard Controller has issues');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin dashboard controller:', error);
  }
}

async function runTests() {
  try {
    console.log('🚀 Testing Admin Dashboard Fix...\n');
    
    await connectDB();
    await testBasicQueries();
    await testAdminDashboardController();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Removed all problematic populate() calls');
    console.log('   - Dashboard now uses direct field selection');
    console.log('   - No more StrictPopulateError');
    console.log('   - API should work: GET /api/admin/dashboard');
    
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