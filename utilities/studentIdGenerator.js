const Student = require('../models/student.model');

/**
 * Generate a unique Student ID in the format: PETFXXXXXX
 * Where:
 * - PETF: Fixed prefix for student IDs
 * - XXXXXX: 6-digit random number (100000-999999)
 * 
 * Example: PETF123456, PETF789012, PETF345678, etc.
 */
const generateStudentId = async () => {
  try {
    let studentId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (!isUnique && attempts < maxAttempts) {
      // Generate student ID: PETF + 6 random digits
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      studentId = `PETF${randomDigits}`;
      
      // Check if this ID already exists
      const existingStudent = await Student.findOne({ studentId });
      if (!existingStudent) {
        isUnique = true;
      }
      
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error('Unable to generate unique student ID after maximum attempts');
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
  // Check for random format: PETF + 6 digits
  const randomPattern = /^PETF\d{6}$/;
  
  // Check for sequential format: PETF + YYYY + MM + XXX
  const sequentialPattern = /^PETF\d{4}\d{2}\d{3}$/;
  
  return randomPattern.test(studentId) || sequentialPattern.test(studentId);
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
  
  // Check if it's random format (PETF + 6 digits)
  const randomPattern = /^PETF(\d{6})$/;
  const randomMatch = studentId.match(randomPattern);
  
  if (randomMatch) {
    return {
      type: 'random',
      prefix: 'PETF',
      randomDigits: randomMatch[1]
    };
  }
  
  // Check if it's sequential format (PETF + YYYY + MM + XXX)
  const sequentialPattern = /^PETF(\d{4})(\d{2})(\d{3})$/;
  const sequentialMatch = studentId.match(sequentialPattern);
  
  if (sequentialMatch) {
    return {
      type: 'sequential',
      prefix: 'PETF',
      year: parseInt(sequentialMatch[1], 10),
      month: parseInt(sequentialMatch[2], 10),
      sequence: parseInt(sequentialMatch[3], 10)
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
    
    // Count by type
    const randomCount = await Student.countDocuments({
      studentId: { $regex: /^PETF\d{6}$/ }
    });
    
    const sequentialCount = await Student.countDocuments({
      studentId: { $regex: /^PETF\d{4}\d{2}\d{3}$/ }
    });
    
    // Get latest student ID
    const latestStudent = await Student.findOne().sort({ createdAt: -1 });
    
    return {
      totalStudents,
      randomFormat: randomCount,
      sequentialFormat: sequentialCount,
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
