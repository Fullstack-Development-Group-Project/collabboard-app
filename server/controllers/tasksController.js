const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Board = require('../models/Board');
const Column = require('../models/Column');

exports.getAssignedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user.id }).sort({ createdAt: -1 }).lean();
    res.status(200).json(tasks.map((task) => ({
      ...task,
      id: task._id.toString(),
      boardId: task.boardId ? task.boardId.toString() : null,
      columnId: task.columnId ? task.columnId.toString() : null,
      assignee: task.assignee ? task.assignee.toString() : null,
      reporter: task.reporter ? task.reporter.toString() : null,
    })));
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, columnId, assignee, dueDate } = req.body;

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const task = await Task.create({
      title: trimmedTitle,
      description: description || '',
      priority: priority || 'Medium',
      status: 'To Do',
      boardId,
      columnId,
      assignee: assignee || null,
      reporter: req.user.id,
      dueDate: dueDate || null,
    });

    await Activity.create({
      userId: req.user.id,
      userName: req.user.name,
      boardId,
      taskId: task._id,
      action: `created task '${task.title}'`,
      metadata: { columnId, assignee },
    });

    res.status(201).json({
      ...task.toObject(),
      id: task._id.toString(),
      boardId: task.boardId.toString(),
      columnId: task.columnId.toString(),
      assignee: task.assignee ? task.assignee.toString() : null,
      reporter: task.reporter.toString(),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: { ...req.body } },
      { new: true, runValidators: true },
    );

    await Activity.create({
      userId: req.user.id,
      userName: req.user.name,
      boardId: updatedTask.boardId,
      taskId: updatedTask._id,
      action: `updated task '${updatedTask.title}'`,
      metadata: { fields: Object.keys(req.body) },
    });

    res.status(200).json({
      ...updatedTask.toObject(),
      id: updatedTask._id.toString(),
      boardId: updatedTask.boardId.toString(),
      columnId: updatedTask.columnId.toString(),
      assignee: updatedTask.assignee ? updatedTask.assignee.toString() : null,
      reporter: updatedTask.reporter.toString(),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
