const express = require('express');
const router = express.Router({ mergeParams: true });
const activityController = require('../controllers/activityController');
const { bypassAuth } = require('../middleware/authMiddleware');

router.use(bypassAuth);

// Normally mounted at /api/v1/boards/:id/activities
router.get('/', activityController.getBoardActivity);

module.exports = router;
