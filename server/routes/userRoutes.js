const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/me', usersController.getUserProfile);
router.put('/me', usersController.updateUserProfile);

module.exports = router;
