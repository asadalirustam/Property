const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFavorite,
  getMyListings,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProperties);
router.get('/my-listings', protect, authorize('agent', 'admin'), getMyListings);
router.get('/:id', getProperty);

router.post(
  '/',
  protect,
  authorize('agent', 'admin'),
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 2 },
    { name: 'documents', maxCount: 5 },
    { name: 'floorPlans', maxCount: 5 },
  ]),
  createProperty
);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 2 },
    { name: 'documents', maxCount: 5 },
    { name: 'floorPlans', maxCount: 5 },
  ]),
  updateProperty
);

router.delete('/:id', protect, deleteProperty);
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
