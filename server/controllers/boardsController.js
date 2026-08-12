const db = require('../data/memoryStore');

exports.getAllBoards = (req, res) => {
  // Return all boards where the user is either the owner or part of the team
  const userTeams = db.teams.filter(t => t.members.some(m => m.userId === req.user.id)).map(t => t.id);
  
  const userBoards = db.boards.filter(b => b.teamId === null || userTeams.includes(b.teamId));
  res.status(200).json(userBoards);
};

exports.getBoardById = (req, res) => {
  const boardId = req.params.id;
  const board = db.boards.find(b => b.id === boardId);
  
  if (!board) return res.status(404).json({ message: "Board not found" });

  // Get tasks for this board
  const boardTasks = db.tasks.filter(t => t.boardId === boardId);

  // Group tasks by mock columns (for simplicity, we hardcode 3 standard columns or dynamically group)
  const columns = [
    { id: "col1", title: "To Do", tasks: boardTasks.filter(t => t.status === 'To Do' || t.columnId === 'col1') },
    { id: "col2", title: "Doing", tasks: boardTasks.filter(t => t.status === 'Doing' || t.columnId === 'col2') },
    { id: "col3", title: "Done", tasks: boardTasks.filter(t => t.status === 'Done' || t.columnId === 'col3') }
  ];

  res.status(200).json({
    ...board,
    columns
  });
};

exports.createBoard = (req, res) => {
  const { title, teamId } = req.body;
  const newBoard = {
    id: "board" + Date.now(),
    title,
    teamId: teamId || null,
    createdAt: new Date().toISOString()
  };
  db.boards.push(newBoard);
  res.status(201).json(newBoard);
};
