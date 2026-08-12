const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { bypassAuth } = require('../middleware/authMiddleware');

router.use(bypassAuth);

// Global tasks (e.g. assigned to me)
router.get('/assigned', tasksController.getAssignedTasks);

// Board-specific tasks are usually mounted at /api/v1/boards/:boardId/tasks 
// but can be handled here if we configure router with mergeParams
router.post('/boards/:boardId', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
