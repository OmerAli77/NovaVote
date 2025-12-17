/**
 * API endpoint to check admin access status
 */
const express = require('express');
const router = express.Router();
const { checkAdminAccess } = require('../middleware/adminAccess');

/**
 * Check if current user has admin access
 * Returns isAdmin flag based on IP address
 */
router.get('/check', checkAdminAccess, (req, res) => {
  res.json({
    isAdmin: req.isAdmin,
    message: req.isAdmin 
      ? 'Admin access granted (localhost)' 
      : 'Regular user access (remote device)'
  });
});

module.exports = router;
