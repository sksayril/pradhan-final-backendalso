const SocietyMember = require('../models/societyMember.model');

/**
 * Generate a unique Member ID in the format: 000000001
 * Sequential format starting from 000000001
 * 
 * Example: 000000001, 000000002, 000000003, etc.
 */
const generateMemberId = async () => {
  try {
    // Find the highest existing member ID
    const existingMembers = await SocietyMember.find({})
      .sort({ memberId: -1 })
      .limit(1);
    
    let nextNumber = 1;
    
    if (existingMembers.length > 0) {
      // Extract the number part from the last member ID
      const lastMemberId = existingMembers[0].memberId;
      const lastNumber = parseInt(lastMemberId, 10);
      
      // If it's a valid number, increment it
      if (!isNaN(lastNumber) && lastNumber > 0) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format the number with leading zeros (9 digits total)
    const memberId = String(nextNumber).padStart(9, '0');
    
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
  const pattern = /^\d{9}$/; // 9 digits format: 000000001
  return pattern.test(memberId);
};

/**
 * Parse member ID to get the sequence number
 * @param {string} memberId - The member ID
 * @returns {object} - Object with sequence number
 */
const parseMemberId = (memberId) => {
  if (!validateMemberIdFormat(memberId)) {
    throw new Error('Invalid member ID format');
  }
  
  const sequence = parseInt(memberId, 10);
  
  return { sequence };
};

module.exports = {
  generateMemberId,
  validateMemberIdFormat,
  parseMemberId
};
