const db = require('../data/memoryStore');

exports.getAssignedTasks = (req, res) => {
  const assignedTasks = db.tasks.filter(t => t.assignee === req.user.id);
  res.status(200).json(assignedTasks);
};

exports.createTask = (req, res) => {
  const { boardId } = req.params;
  const { title, description, priority, columnId, assignee } = req.body;
  
  const newTask = {
    id: "task" + Date.now(),
    title,
    description,
    priority,
    columnId,
    boardId,
    assignee,
    status: "To Do",
    dueDate: new Date().toISOString()
  };
  
  db.tasks.push(newTask);
  
  // Log activity
  db.activities.push({
    id: "act" + Date.now(),
    userId: req.user.id,
    userName: req.user.name,
    boardId,
    action: `created task '${title}'`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newTask);
};

exports.updateTask = (req, res) => {
  const { id } = req.params;
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) return res.status(404).json({ message: "Task not found" });

  db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
  
  // Log activity
  db.activities.push({
    id: "act" + Date.now(),
    userId: req.user.id,
    userName: req.user.name,
    boardId: db.tasks[taskIndex].boardId,
    action: `updated task '${db.tasks[taskIndex].title}'`,
    timestamp: new Date().toISOString()
  });

  res.status(200).json(db.tasks[taskIndex]);
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) return res.status(404).json({ message: "Task not found" });

  db.tasks.splice(taskIndex, 1);
  res.status(204).send();
};
