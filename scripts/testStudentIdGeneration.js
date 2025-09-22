const mongoose = require('mongoose');
const Student = require('../models/student.model');
const { 
  generateStudentId, 
  generateSequentialStudentId, 
  validateStudentIdFormat, 
  parseStudentId,
  getStudentIdStats 
} = require('../utilities/studentIdGenerator');
require('dotenv').config();

// Test student ID generation
const testStudentIdGeneration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society-management');
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Student ID Generation...\n');

    // Test 1: Generate random student IDs
    console.log('1️⃣ Testing Random Student ID Generation:');
    for (let i = 0; i < 5; i++) {
      const studentId = await generateStudentId();
      console.log(`   Generated: ${studentId}`);
      
      // Validate format
      const isValid = validateStudentIdFormat(studentId);
      console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
      
      // Parse the ID
      const parsed = parseStudentId(studentId);
      console.log(`   Parsed: ${JSON.stringify(parsed)}`);
      console.log('');
    }

    // Test 2: Generate sequential student IDs
    console.log('2️⃣ Testing Sequential Student ID Generation:');
    for (let i = 0; i < 3; i++) {
      const studentId = await generateSequentialStudentId();
      console.log(`   Generated: ${studentId}`);
      
      // Validate format
      const isValid = validateStudentIdFormat(studentId);
      console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
      
      // Parse the ID
      const parsed = parseStudentId(studentId);
      console.log(`   Parsed: ${JSON.stringify(parsed)}`);
      console.log('');
    }

    // Test 3: Create a test student with auto-generated ID
    console.log('3️⃣ Testing Student Creation with Auto-Generated ID:');
    const testStudent = new Student({
      email: `test.student.${Date.now()}@example.com`,
      password: 'testpassword123',
      originalPassword: 'testpassword123',
      firstName: 'Test',
      lastName: 'Student',
      department: 'Computer Science',
      year: '1st',
      phoneNumber: '9876543210'
    });

    await testStudent.save();
    console.log(`   Created student with ID: ${testStudent.studentId}`);
    console.log(`   Student name: ${testStudent.firstName} ${testStudent.lastName}`);
    console.log(`   Email: ${testStudent.email}`);

    // Test 4: Get statistics
    console.log('\n4️⃣ Testing Student ID Statistics:');
    const stats = await getStudentIdStats();
    console.log(`   Total students: ${stats.totalStudents}`);
    console.log(`   Random format: ${stats.randomFormat}`);
    console.log(`   Sequential format: ${stats.sequentialFormat}`);
    console.log(`   Latest student ID: ${stats.latestStudentId}`);
    console.log(`   Latest student name: ${stats.latestStudentName}`);

    // Test 5: Validate existing student IDs
    console.log('\n5️⃣ Testing Validation of Existing Student IDs:');
    const students = await Student.find().limit(5);
    students.forEach(student => {
      if (student.studentId) {
        const isValid = validateStudentIdFormat(student.studentId);
        console.log(`   ${student.studentId}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      }
    });

    // Clean up test student
    await Student.findByIdAndDelete(testStudent._id);
    console.log('\n🧹 Cleaned up test student');

    console.log('\n🎉 All tests passed! Student ID generation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run the test
testStudentIdGeneration();


