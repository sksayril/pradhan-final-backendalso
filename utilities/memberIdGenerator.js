const SocietyMember = require('../models/societyMember.model');

/**
 * Generate a unique Member ID in the format: YYYYMMXXX
 * Where:
 * - YYYY: Current year (e.g., 2025)
 * - MM: Current month (e.g., 11 for November)
 * - XXX: Sequential number starting from 001
 * 
 * Example: 202511001, 202511002, 202511003, etc.
 */
const generateMemberId = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    
    // Create the prefix (YYYYMM)
    const prefix = `${year}${month}`;
    
    // Find the highest existing member ID with this prefix
    const existingMembers = await SocietyMember.find({
      memberId: { $regex: `^${prefix}` }
    }).sort({ memberId: -1 }).limit(1);
    
    let nextNumber = 1;
    
    if (existingMembers.length > 0) {
      // Extract the number part from the last member ID
      const lastMemberId = existingMembers[0].memberId;
      const lastNumber = parseInt(lastMemberId.substring(6), 10); // Get last 3 digits
      nextNumber = lastNumber + 1;
    }
    
    // Format the number with leading zeros (XXX)
    const formattedNumber = String(nextNumber).padStart(3, '0');
    
    // Combine to create the final member ID
    const memberId = `${prefix}${formattedNumber}`;
    
    // Double-check uniqueness (safety measure)
    const existingMember = await SocietyMember.findOne({ memberId });
    if (existingMember) {
      // If somehow a duplicate exists, try again with incremented number
      return await generateMemberId();
    }
    
    return memberId;
    
  } catch (error) {
    console.error('Error generating member ID:', error);
    throw new Error('Failed to generate unique member ID');
  }
};

/**
 * Validate member ID format
 * @param {string} memberId - The member ID to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
const validateMemberIdFormat = (memberId) => {
  const pattern = /^\d{4}\d{2}\d{3}$/; // YYYYMMXXX format
  return pattern.test(memberId);
};

/**
 * Extract year and month from member ID
 * @param {string} memberId - The member ID
 * @returns {object} - Object with year and month
 */
const parseMemberId = (memberId) => {
  if (!validateMemberIdFormat(memberId)) {
    throw new Error('Invalid member ID format');
  }
  
  const year = parseInt(memberId.substring(0, 4), 10);
  const month = parseInt(memberId.substring(4, 6), 10);
  const sequence = parseInt(memberId.substring(6, 9), 10);
  
  return { year, month, sequence };
};

module.exports = {
  generateMemberId,
  validateMemberIdFormat,
  parseMemberId
};
