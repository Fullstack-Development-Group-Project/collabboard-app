const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardsController');
const { bypassAuth } = require('../middleware/authMiddleware');

router.use(bypassAuth); // Protect all board routes

router.get('/', boardsController.getAllBoards);
router.post('/', boardsController.createBoard);
router.get('/:id', boardsController.getBoardById);

module.exports = router;
