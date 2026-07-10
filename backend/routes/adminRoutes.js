const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  updateListingApproval,
  getSystemSettings,
  updateSystemSettings,
  getContactInquiries,
  submitContactInquiry,
  subscribeNewsletter,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/settings', getSystemSettings);
router.post('/inquiries', submitContactInquiry);
router.post('/newsletter', subscribeNewsletter);

// Protected Admin paths
router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.put('/properties/:id/approve', protect, authorize('admin'), updateListingApproval);
router.put('/settings', protect, authorize('admin'), updateSystemSettings);
router.get('/inquiries', protect, authorize('admin'), getContactInquiries);

module.exports = router;
