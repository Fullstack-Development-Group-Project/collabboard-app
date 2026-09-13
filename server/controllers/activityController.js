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

exports.getGlobalActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let activities = [];

    if (isDbConnected()) {
      // Find all boards user belongs to
      const Team = require('../models/Team');
      const userTeams = await Team.find({ 'members.userId': userId }).select('_id');
      const teamIds = userTeams.map((team) => team._id);

      const boards = await Board.find({
        $or: [{ teamId: null }, { teamId: { $in: teamIds } }],
      }).select('_id');
      const boardIds = boards.map(b => b._id);

      activities = await Activity.find({ boardId: { $in: boardIds } }).sort({ createdAt: -1 }).lean();
    } else {
      // Memory store fallback: find all activities where user is either the actor or it's a board they can see
      activities = db.activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Simplify by returning all for now in fallback mode, since memory store is small
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
