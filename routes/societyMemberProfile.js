const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMemberProfile } = require('../controllers/societyMemberProfileController');

// Get society member profile
router.get('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  getMemberProfile
);

module.exports = router;
