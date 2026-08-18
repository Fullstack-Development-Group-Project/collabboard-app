const Activity = require('../models/Activity');

exports.getBoardActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activities = await Activity.find({ boardId: id }).sort({ createdAt: -1 }).lean();

    res.status(200).json(
      activities.map((activity) => ({
        ...activity,
        id: activity._id.toString(),
        userId: activity.userId ? activity.userId.toString() : null,
        boardId: activity.boardId ? activity.boardId.toString() : null,
        taskId: activity.taskId ? activity.taskId.toString() : null,
      })),
    );
  } catch (error) {
    next(error);
  }
};
