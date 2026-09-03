const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Team = require('../models/Team');
const db = require('../data/memoryStore');

const buildBoardResponse = async (boardId) => {
  try {
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
  } catch (dbError) {
    console.log('Database query failed, falling back to memory store');
    return null;
  }
};

// Helper to get board from memory store
const getBoardFromMemory = (boardId) => {
  const board = db.boards.find(b => b.id === boardId);
  if (!board) return null;

  const columns = db.columns.filter(c => c.boardId === boardId);
  const columnsWithTasks = columns.map(column => ({
    ...column,
    tasks: db.tasks.filter(t => t.columnId === column.id),
  }));

  return {
    ...board,
    columns: columnsWithTasks,
  };
};

exports.getAllBoards = async (req, res, next) => {
  try {
    // Try to get from database first
    try {
      const userTeams = await Team.find({ 'members.userId': req.user.id }).select('_id');
      const teamIds = userTeams.map((team) => team._id);

      const boards = await Board.find({
        $or: [{ teamId: null }, { teamId: { $in: teamIds } }],
      }).sort({ createdAt: -1 }).lean();

      return res.status(200).json(
        boards.map((board) => ({
          ...board,
          id: board._id.toString(),
          teamId: board.teamId ? board.teamId.toString() : null,
          createdBy: board.createdBy ? board.createdBy.toString() : null,
        })),
      );
    } catch (dbError) {
      console.log('Database query failed, using memory store for boards');
      // Fall back to memory store
      const boards = db.boards.map(board => ({
        ...board,
        // Get column and task count for display
        columnCount: db.columns.filter(c => c.boardId === board.id).length,
        taskCount: db.tasks.filter(t => t.boardId === board.id).length,
      }));

      return res.status(200).json(boards);
    }
  } catch (error) {
    next(error);
  }
};

exports.getBoardById = async (req, res, next) => {
  try {
    // Try database first
    try {
      const board = await Board.findById(req.params.id).lean();
      if (board) {
        const boardResponse = await buildBoardResponse(board._id);
        if (boardResponse) {
          return res.status(200).json(boardResponse);
        }
      }
    } catch (dbError) {
      console.log('Database query failed for board, trying memory store');
    }

    // Fall back to memory store
    const board = getBoardFromMemory(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.status(200).json(board);
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
