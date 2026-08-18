const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Team = require('../models/Team');

const buildBoardResponse = async (boardId) => {
  const board = await Board.findById(boardId).lean();
  if (!board) return null;

  const columns = await Column.find({ boardId: board._id }).sort({ position: 1 }).lean();
  const columnIds = columns.map((column) => column._id);
  const tasks = await Task.find({ columnId: { $in: columnIds } }).lean();

  const columnsWithTasks = columns.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => String(task.columnId) === String(column._id)),
  }));

  return {
    ...board,
    id: board._id.toString(),
    teamId: board.teamId ? board.teamId.toString() : null,
    createdBy: board.createdBy ? board.createdBy.toString() : null,
    columns: columnsWithTasks,
  };
};

exports.getAllBoards = async (req, res, next) => {
  try {
    const userTeams = await Team.find({ 'members.userId': req.user.id }).select('_id');
    const teamIds = userTeams.map((team) => team._id);

    const boards = await Board.find({
      $or: [{ teamId: null }, { teamId: { $in: teamIds } }],
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json(
      boards.map((board) => ({
        ...board,
        id: board._id.toString(),
        teamId: board.teamId ? board.teamId.toString() : null,
        createdBy: board.createdBy ? board.createdBy.toString() : null,
      })),
    );
  } catch (error) {
    next(error);
  }
};

exports.getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id).lean();
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const boardResponse = await buildBoardResponse(board._id);
    res.status(200).json(boardResponse);
  } catch (error) {
    next(error);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { title, teamId } = req.body;
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    if (teamId) {
      const team = await Team.findOne({ _id: teamId, 'members.userId': req.user.id }).lean();
      if (!team) {
        return res.status(403).json({ message: 'You do not have access to that team' });
      }
    }

    const board = await Board.create({
      title: trimmedTitle,
      teamId: teamId || null,
      createdBy: req.user.id,
      isPersonal: !teamId,
    });

    const defaultColumns = ['To Do', 'Doing', 'Done'].map((columnTitle, index) => ({
      boardId: board._id,
      title: columnTitle,
      position: index,
    }));

    const createdColumns = await Column.insertMany(defaultColumns);
    await Board.findByIdAndUpdate(board._id, {
      $set: { columns: createdColumns.map((column) => column._id) },
    });

    const boardResponse = await buildBoardResponse(board._id);
    res.status(201).json(boardResponse);
  } catch (error) {
    next(error);
  }
};
