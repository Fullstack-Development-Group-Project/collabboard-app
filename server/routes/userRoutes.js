const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { bypassAuth } = require('../middleware/authMiddleware');

router.use(bypassAuth);

router.get('/me', usersController.getUserProfile);
router.put('/me', usersController.updateUserProfile);

module.exports = router;
