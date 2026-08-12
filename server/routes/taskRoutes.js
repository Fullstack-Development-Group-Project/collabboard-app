const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Global tasks (e.g. assigned to me)
router.get('/assigned', tasksController.getAssignedTasks);

// Direct task operations
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
