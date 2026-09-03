const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const db = require('../data/memoryStore');

const getBoardColumns = async (boardId) => {
  try {
    const columns = await Column.find({ boardId }).sort({ position: 1 }).lean();
    const columnIds = columns.map((column) => column._id);
    const tasks = await Task.find({ columnId: { $in: columnIds } }).lean();

    return columns.map((column) => ({
      ...column,
      id: column._id.toString(),
      boardId: column.boardId.toString(),
      tasks: tasks.filter((task) => String(task.columnId) === String(column._id)),
    }));
  } catch (error) {
    console.log('Database query failed, falling back to memory store');
    return null;
  }
};

// Get columns from memory store
const getBoardColumnsFromMemory = (boardId) => {
  const columns = db.columns.filter(c => c.boardId === boardId);
  return columns.map((column) => ({
    ...column,
    tasks: db.tasks.filter((task) => task.columnId === column.id),
  }));
};

exports.getBoardColumnsList = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    // Try database first
    try {
      const board = await Board.findById(boardId);
      if (board) {
        const columns = await getBoardColumns(boardId);
        if (columns) {
          return res.status(200).json(columns);
        }
      }
    } catch (dbError) {
      console.log('Database query failed for columns');
    }

    // Fall back to memory store
    const board = db.boards.find(b => b.id === boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const columns = getBoardColumnsFromMemory(boardId);
    res.status(200).json(columns);
  } catch (error) {
    next(error);
  }
};

exports.createBoardColumn = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    // Try database first
    try {
      const board = await Board.findById(boardId);
      if (board) {
        const nextPosition = (board.columns?.length || 0);
        const newColumn = await Column.create({
          boardId,
          title: trimmedTitle,
          position: nextPosition,
        });

        board.columns.push(newColumn._id);
        await board.save();

        return res.status(201).json({
          id: newColumn._id.toString(),
          boardId: newColumn.boardId.toString(),
          title: newColumn.title,
          position: newColumn.position,
          tasks: [],
        });
      }
    } catch (dbError) {
      console.log('Database operation failed, using memory store');
    }

    // Fall back to memory store
    const board = db.boards.find(b => b.id === boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const nextPosition = db.columns.filter(c => c.boardId === boardId).length;
    const newColumn = {
      id: `col${db.columns.length + 1}`,
      boardId,
      title: trimmedTitle,
      position: nextPosition,
    };

    db.columns.push(newColumn);

    res.status(201).json({
      ...newColumn,
      tasks: [],
    });
  } catch (error) {
    next(error);
  }
};

const { isDbConnected, persistMemoryStore } = require('../utils/dbUtils');

exports.updateBoardColumn = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    const { title } = req.body;
    
    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    if (isDbConnected()) {
      const board = await Board.findById(boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const column = await Column.findOne({ _id: columnId, boardId });
      if (!column) return res.status(404).json({ message: 'Column not found' });

      column.title = trimmedTitle;
      await column.save();

      const tasks = await Task.find({ boardId, columnId: column._id }).lean();
      return res.status(200).json({
        id: column._id.toString(),
        boardId: column.boardId.toString(),
        title: column.title,
        position: column.position,
        tasks,
      });
    } else {
      // Memory Store Fallback
      const board = db.boards.find(b => b.id === boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const column = db.columns.find(c => c.id === columnId && c.boardId === boardId);
      if (!column) return res.status(404).json({ message: 'Column not found' });

      column.title = trimmedTitle;
      persistMemoryStore();

      const tasks = db.tasks.filter(t => t.columnId === columnId);
      return res.status(200).json({
        ...column,
        tasks,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteBoardColumn = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;

    if (isDbConnected()) {
      const board = await Board.findById(boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const column = await Column.findOne({ _id: columnId, boardId });
      if (!column) return res.status(404).json({ message: 'Column not found' });

      board.columns = board.columns.filter((id) => String(id) !== String(column._id));
      await board.save();
      await Task.deleteMany({ boardId, columnId: column._id });
      await Column.findByIdAndDelete(column._id);

      return res.status(204).send();
    } else {
      // Memory Store Fallback
      const board = db.boards.find(b => b.id === boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const columnIndex = db.columns.findIndex(c => c.id === columnId && c.boardId === boardId);
      if (columnIndex === -1) return res.status(404).json({ message: 'Column not found' });

      db.columns.splice(columnIndex, 1);
      // Remove associated tasks
      db.tasks = db.tasks.filter(t => t.columnId !== columnId);
      persistMemoryStore();

      return res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
};

exports.buildBoardResponse = async (boardId) => {
  return buildBoardResponse(boardId);
};
