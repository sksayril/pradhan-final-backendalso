const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Payment = require('../models/payment.model');
const SocietyMember = require('../models/societyMember.model');

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

// Test payment lookup
const testPaymentLookup = async () => {
  try {
    // Find a member
    const member = await SocietyMember.findOne();
    if (!member) {
      console.log('No member found.');
      return;
    }
    
    console.log(`Testing payment lookup for member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    
    // Find payments for this member
    const payments = await Payment.find({
      memberId: new mongoose.Types.ObjectId(member._id.toString())
    }).populate('investmentId', 'investmentId principalAmount')
      .populate('planId', 'planName planType interestRate')
      .populate('verifiedBy', 'firstName lastName');
    
    console.log(`\nFound ${payments.length} payments for this member:`);
    
    payments.forEach((payment, index) => {
      console.log(`\nPayment ${index + 1}:`);
      console.log(`  Payment ID: ${payment.paymentId}`);
      console.log(`  Amount: ₹${payment.amount}`);
      console.log(`  Type: ${payment.paymentType}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Verification Status: ${payment.verificationStatus}`);
      console.log(`  Member ID: ${payment.memberId}`);
      console.log(`  Member ID Type: ${typeof payment.memberId}`);
      console.log(`  Member ID String: ${payment.memberId.toString()}`);
      console.log(`  Requested Member ID: ${member._id.toString()}`);
      console.log(`  Match: ${payment.memberId.toString() === member._id.toString()}`);
    });
    
    // Test the specific lookup that was failing
    if (payments.length > 0) {
      const testPayment = payments[0];
      console.log(`\n=== Testing Specific Payment Lookup ===`);
      console.log(`Looking for payment: ${testPayment.paymentId}`);
      console.log(`With member ID: ${member._id.toString()}`);
      
      const foundPayment = await Payment.findOne({
        paymentId: testPayment.paymentId,
        memberId: new mongoose.Types.ObjectId(member._id.toString())
      });
      
      if (foundPayment) {
        console.log('✅ Payment found successfully!');
        console.log(`Payment details: ${foundPayment.paymentId} - ₹${foundPayment.amount} - ${foundPayment.status}`);
      } else {
        console.log('❌ Payment not found - this would cause the "Payment not found or access denied" error');
      }
    }
    
  } catch (error) {
    console.error('Error testing payment lookup:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testPaymentLookup();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPaymentLookup };
