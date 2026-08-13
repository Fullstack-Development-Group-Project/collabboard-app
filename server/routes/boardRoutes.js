const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardsController');
const columnsController = require('../controllers/columnsController');
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all board routes

router.get('/', boardsController.getAllBoards);
router.post('/', boardsController.createBoard);
router.get('/:id', boardsController.getBoardById);

router.get('/:boardId/columns', columnsController.getBoardColumnsList);
router.post('/:boardId/columns', columnsController.createBoardColumn);
router.put('/:boardId/columns/:columnId', columnsController.updateBoardColumn);
router.delete('/:boardId/columns/:columnId', columnsController.deleteBoardColumn);

// Create task inside a board
router.post('/:boardId/tasks', tasksController.createTask);

module.exports = router;
