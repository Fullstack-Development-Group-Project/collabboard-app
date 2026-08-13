const db = require('../data/memoryStore');

exports.getAllBoards = (req, res) => {
  const userTeams = db.teams
    .filter((team) => team.members.some((member) => member.userId === req.user.id))
    .map((team) => team.id);

  const userBoards = db.boards.filter(
    (board) => board.teamId === null || userTeams.includes(board.teamId),
  );

  res.status(200).json(userBoards);
};

exports.getBoardById = (req, res) => {
  const boardId = req.params.id;
  const board = db.boards.find((currentBoard) => currentBoard.id === boardId);

  if (!board) return res.status(404).json({ message: 'Board not found' });

  const boardColumns = Array.isArray(board.columns) && board.columns.length > 0
    ? board.columns.map((column) => ({
        ...column,
        tasks: db.tasks.filter(
          (task) => task.boardId === boardId && task.columnId === column.id,
        ),
      }))
    : [
        {
          id: 'col1',
          title: 'To Do',
          boardId,
          tasks: db.tasks.filter((task) => task.boardId === boardId && task.columnId === 'col1'),
        },
        {
          id: 'col2',
          title: 'Doing',
          boardId,
          tasks: db.tasks.filter((task) => task.boardId === boardId && task.columnId === 'col2'),
        },
        {
          id: 'col3',
          title: 'Done',
          boardId,
          tasks: db.tasks.filter((task) => task.boardId === boardId && task.columnId === 'col3'),
        },
      ];

  res.status(200).json({
    ...board,
    columns: boardColumns,
  });
};

exports.createBoard = (req, res) => {
  const { title, teamId } = req.body;
  const newBoard = {
    id: 'board' + Date.now(),
    title,
    teamId: teamId || null,
    createdAt: new Date().toISOString(),
    columns: [
      { id: 'col1', boardId: null, title: 'To Do' },
      { id: 'col2', boardId: null, title: 'Doing' },
      { id: 'col3', boardId: null, title: 'Done' },
    ],
  };

  newBoard.columns = newBoard.columns.map((column) => ({
    ...column,
    boardId: newBoard.id,
  }));

  db.boards.push(newBoard);
  res.status(201).json(newBoard);
};
