const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markNotificationRead);

module.exports = router;
