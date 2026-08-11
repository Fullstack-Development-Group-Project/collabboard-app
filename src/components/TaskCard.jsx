function TaskCard({ task }) {
  const priorityClass = task.priority.toLowerCase();

  return (
    <div className="task-card">
      <div className={`priority-badge ${priorityClass}`}>
        {task.priority} Priority
      </div>

      <h3 className="task-title">{task.title}</h3>

      <p className="task-description">{task.description}</p>

      <div className="task-footer">
        <div className="assignee">
          <div className="avatar">
            {task.assignee.charAt(0).toUpperCase()}
          </div>

          <span>{task.assignee}</span>
        </div>

        <button className="task-menu" aria-label="Task options">
          ⋯
        </button>
      </div>
    </div>
  );
}

export default TaskCard;