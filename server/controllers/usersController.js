const db = require('../data/memoryStore');

exports.getUserProfile = (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  
  // Omit password
  const { password, ...profile } = user;
  res.status(200).json(profile);
};

exports.updateUserProfile = (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  db.users[userIndex] = { ...db.users[userIndex], ...req.body };
  
  const { password, ...profile } = db.users[userIndex];
  res.status(200).json(profile);
};
