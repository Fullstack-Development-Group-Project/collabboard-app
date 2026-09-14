import { useEffect, useState } from "react";
import apiClient from "../API/client";
import { EditIcon, TrashIcon, CheckIcon, CloseIcon, ChevronDownIcon } from "./Icons";

function TaskCard({ task, column, columns, onTaskUpdated, onTaskDeleted }) {
  const [selectedStatus, setSelectedStatus] = useState(column.title);

  const priorityClass = (task.priority || "Medium").toLowerCase();

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

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority || "Medium");

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      onTaskDeleted?.(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/tasks/${task.id}`, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
      });
      const updatedTask =
        response.status === 204
          ? {
              ...task,
              title: editTitle.trim(),
              description: editDesc.trim(),
              priority: editPriority,
            }
          : response.data;
      onTaskUpdated?.(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task details:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="task-card task-card-editing">
        <form onSubmit={handleSaveEdit}>
          <div className="task-edit-header">
            <span>Edit Task</span>
            <button
              type="button"
              className="task-edit-close"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            className="task-edit-input"
            placeholder="Task title..."
            autoFocus
          />

          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows="2"
            placeholder="Add detailed description..."
            className="task-edit-textarea"
          />

          <div className="task-priority-selector">
            <span className="task-priority-label">Priority:</span>
            <div className="priority-chips">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setEditPriority(p)}
                  className={`priority-chip ${p.toLowerCase()} ${editPriority === p ? "active" : ""}`}
                >
                  <span className="priority-dot"></span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="task-edit-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="task-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="task-btn-primary">
              <CheckIcon size={14} />
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className={`priority-badge ${priorityClass}`}>
          <span className="priority-dot"></span>
          <span>{task.priority || "Low"}</span>
        </div>

        <div className="task-card-actions">
          <button
            type="button"
            className="task-action-btn edit"
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
            title="Edit task"
          >
            <EditIcon size={14} />
          </button>

          <button
            type="button"
            className="task-action-btn delete"
            onClick={handleDelete}
            aria-label="Delete task"
            title="Delete task"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      <h3
        className="task-title"
        onClick={() => setIsEditing(true)}
        title="Click to edit task"
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div className="assignee">
          <div className="avatar">
            {task.assignee ? task.assignee.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="assignee-name">{task.assignee || "Assignee"}</span>
        </div>

        <div className="task-status-select-wrap">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            aria-label="Task status"
            className="task-status-select"
          >
            {columns.map((currentColumn) => (
              <option key={currentColumn.id} value={currentColumn.title}>
                {currentColumn.title}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={12} className="select-chevron" />
        </div>
      </div>
    </div>
  );
}

export default TaskCard;