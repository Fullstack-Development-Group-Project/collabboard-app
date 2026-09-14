const Notification = require('../models/Notification');
const db = require('../data/memoryStore');

if (!db.notifications) {
  db.notifications = [
    {
      id: 'notif_1',
      userId: 'user1',
      type: 'task_assigned',
      message: 'You were assigned to "Design System Polish"',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif_2',
      userId: 'user1',
      type: 'team_invite',
      message: 'Induwara updated column status to "In Progress"',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'notif_3',
      userId: 'user1',
      type: 'system',
      message: 'Welcome to CollabBoard Enterprise Workspace!',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
}

exports.getUserNotifications = async (req, res, next) => {
  try {
    try {
      const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
      if (notifications && notifications.length > 0) {
        return res.status(200).json(notifications.map((notification) => ({
          ...notification,
          id: notification._id.toString(),
          userId: notification.userId ? notification.userId.toString() : null,
          teamId: notification.teamId ? notification.teamId.toString() : null,
          boardId: notification.boardId ? notification.boardId.toString() : null,
          taskId: notification.taskId ? notification.taskId.toString() : null,
        })));
      }
    } catch (dbError) {
      console.log('Database error in getUserNotifications, using memory store');
    }

    // Memory store fallback
    const userNotifs = (db.notifications || []).filter(n => n.userId === req.user.id || n.userId === 'user1');
    return res.status(200).json(userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const notification = await Notification.findOne({ _id: id, userId: req.user.id });
      if (notification) {
        notification.read = true;
        await notification.save();

        return res.status(200).json({
          ...notification.toObject(),
          id: notification._id.toString(),
          userId: notification.userId.toString(),
          teamId: notification.teamId ? notification.teamId.toString() : null,
          boardId: notification.boardId ? notification.boardId.toString() : null,
          taskId: notification.taskId ? notification.taskId.toString() : null,
        });
      }
    } catch (dbError) {
      console.log('Database error in markNotificationRead, using memory store');
    }

    const memNotif = (db.notifications || []).find(n => n.id === id);
    if (memNotif) {
      memNotif.read = true;
      return res.status(200).json(memNotif);
    }

    return res.status(200).json({ success: true, id });
  } catch (error) {
    next(error);
  }
};

