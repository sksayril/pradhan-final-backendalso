const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    success: true,
    message: 'Users endpoint - Use specific user type endpoints for authentication',
    availableEndpoints: {
      admin: '/api/admin',
      student: '/api/student',
      societyMember: '/api/society-member'
    }
  });
});

module.exports = router;
