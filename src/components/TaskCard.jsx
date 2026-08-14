import apiClient from "../API/client";

function TaskCard({ task, column, columns, onTaskUpdated, onTaskDeleted}) {
  const priorityClass = task.priority.toLowerCase();

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    const targetColumn = columns.find(
      (currentColumn) => currentColumn.title === newStatus,
    );

    if (!targetColumn || targetColumn.id === column.id) return;

    try {
      const { data } = await apiClient.put(`/tasks/${task.id}`, {
        status: newStatus,
        columnId: targetColumn.id,
      });

      onTaskUpdated?.(data);
    } catch (error) {
      console.error("Failed to update task:", error);

      event.target.value = column.title;
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      onTaskDeleted?.(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

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

        <select
          value={column.title}
          onChange={handleStatusChange}
          aria-label="Task status"
        >
          {columns.map((currentColumn) => (
            <option key={currentColumn.id} value={currentColumn.title}>
              {currentColumn.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="task-menu"
          onClick={handleDelete}
          aria-label="Delete task"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default TaskCard;