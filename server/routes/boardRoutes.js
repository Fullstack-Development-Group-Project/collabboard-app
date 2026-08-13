const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardsController');
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all board routes

router.get('/', boardsController.getAllBoards);
router.post('/', boardsController.createBoard);
router.get('/:id', boardsController.getBoardById);

// Create task inside a board
router.post('/:boardId/tasks', tasksController.createTask);

module.exports = router;
