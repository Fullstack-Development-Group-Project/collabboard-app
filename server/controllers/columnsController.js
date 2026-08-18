const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');

const getBoardColumns = async (boardId) => {
  const columns = await Column.find({ boardId }).sort({ position: 1 }).lean();
  const columnIds = columns.map((column) => column._id);
  const tasks = await Task.find({ columnId: { $in: columnIds } }).lean();

  return columns.map((column) => ({
    ...column,
    id: column._id.toString(),
    boardId: column.boardId.toString(),
    tasks: tasks.filter((task) => String(task.columnId) === String(column._id)),
  }));
};

exports.getBoardColumnsList = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const columns = await getBoardColumns(boardId);
    res.status(200).json(columns);
  } catch (error) {
    next(error);
  }
};

exports.createBoardColumn = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    const nextPosition = (board.columns?.length || 0);
    const newColumn = await Column.create({
      boardId,
      title: trimmedTitle,
      position: nextPosition,
    });

    board.columns.push(newColumn._id);
    await board.save();

    res.status(201).json({
      id: newColumn._id.toString(),
      boardId: newColumn.boardId.toString(),
      title: newColumn.title,
      position: newColumn.position,
      tasks: [],
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBoardColumn = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    const { title } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    column.title = trimmedTitle;
    await column.save();

    const tasks = await Task.find({ boardId, columnId: column._id }).lean();
    res.status(200).json({
      id: column._id.toString(),
      boardId: column.boardId.toString(),
      title: column.title,
      position: column.position,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBoardColumn = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    board.columns = board.columns.filter((id) => String(id) !== String(column._id));
    await board.save();
    await Task.deleteMany({ boardId, columnId: column._id });
    await Column.findByIdAndDelete(column._id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.buildBoardResponse = async (boardId) => {
  return buildBoardResponse(boardId);
};
