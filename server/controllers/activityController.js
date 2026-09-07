const Activity = require('../models/Activity');
const Board = require('../models/Board');
const { isDbConnected } = require('../utils/dbUtils');
const db = require('../data/memoryStore');

exports.getBoardActivity = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    let boardExists = false;
    if (isDbConnected()) {
      const board = await Board.findById(boardId);
      if (board) boardExists = true;
    } else {
      const board = db.boards.find(b => b.id === boardId);
      if (board) boardExists = true;
    }

    if (!boardExists) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    let activities = [];
    if (isDbConnected()) {
      activities = await Activity.find({ boardId }).sort({ createdAt: -1 }).lean();
    } else {
      activities = db.activities.filter(a => a.boardId === boardId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json(
      activities.map((activity) => ({
        ...activity,
        id: activity._id ? activity._id.toString() : activity.id,
        userId: activity.userId ? activity.userId.toString() : null,
        boardId: activity.boardId ? activity.boardId.toString() : null,
        taskId: activity.taskId ? activity.taskId.toString() : null,
      })),
    );
  } catch (error) {
    next(error);
  }
};
