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
      const team = await Team.findOne({ _id: { $eq: teamId }, 'members.userId': req.user.id }).lean();
      if (!team) {
        return res.status(403).json({ message: 'You do not have access to that team' });
      }
    }

    try {
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
      return res.status(201).json(boardResponse);
    } catch (dbError) {
      console.log('Database error in createBoard, falling back to memory store:', dbError.message);
      const newBoardId = 'board_' + Date.now();
      const newBoard = {
        id: newBoardId,
        title: trimmedTitle,
        description: req.body.description || 'Custom board created in workspace',
        teamId: teamId || null,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.boards.push(newBoard);

      const defaultCols = ['To Do', 'Doing', 'Done'].map((colTitle, idx) => {
        const col = {
          id: 'col_' + Date.now() + '_' + idx,
          boardId: newBoardId,
          title: colTitle,
          position: idx
        };
        db.columns.push(col);
        return { ...col, tasks: [] };
      });

      return res.status(201).json({
        ...newBoard,
        columns: defaultCols
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
      const board = await Board.findById(id);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (title !== undefined) board.title = title.trim();
      if (description !== undefined) board.description = description;
      await board.save();

      const boardResponse = await buildBoardResponse(board._id);
      return res.status(200).json(boardResponse);
    } catch (dbError) {
      console.log('Database error in updateBoard, using memory store');
      const board = db.boards.find(b => b.id === id);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
      if (title !== undefined) board.title = title.trim();
      if (description !== undefined) board.description = description;
      board.updatedAt = new Date().toISOString();
      return res.status(200).json(getBoardFromMemory(id) || board);
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      await Board.findByIdAndDelete(id);
      await Column.deleteMany({ boardId: id });
      await Task.deleteMany({ boardId: id });
      return res.status(204).send();
    } catch (dbError) {
      console.log('Database error in deleteBoard, using memory store');
      const idx = db.boards.findIndex(b => b.id === id);
      if (idx !== -1) {
        db.boards.splice(idx, 1);
        db.columns = db.columns.filter(c => c.boardId !== id);
        db.tasks = db.tasks.filter(t => t.boardId !== id);
      }
      return res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
};

