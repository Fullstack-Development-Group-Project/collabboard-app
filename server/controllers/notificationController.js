const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    res.status(200).json(notifications.map((notification) => ({
      ...notification,
      id: notification._id.toString(),
      userId: notification.userId ? notification.userId.toString() : null,
      teamId: notification.teamId ? notification.teamId.toString() : null,
      boardId: notification.boardId ? notification.boardId.toString() : null,
      taskId: notification.taskId ? notification.taskId.toString() : null,
    })));
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, userId: req.user.id });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      ...notification.toObject(),
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      teamId: notification.teamId ? notification.teamId.toString() : null,
      boardId: notification.boardId ? notification.boardId.toString() : null,
      taskId: notification.taskId ? notification.taskId.toString() : null,
    });
  } catch (error) {
    next(error);
  }
};
