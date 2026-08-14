import { useEffect, useState } from "react";

import apiClient from "../API/client";

function TaskCard({ task, column, columns, onTaskUpdated, onTaskDeleted }) {
  const [selectedStatus, setSelectedStatus] = useState(column.title);

  const priorityClass = (task.priority || "").toLowerCase();

  useEffect(() => {
    setSelectedStatus(column.title);
  }, [column.title]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    const targetColumn = columns.find(
      (currentColumn) => currentColumn.title === newStatus,
    );

    if (!targetColumn || targetColumn.id === column.id) {
      setSelectedStatus(column.title);
      return;
    }

    setSelectedStatus(newStatus);

    try {
      const response = await apiClient.put(`/tasks/${task.id}`, {
        status: newStatus,
        columnId: targetColumn.id,
      });

      const updatedTask =
        response.status === 204
          ? {
              ...task,
              status: newStatus,
              columnId: targetColumn.id,
            }
          : response.data;

      onTaskUpdated?.(updatedTask);
    } catch (error) {
      console.error("Failed to update task:", error);
      setSelectedStatus(column.title);
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
        {task.priority || "Low"} Priority
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
          value={selectedStatus}
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