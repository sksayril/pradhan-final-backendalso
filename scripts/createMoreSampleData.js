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

// Create more sample data
const createMoreSampleData = async () => {
  try {
    // Find the existing member
    const member = await SocietyMember.findOne();
    if (!member) {
      console.log('No member found. Please run createSimpleSampleData.js first.');
      return;
    }
    
    console.log(`Adding more data for member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    
    const memberId = member._id.toString();
    
    // Find the existing investment
    const investment = await Investment.findOne({ memberId: new mongoose.Types.ObjectId(memberId) });
    if (!investment) {
      console.log('No investment found. Please run createSimpleSampleData.js first.');
      return;
    }
    
    // Find the existing plan
    const plan = await InvestmentPlan.findById(investment.planId);
    if (!plan) {
      console.log('No plan found. Please run createSimpleSampleData.js first.');
      return;
    }
    
    // Create more EMI records
    const emiRecords = [];
    for (let i = 2; i <= 6; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      
      const gracePeriodEndDate = new Date(dueDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);
      
      const emiRecord = new EMIRecord({
        emiId: 'EMI' + Date.now().toString().slice(-8) + i,
        investmentId: investment._id,
        memberId: new mongoose.Types.ObjectId(memberId),
        planId: plan._id,
        emiNumber: i,
        emiAmount: 5000,
        dueDate: dueDate,
        gracePeriodEndDate: gracePeriodEndDate,
        status: i <= 3 ? 'paid' : 'pending', // First 3 EMIs paid, rest pending
        calculationDetails: {
          principalComponent: 5000,
          interestComponent: 0,
          remainingPrincipal: 50000 - (i * 5000),
          cumulativeInterest: 0
        },
        createdBy: new mongoose.Types.ObjectId(memberId)
      });
      
      await emiRecord.save();
      emiRecords.push(emiRecord);
      console.log(`Created EMI record #${i} - Status: ${emiRecord.status}`);
    }
    
    // Create more payments
    const payments = [];
    
    // 1. Online payment (completed)
    const onlinePayment = new Payment({
      paymentId: 'PAY' + Date.now().toString().slice(-8) + '001',
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      paymentType: 'online',
      paymentMethod: 'upi',
      amount: 5000,
      emiNumber: 2,
      paymentFor: 'emi',
      status: 'completed',
      verificationStatus: 'verified',
      paymentDate: new Date('2024-02-15'),
      processedDate: new Date('2024-02-15'),
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
      paymentId: 'PAY' + Date.now().toString().slice(-8) + '002',
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      paymentType: 'cash',
      paymentMethod: 'cash',
      amount: 5000,
      emiNumber: 3,
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
      paymentId: 'PAY' + Date.now().toString().slice(-8) + '003',
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      paymentType: 'online',
      paymentMethod: 'net_banking',
      amount: 5000,
      emiNumber: 4,
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
      paymentId: 'PAY' + Date.now().toString().slice(-8) + '004',
      investmentId: investment._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      planId: plan._id,
      paymentType: 'online',
      paymentMethod: 'credit_card',
      amount: 5000,
      emiNumber: 5,
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
    if (emiRecords[0]) { // EMI #2
      emiRecords[0].markAsPaid(5000, onlinePayment._id, new Date('2024-02-15'));
      await emiRecords[0].save();
    }
    
    if (emiRecords[1]) { // EMI #3
      emiRecords[1].markAsPaid(5000, cashPayment._id, new Date());
      await emiRecords[1].save();
    }
    
    console.log('\n=== Additional Sample Data Created Successfully ===');
    console.log(`Member: ${member.firstName} ${member.lastName} (${member.memberId})`);
    console.log(`Investment: ${investment.investmentId} - ₹${investment.principalAmount}`);
    console.log(`EMI Records: ${emiRecords.length} additional (3 paid, 3 pending)`);
    console.log(`Payments: ${payments.length} (1 completed, 1 pending cash, 1 pending online, 1 failed)`);
    console.log('\nYou can now test the payment APIs with this comprehensive data.');
    
  } catch (error) {
    console.error('Error creating additional sample data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createMoreSampleData();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMoreSampleData };
