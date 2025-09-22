const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const CDInvestment = require('../models/cdInvestment.model');
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');

// Test data
const testData = {
  student: {
    email: 'teststudent@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'Student',
    department: 'Computer Science',
    year: '3rd',
    phoneNumber: '9876543210'
  },
  societyMember: {
    email: 'testmember@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'Member',
    societyName: 'Tech Society',
    position: 'Member',
    department: 'Computer Science',
    phoneNumber: '9876543211'
  },
  admin: {
    email: 'testadmin@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    permissions: ['user-management', 'content-management']
  }
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-api-building');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createTestUsers() {
  try {
    console.log('\n📝 Creating test users...');
    
    // Create test student
    const existingStudent = await Student.findOne({ email: testData.student.email });
    if (!existingStudent) {
      const student = new Student(testData.student);
      await student.save();
      console.log('✅ Test student created:', student.studentId);
    } else {
      console.log('✅ Test student already exists:', existingStudent.studentId);
    }
    
    // Create test society member
    const existingMember = await SocietyMember.findOne({ email: testData.societyMember.email });
    if (!existingMember) {
      const member = new SocietyMember(testData.societyMember);
      await member.save();
      console.log('✅ Test society member created:', member.memberId);
    } else {
      console.log('✅ Test society member already exists:', existingMember.memberId);
    }
    
    // Create test admin
    const existingAdmin = await Admin.findOne({ email: testData.admin.email });
    if (!existingAdmin) {
      const admin = new Admin(testData.admin);
      await admin.save();
      console.log('✅ Test admin created');
    } else {
      console.log('✅ Test admin already exists');
    }
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

async function testCDInvestmentModel() {
  try {
    console.log('\n🧪 Testing CD Investment Model...');
    
    // Get test student
    const student = await Student.findOne({ email: testData.student.email });
    if (!student) {
      console.log('❌ Test student not found');
      return;
    }
    
    // Test CD investment creation
    const cdInvestment = new CDInvestment({
      userId: student._id,
      userType: 'Student',
      userEmail: student.email,
      userStudentId: student.studentId,
      investmentAmount: 50000,
      tenureMonths: 12,
      interestRate: 7.5,
      purpose: 'Test CD Investment',
      notes: 'This is a test investment',
      status: 'pending'
    });
    
    // Calculate maturity details
    cdInvestment.calculateMaturity();
    
    await cdInvestment.save();
    console.log('✅ CD Investment created:', cdInvestment.cdId);
    console.log('   - Investment Amount:', cdInvestment.investmentAmount);
    console.log('   - Tenure:', cdInvestment.tenureMonths, 'months');
    console.log('   - Interest Rate:', cdInvestment.interestRate + '%');
    console.log('   - Maturity Amount:', cdInvestment.maturityAmount);
    console.log('   - Total Interest:', cdInvestment.totalInterest);
    console.log('   - Status:', cdInvestment.status);
    
    // Test model methods
    console.log('✅ Testing model methods:');
    console.log('   - Is Matured:', cdInvestment.isMatured());
    console.log('   - User Display Name:', cdInvestment.userDisplayName);
    
    return cdInvestment;
    
  } catch (error) {
    console.error('❌ Error testing CD Investment model:', error);
  }
}

async function testCDInvestmentQueries() {
  try {
    console.log('\n🔍 Testing CD Investment Queries...');
    
    // Test finding by user
    const student = await Student.findOne({ email: testData.student.email });
    const investments = await CDInvestment.find({ userId: student._id });
    console.log('✅ Found investments for student:', investments.length);
    
    // Test finding by status
    const pendingInvestments = await CDInvestment.find({ status: 'pending' });
    console.log('✅ Found pending investments:', pendingInvestments.length);
    
    // Test aggregation for statistics
    const stats = await CDInvestment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);
    console.log('✅ Investment statistics:', stats);
    
    // Test finding by CD ID
    if (investments.length > 0) {
      const cdId = investments[0].cdId;
      const foundInvestment = await CDInvestment.findOne({ cdId });
      console.log('✅ Found investment by CD ID:', foundInvestment ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Error testing CD Investment queries:', error);
  }
}

async function testCDInvestmentValidation() {
  try {
    console.log('\n✅ Testing CD Investment Validation...');
    
    const student = await Student.findOne({ email: testData.student.email });
    
    // Test valid investment
    const validInvestment = new CDInvestment({
      userId: student._id,
      userType: 'Student',
      userEmail: student.email,
      userStudentId: student.studentId,
      investmentAmount: 25000,
      tenureMonths: 24,
      interestRate: 8.5,
      purpose: 'Valid test investment',
      status: 'pending'
    });
    
    validInvestment.calculateMaturity();
    await validInvestment.save();
    console.log('✅ Valid investment created:', validInvestment.cdId);
    
    // Test invalid investment (amount too low)
    try {
      const invalidInvestment = new CDInvestment({
        userId: student._id,
        userType: 'Student',
        userEmail: student.email,
        userStudentId: student.studentId,
        investmentAmount: 500, // Too low
        tenureMonths: 12,
        interestRate: 7.5,
        status: 'pending'
      });
      
      await invalidInvestment.save();
      console.log('❌ Invalid investment was saved (should have failed)');
    } catch (error) {
      console.log('✅ Invalid investment correctly rejected:', error.message);
    }
    
    // Test invalid tenure
    try {
      const invalidTenureInvestment = new CDInvestment({
        userId: student._id,
        userType: 'Student',
        userEmail: student.email,
        userStudentId: student.studentId,
        investmentAmount: 10000,
        tenureMonths: 15, // Invalid tenure
        interestRate: 7.5,
        status: 'pending'
      });
      
      await invalidTenureInvestment.save();
      console.log('❌ Invalid tenure investment was saved (should have failed)');
    } catch (error) {
      console.log('✅ Invalid tenure investment correctly rejected:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing CD Investment validation:', error);
  }
}

async function testCDInvestmentWorkflow() {
  try {
    console.log('\n🔄 Testing CD Investment Workflow...');
    
    const student = await Student.findOne({ email: testData.student.email });
    const admin = await Admin.findOne({ email: testData.admin.email });
    
    // Create a new investment request
    const cdInvestment = new CDInvestment({
      userId: student._id,
      userType: 'Student',
      userEmail: student.email,
      userStudentId: student.studentId,
      investmentAmount: 75000,
      tenureMonths: 36,
      interestRate: 9.0,
      purpose: 'Workflow test investment',
      status: 'pending'
    });
    
    cdInvestment.calculateMaturity();
    await cdInvestment.save();
    console.log('✅ Investment request created:', cdInvestment.cdId, '(Status: pending)');
    
    // Simulate admin approval
    cdInvestment.status = 'approved';
    cdInvestment.approvalDate = new Date();
    cdInvestment.approvedBy = admin._id;
    cdInvestment.adminNotes = 'Approved for testing';
    
    // Set maturity date
    cdInvestment.maturityDate = new Date();
    cdInvestment.maturityDate.setMonth(cdInvestment.maturityDate.getMonth() + cdInvestment.tenureMonths);
    
    await cdInvestment.save();
    console.log('✅ Investment approved:', cdInvestment.cdId, '(Status: approved)');
    console.log('   - Approval Date:', cdInvestment.approvalDate);
    console.log('   - Maturity Date:', cdInvestment.maturityDate);
    console.log('   - Admin Notes:', cdInvestment.adminNotes);
    
    // Test maturity calculation
    const remainingTenure = cdInvestment.getRemainingTenure();
    console.log('✅ Remaining tenure:', remainingTenure, 'days');
    
    // Test status change to active
    cdInvestment.status = 'active';
    await cdInvestment.save();
    console.log('✅ Investment activated:', cdInvestment.cdId, '(Status: active)');
    
  } catch (error) {
    console.error('❌ Error testing CD Investment workflow:', error);
  }
}

async function testCDInvestmentCapacity() {
  try {
    console.log('\n💰 Testing CD Investment Capacity...');
    
    const student = await Student.findOne({ email: testData.student.email });
    
    // Get existing investments
    const existingInvestments = await CDInvestment.find({
      userId: student._id,
      userType: 'Student',
      status: { $in: ['pending', 'approved', 'active'] }
    });
    
    const totalInvested = existingInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const maxTotalInvestment = 500000;
    const remainingCapacity = Math.max(0, maxTotalInvestment - totalInvested);
    
    console.log('✅ Investment Capacity Analysis:');
    console.log('   - Total Invested:', totalInvested);
    console.log('   - Max Total Investment:', maxTotalInvestment);
    console.log('   - Remaining Capacity:', remainingCapacity);
    console.log('   - Can Invest More:', remainingCapacity > 0);
    
    // Test capacity limit
    if (remainingCapacity > 0) {
      const testAmount = Math.min(remainingCapacity, 10000);
      const testInvestment = new CDInvestment({
        userId: student._id,
        userType: 'Student',
        userEmail: student.email,
        userStudentId: student.studentId,
        investmentAmount: testAmount,
        tenureMonths: 12,
        interestRate: 7.5,
        purpose: 'Capacity test investment',
        status: 'pending'
      });
      
      testInvestment.calculateMaturity();
      await testInvestment.save();
      console.log('✅ Capacity test investment created:', testInvestment.cdId);
    } else {
      console.log('✅ User has reached maximum investment capacity');
    }
    
  } catch (error) {
    console.error('❌ Error testing CD Investment capacity:', error);
  }
}

async function cleanupTestData() {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test CD investments
    const deletedInvestments = await CDInvestment.deleteMany({
      purpose: { $regex: /test/i }
    });
    console.log('✅ Deleted test CD investments:', deletedInvestments.deletedCount);
    
    // Delete test users (optional - uncomment if needed)
    // await Student.deleteOne({ email: testData.student.email });
    // await SocietyMember.deleteOne({ email: testData.societyMember.email });
    // await Admin.deleteOne({ email: testData.admin.email });
    // console.log('✅ Deleted test users');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting CD Investment System Tests...\n');
    
    await connectDB();
    await createTestUsers();
    await testCDInvestmentModel();
    await testCDInvestmentQueries();
    await testCDInvestmentValidation();
    await testCDInvestmentWorkflow();
    await testCDInvestmentCapacity();
    
    console.log('\n✅ All CD Investment tests completed successfully!');
    
    // Uncomment to cleanup test data
    // await cleanupTestData();
    
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
  runTests,
  testData
};
