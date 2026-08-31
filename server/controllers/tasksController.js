const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Board = require('../models/Board');
const Column = require('../models/Column');
const db = require('../data/memoryStore');

exports.getAssignedTasks = async (req, res, next) => {
  try {
    // Try database first
    try {
      const tasks = await Task.find({ assignee: req.user.id }).sort({ createdAt: -1 }).lean();
      return res.status(200).json(tasks.map((task) => ({
        ...task,
        id: task._id.toString(),
        boardId: task.boardId ? task.boardId.toString() : null,
        columnId: task.columnId ? task.columnId.toString() : null,
        assignee: task.assignee ? task.assignee.toString() : null,
        reporter: task.reporter ? task.reporter.toString() : null,
      })));
    } catch (dbError) {
      console.log('Database query failed, using memory store for tasks');
      // Fall back to memory store
      const tasks = db.tasks.filter(t => t.assignee === req.user.id);
      return res.status(200).json(tasks.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    }
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

    // Try database first
    try {
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

      return res.status(201).json({
        ...task.toObject(),
        id: task._id.toString(),
        boardId: task.boardId.toString(),
        columnId: task.columnId.toString(),
        assignee: task.assignee ? task.assignee.toString() : null,
        reporter: task.reporter.toString(),
      });
    } catch (dbError) {
      console.log('Database operation failed, using memory store for task creation');
      // Fall back to memory store
      const board = db.boards.find(b => b.id === boardId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const column = db.columns.find(c => c.id === columnId && c.boardId === boardId);
      if (!column) {
        return res.status(404).json({ message: 'Column not found' });
      }

      const newTaskId = `task${db.tasks.length + 1}`;
      const newTask = {
        id: newTaskId,
        boardId,
        columnId,
        title: trimmedTitle,
        description: description || '',
        priority: priority || 'Medium',
        assignee: assignee || null,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        comments: [],
      };

      db.tasks.push(newTask);

      // Add activity
      db.activities.push({
        id: `act${db.activities.length + 1}`,
        userId: req.user.id,
        userName: req.user.name,
        boardId,
        action: `created task '${newTask.title}'`,
        timestamp: new Date().toISOString(),
      });

      return res.status(201).json(newTask);
    }
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
