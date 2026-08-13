const db = require('../data/memoryStore');

const getBoardColumns = (boardId) => {
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) return [];

  const boardColumns = Array.isArray(board.columns) && board.columns.length > 0
    ? board.columns
    : [
        { id: 'col1', boardId, title: 'To Do' },
        { id: 'col2', boardId, title: 'Doing' },
        { id: 'col3', boardId, title: 'Done' },
      ];

  return boardColumns.map((column) => ({
    ...column,
    boardId,
    tasks: db.tasks.filter((task) => task.boardId === boardId && task.columnId === column.id),
  }));
};

exports.getBoardColumnsList = (req, res) => {
  const { boardId } = req.params;
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  res.status(200).json(getBoardColumns(boardId));
};

exports.createBoardColumn = (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    return res.status(400).json({ message: 'Column title is required' });
  }

  const newColumn = {
    id: `col${Date.now()}`,
    boardId,
    title: trimmedTitle,
  };

  if (!Array.isArray(board.columns)) {
    board.columns = [];
  }

  board.columns.push(newColumn);

  res.status(201).json({
    ...newColumn,
    tasks: [],
  });
};

exports.updateBoardColumn = (req, res) => {
  const { boardId, columnId } = req.params;
  const { title } = req.body;
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const columnIndex = board.columns?.findIndex((column) => column.id === columnId);
  if (columnIndex === undefined || columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    return res.status(400).json({ message: 'Column title is required' });
  }

  board.columns[columnIndex] = {
    ...board.columns[columnIndex],
    title: trimmedTitle,
  };

  const updatedColumn = {
    ...board.columns[columnIndex],
    tasks: db.tasks.filter((task) => task.boardId === boardId && task.columnId === columnId),
  };

  res.status(200).json(updatedColumn);
};

exports.deleteBoardColumn = (req, res) => {
  const { boardId, columnId } = req.params;
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  if (!Array.isArray(board.columns)) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const columnIndex = board.columns.findIndex((column) => column.id === columnId);
  if (columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const [deletedColumn] = board.columns.splice(columnIndex, 1);
  db.tasks = db.tasks.filter((task) => !(task.boardId === boardId && task.columnId === deletedColumn.id));

  res.status(204).send();
};

exports.buildBoardResponse = (boardId) => {
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);
  if (!board) return null;

  return {
    ...board,
    columns: getBoardColumns(boardId),
  };
};
