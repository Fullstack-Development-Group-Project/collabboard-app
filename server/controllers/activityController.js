const db = require('../data/memoryStore');

exports.getBoardActivity = (req, res) => {
  const { id } = req.params;
  const boardActivities = db.activities.filter(a => a.boardId === id);
  // Sort descending by timestamp
  boardActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.status(200).json(boardActivities);
};
