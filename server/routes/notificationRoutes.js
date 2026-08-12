const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { bypassAuth } = require('../middleware/authMiddleware');

router.use(bypassAuth);

router.get('/', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markNotificationRead);

module.exports = router;
