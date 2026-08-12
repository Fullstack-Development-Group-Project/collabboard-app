const db = require('../data/memoryStore');

exports.getUserNotifications = (req, res) => {
  const notifications = db.notifications.filter(n => n.userId === req.user.id);
  // Sort descending
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.status(200).json(notifications);
};

exports.markNotificationRead = (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id && n.userId === req.user.id);
  
  if (!notif) return res.status(404).json({ message: "Notification not found" });

  notif.read = true;
  res.status(200).json(notif);
};
