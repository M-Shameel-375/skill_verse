// ============================================
// DISPUTE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createDispute,
  getMyDisputes,
  getDisputeById,
  addDisputeMessage,
  getAllDisputes,
  getDisputeStatistics,
  updateDisputeStatus,
  assignDispute,
  resolveDispute,
  addAdminNote,
  addInternalMessage,
} = require('../controllers/dispute.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/roleCheck.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// ============================================
// USER ROUTES (Protected)
// ============================================
router.use(protect);

// Create a new dispute
router.post('/', createDispute);

// Get my disputes
router.get('/my', getMyDisputes);

// Get dispute by ID
router.get('/:id', validateMongoId('id'), validate, getDisputeById);

// Add message to dispute
router.post('/:id/messages', validateMongoId('id'), validate, addDisputeMessage);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all disputes (Admin)
router.get('/admin/all', isAdmin, getAllDisputes);

// Get dispute statistics (Admin)
router.get('/admin/statistics', isAdmin, getDisputeStatistics);

// Update dispute status (Admin)
router.put('/:id/status', isAdmin, validateMongoId('id'), validate, updateDisputeStatus);

// Assign dispute to admin
router.put('/:id/assign', isAdmin, validateMongoId('id'), validate, assignDispute);

// Resolve dispute (Admin)
router.put('/:id/resolve', isAdmin, validateMongoId('id'), validate, resolveDispute);

// Add admin note (Admin)
router.post('/:id/notes', isAdmin, validateMongoId('id'), validate, addAdminNote);

// Add internal message (Admin)
router.post('/:id/internal-message', isAdmin, validateMongoId('id'), validate, addInternalMessage);

module.exports = router;
