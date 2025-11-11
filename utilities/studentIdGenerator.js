const Student = require('../models/student.model');

/**
 * Generate a unique Student ID in the format: PETF000001
 * Sequential format starting from PETF000001
 * 
 * Example: PETF000001, PETF000002, PETF000003, etc.
 */
const generateStudentId = async () => {
  try {
    // Find the highest existing student ID
    const existingStudents = await Student.find({})
      .sort({ studentId: -1 })
      .limit(1);
    
    let nextNumber = 1;
    
    if (existingStudents.length > 0) {
      // Extract the number part from the last student ID
      const lastStudentId = existingStudents[0].studentId;
      
      // Check if it matches PETF format
      if (lastStudentId && lastStudentId.startsWith('PETF')) {
        const numberPart = lastStudentId.substring(4); // Get digits after "PETF"
        const lastNumber = parseInt(numberPart, 10);
        
        // If it's a valid number, increment it
        if (!isNaN(lastNumber) && lastNumber > 0) {
          nextNumber = lastNumber + 1;
        }
      }
    }
    
    // Format the number with leading zeros (6 digits total)
    const formattedNumber = String(nextNumber).padStart(6, '0');
    
    // Combine to create the final student ID
    const studentId = `PETF${formattedNumber}`;
    
    // Double-check uniqueness (safety measure)
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      // If somehow a duplicate exists, try again with incremented number
      return await generateStudentId();
    }
    
    return studentId;
    
  } catch (error) {
    console.error('Error generating student ID:', error);
    throw new Error('Failed to generate unique student ID');
  }
};

/**
 * Generate a sequential Student ID in the format: PETFYYYYMMXXX
 * Where:
 * - PETF: Fixed prefix for student IDs
 * - YYYY: Current year (e.g., 2025)
 * - MM: Current month (e.g., 11 for November)
 * - XXX: Sequential number starting from 001
 * 
 * Example: PETF202511001, PETF202511002, PETF202511003, etc.
 */
const generateSequentialStudentId = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    
    // Create the prefix (PETF + YYYYMM)
    const prefix = `PETF${year}${month}`;
    
    // Find the highest existing student ID with this prefix
    const existingStudents = await Student.find({
      studentId: { $regex: `^${prefix}` }
    }).sort({ studentId: -1 }).limit(1);
    
    let nextNumber = 1;
    
    if (existingStudents.length > 0) {
      // Extract the number part from the last student ID
      const lastStudentId = existingStudents[0].studentId;
      const lastNumber = parseInt(lastStudentId.substring(10), 10); // Get last 3 digits
      nextNumber = lastNumber + 1;
    }
    
    // Format the number with leading zeros (XXX)
    const formattedNumber = String(nextNumber).padStart(3, '0');
    
    // Combine to create the final student ID
    const studentId = `${prefix}${formattedNumber}`;
    
    // Double-check uniqueness (safety measure)
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      // If somehow a duplicate exists, try again with incremented number
      return await generateSequentialStudentId();
    }
    
    return studentId;
    
  } catch (error) {
    console.error('Error generating sequential student ID:', error);
    throw new Error('Failed to generate unique sequential student ID');
  }
};

/**
 * Validate student ID format
 * @param {string} studentId - The student ID to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
const validateStudentIdFormat = (studentId) => {
  // Check for sequential format: PETF + 6 digits (e.g., PETF000001)
  const pattern = /^PETF\d{6}$/;
  return pattern.test(studentId);
};

/**
 * Parse student ID to extract components
 * @param {string} studentId - The student ID
 * @returns {object} - Object with parsed components
 */
const parseStudentId = (studentId) => {
  if (!validateStudentIdFormat(studentId)) {
    throw new Error('Invalid student ID format');
  }
  
  // Extract the number part from PETF format (PETF + 6 digits)
  const pattern = /^PETF(\d{6})$/;
  const match = studentId.match(pattern);
  
  if (match) {
    return {
      type: 'sequential',
      prefix: 'PETF',
      sequence: parseInt(match[1], 10)
    };
  }
  
  throw new Error('Unable to parse student ID');
};

/**
 * Get student ID statistics
 * @returns {object} - Statistics about student IDs
 */
const getStudentIdStats = async () => {
  try {
    const totalStudents = await Student.countDocuments();
    
    // Count students with PETF format (PETF + 6 digits)
    const petfFormatCount = await Student.countDocuments({
      studentId: { $regex: /^PETF\d{6}$/ }
    });
    
    // Get latest student ID
    const latestStudent = await Student.findOne().sort({ createdAt: -1 });
    
    return {
      totalStudents,
      petfFormatCount: petfFormatCount,
      latestStudentId: latestStudent ? latestStudent.studentId : null,
      latestStudentName: latestStudent ? `${latestStudent.firstName} ${latestStudent.lastName}` : null
    };
    
  } catch (error) {
    console.error('Error getting student ID stats:', error);
    throw new Error('Failed to get student ID statistics');
  }
};

module.exports = {
  generateStudentId,
  generateSequentialStudentId,
  validateStudentIdFormat,
  parseStudentId,
  getStudentIdStats
};
