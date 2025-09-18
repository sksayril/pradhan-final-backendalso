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

// Create sample payments for testing
const createSamplePayments = async () => {
  try {
    const targetMemberId = '68caa951efcb5a1ed55563cd';
    
    // Check if member exists
    let member = await SocietyMember.findById(targetMemberId);
    
    if (!member) {
      console.log('Target member not found. Checking for existing members...');
      
      // Find any existing member
      member = await SocietyMember.findOne();
      
      if (!member) {
        console.log('No members found. Creating a sample member...');
        
        // Create a sample member
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        member = new SocietyMember({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: hashedPassword,
          originalPassword: 'password123',
          memberId: '202501001', // Format: YYYYMMXXX
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
    } else {
      console.log(`Found target member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    }
    
    const memberId = member._id.toString();
    
    console.log(`Creating sample payments for member: ${member.firstName} ${member.lastName} (${member.memberId})`);
    
    // Find or create an investment for this member
    let investment = await Investment.findOne({ memberId: new mongoose.Types.ObjectId(memberId) });
    
    if (!investment) {
      // Find a sample investment plan
      let plan = await InvestmentPlan.findOne();
      if (!plan) {
        // Create a sample plan if none exists
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
      
      // Create investment
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
    
    // Create sample EMI records
    const emiRecords = [];
    for (let i = 1; i <= 6; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const gracePeriodEndDate = new Date(dueDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);
      
      const emiRecord = new EMIRecord({
        investmentId: investment._id,
        memberId: new mongoose.Types.ObjectId(memberId),
        planId: investment.planId,
        emiNumber: i,
        emiAmount: 5000,
        dueDate: dueDate,
        gracePeriodEndDate: gracePeriodEndDate,
        status: i <= 2 ? 'paid' : 'pending', // First 2 EMIs paid, rest pending
        calculationDetails: {
          principalComponent: 5000,
          interestComponent: 0,
          remainingPrincipal: 50000 - (i * 5000),
          cumulativeInterest: 0
        },
        createdBy: new mongoose.Types.ObjectId(memberId) // Using member ID as creator for simplicity
      });
      
      await emiRecord.save();
      emiRecords.push(emiRecord);
      console.log(`Created EMI record #${i} - Status: ${emiRecord.status}`);
    }
    
    // Create sample payments
    const payments = [];
    
    // 1. Online payment (completed)
    const onlinePayment = new Payment({
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: investment.planId,
      paymentType: 'online',
      paymentMethod: 'upi',
      amount: 5000,
      emiNumber: 1,
      paymentFor: 'emi',
      status: 'completed',
      verificationStatus: 'verified',
      paymentDate: new Date('2024-01-15'),
      processedDate: new Date('2024-01-15'),
      transactionId: 'TXN' + Date.now() + '001',
      gatewayResponse: {
        gatewayName: 'razorpay',
        gatewayTransactionId: 'pay_' + Date.now(),
        gatewayOrderId: 'order_' + Date.now(),
        gatewayPaymentId: 'pay_' + Date.now(),
        gatewayStatus: 'captured'
      }
    });
    await onlinePayment.save();
    payments.push(onlinePayment);
    console.log('Created online payment (completed)');
    
    // 2. Cash payment (pending verification)
    const cashPayment = new Payment({
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: investment.planId,
      paymentType: 'cash',
      paymentMethod: 'cash',
      amount: 5000,
      emiNumber: 2,
      paymentFor: 'emi',
      status: 'pending',
      verificationStatus: 'pending',
      paymentDate: new Date(),
      remarks: 'Will pay at office tomorrow'
    });
    await cashPayment.save();
    payments.push(cashPayment);
    console.log('Created cash payment (pending verification)');
    
    // 3. Online payment (pending)
    const pendingOnlinePayment = new Payment({
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: investment.planId,
      paymentType: 'online',
      paymentMethod: 'net_banking',
      amount: 5000,
      emiNumber: 3,
      paymentFor: 'emi',
      status: 'pending',
      verificationStatus: 'pending',
      paymentDate: new Date(),
      transactionId: 'TXN' + Date.now() + '003'
    });
    await pendingOnlinePayment.save();
    payments.push(pendingOnlinePayment);
    console.log('Created online payment (pending)');
    
    // 4. Failed payment
    const failedPayment = new Payment({
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: investment.planId,
      paymentType: 'online',
      paymentMethod: 'credit_card',
      amount: 5000,
      emiNumber: 4,
      paymentFor: 'emi',
      status: 'failed',
      verificationStatus: 'rejected',
      paymentDate: new Date(),
      transactionId: 'TXN' + Date.now() + '004',
      remarks: 'Payment failed due to insufficient funds'
    });
    await failedPayment.save();
    payments.push(failedPayment);
    console.log('Created failed payment');
    
    // Update EMI records with payment references
    if (emiRecords[0]) {
      emiRecords[0].markAsPaid(5000, onlinePayment._id, new Date('2024-01-15'));
      await emiRecords[0].save();
    }
    
    if (emiRecords[1]) {
      emiRecords[1].markAsPaid(5000, cashPayment._id, new Date());
      await emiRecords[1].save();
    }
    
    console.log('\n=== Sample Data Created Successfully ===');
    console.log(`Member: ${member.firstName} ${member.lastName} (${member.memberId})`);
    console.log(`Investment: ${investment.investmentId} - ₹${investment.principalAmount}`);
    console.log(`EMI Records: ${emiRecords.length} (2 paid, 4 pending)`);
    console.log(`Payments: ${payments.length} (1 completed, 1 pending cash, 1 pending online, 1 failed)`);
    console.log('\nYou can now test the payment APIs with this data.');
    
  } catch (error) {
    console.error('Error creating sample payments:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createSamplePayments();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createSamplePayments };
