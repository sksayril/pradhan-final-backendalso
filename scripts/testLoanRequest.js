const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const LoanRequest = require('../models/loanRequest.model');
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

// Test loan request creation
const testLoanRequest = async () => {
  try {
    // Find a member
    const member = await SocietyMember.findOne();
    if (!member) {
      console.log('No member found. Please create a member first.');
      return;
    }
    
    console.log(`Testing loan request creation for member: ${member.firstName} ${member.lastName} (ID: ${member._id})`);
    
    // Create a test loan request
    const loanRequest = new LoanRequest({
      memberId: member._id,
      loanAmount: 50000,
      loanPurpose: 'Personal',
      loanDescription: 'Test loan request for medical expenses',
      emiOptions: {
        tenureMonths: 12,
        emiAmount: 4500,
        interestRate: 12.5
      },
      createdBy: member._id
    });
    
    console.log('Saving loan request...');
    await loanRequest.save();
    
    console.log('✅ Loan request created successfully!');
    console.log(`Request ID: ${loanRequest.requestId}`);
    console.log(`Loan Amount: ₹${loanRequest.loanAmount}`);
    console.log(`Status: ${loanRequest.status}`);
    console.log(`Created At: ${loanRequest.createdAt}`);
    
  } catch (error) {
    console.error('❌ Error creating loan request:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testLoanRequest();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLoanRequest };
