const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Payment = require('../models/payment.model');
const EMIRecord = require('../models/emiRecord.model');
const Investment = require('../models/investment.model');
const SocietyMember = require('../models/societyMember.model');
const InvestmentPlan = require('../models/investmentPlan.model');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society_management');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create simple sample data
const createSimpleSampleData = async () => {
  try {
    // Find or create a member
    let member = await SocietyMember.findOne();
    
    if (!member) {
      console.log('No members found. Creating a sample member...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      member = new SocietyMember({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        originalPassword: 'password123',
        memberId: '202501001',
        societyName: 'Sample Society',
        position: 'Member',
        phoneNumber: '+919876543210',
        dateOfBirth: new Date('1990-01-01'),
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        isActive: true,
        isVerified: true,
        kycStatus: 'approved'
      });
      
      await member.save();
      console.log(`Created sample member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    } else {
      console.log(`Using existing member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    }
    
    const memberId = member._id.toString();
    
    // Find or create an investment plan
    let plan = await InvestmentPlan.findOne();
    if (!plan) {
      plan = new InvestmentPlan({
        planName: 'Monthly RD Plan',
        planType: 'RD',
        interestRate: 8.5,
        tenureMonths: 12,
        minimumAmount: 1000,
        maximumAmount: 100000,
        description: 'Monthly Recurring Deposit Plan',
        createdBy: new mongoose.Types.ObjectId(memberId)
      });
      await plan.save();
      console.log('Created sample investment plan');
    }
    
    // Find or create an investment
    let investment = await Investment.findOne({ memberId: new mongoose.Types.ObjectId(memberId) });
    if (!investment) {
      const investmentDate = new Date('2024-01-01');
      const maturityDate = new Date(investmentDate);
      maturityDate.setMonth(maturityDate.getMonth() + 12);
      
      investment = new Investment({
        investmentId: 'INV' + Date.now().toString().slice(-6),
        memberId: new mongoose.Types.ObjectId(memberId),
        planId: plan._id,
        principalAmount: 50000,
        monthlyInstallment: 5000,
        expectedMaturityAmount: 60000,
        investmentDate: investmentDate,
        maturityDate: maturityDate,
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(memberId)
      });
      await investment.save();
      console.log('Created sample investment');
    }
    
    // Create a simple EMI record
    const emiRecord = new EMIRecord({
      emiId: 'EMI' + Date.now().toString().slice(-8),
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      emiNumber: 1,
      emiAmount: 5000,
      dueDate: new Date(),
      gracePeriodEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'pending',
      calculationDetails: {
        principalComponent: 5000,
        interestComponent: 0,
        remainingPrincipal: 45000,
        cumulativeInterest: 0
      },
      createdBy: new mongoose.Types.ObjectId(memberId)
    });
    
    await emiRecord.save();
    console.log('Created sample EMI record');
    
    // Create a simple payment
    const payment = new Payment({
      paymentId: 'PAY' + Date.now().toString().slice(-8),
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      paymentType: 'cash',
      paymentMethod: 'cash',
      amount: 5000,
      emiNumber: 1,
      paymentFor: 'emi',
      status: 'pending',
      verificationStatus: 'pending',
      paymentDate: new Date(),
      remarks: 'Sample cash payment for testing'
    });
    
    await payment.save();
    console.log('Created sample payment');
    
    console.log('\n=== Sample Data Created Successfully ===');
    console.log(`Member: ${member.firstName} ${member.lastName} (${member.memberId})`);
    console.log(`Member ID: ${member._id}`);
    console.log(`Investment: ${investment.investmentId} - ₹${investment.principalAmount}`);
    console.log(`EMI Record: ${emiRecord.emiId} - Status: ${emiRecord.status}`);
    console.log(`Payment: ${payment.paymentId} - Status: ${payment.status}`);
    console.log('\nYou can now test the payment APIs with this data.');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createSimpleSampleData();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createSimpleSampleData };
