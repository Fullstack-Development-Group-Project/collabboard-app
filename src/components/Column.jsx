import { useEffect, useState } from "react";
import apiClient from "../API/client";
import TaskCard from "./TaskCard";
import { EditIcon, TrashIcon, PlusIcon } from "./Icons";

function Column({ column, boardId, onColumnRename, onColumnDelete, onTaskAdded, columns, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title || "");

  useEffect(() => {
    setTitleValue(column.title || "");
  }, [column.title]);

  const handleRename = async () => {
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle || !column.boardId || !column.id) return;

    try {
      const { data } = await apiClient.put(
        `/boards/${column.boardId}/columns/${column.id}`,
        { title: trimmedTitle },
      );

      onColumnRename?.(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename column:", error);
    }
  };

  const handleDelete = async () => {
    if (!boardId || !column.id) return;

    try {
      await apiClient.delete(`/boards/${boardId}/columns/${column.id}`);
      onColumnDelete?.(column.id);
    } catch (error) {
      console.error("Failed to delete column:", error);
    }
  };

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await apiClient.post(`/boards/${boardId}/tasks`, {
        title: trimmed,
        description: "Task description",
        priority: "Medium",
        columnId: column.id,
        assignee: currentUser.name || "User",
      });

      const createdTask = response.data;
      onTaskAdded?.(createdTask);
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <section className="board-column">
      <div className="column-header">
        <div className="column-title-wrap">
          {isEditing ? (
            <input
              type="text"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              aria-label="Column title"
              onBlur={handleRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleRename();
                if (event.key === "Escape") setIsEditing(false);
              }}
              autoFocus
            />
          ) : (
            <>
              <h2>{column.title}</h2>
              <span className="task-count">{(column.tasks || []).length}</span>
            </>
          )}
        </div>

        <div className="column-actions">
          {!isEditing && (
            <button
              type="button"
              className="column-action-btn edit"
              aria-label="Rename column"
              title="Rename column"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon size={14} />
            </button>
          )}
          <button
            type="button"
            className="column-action-btn delete"
            aria-label="Delete column"
            title="Delete column"
            onClick={handleDelete}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      <div className="task-list">
        {(column.tasks || []).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            column={column}
            columns={columns}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}
      </div>

      {isAddingTask ? (
        <form onSubmit={handleAddTaskSubmit} className="add-task-form">
          <input
            type="text"
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
            className="add-task-input"
          />
          <div className="add-task-actions">
            <button type="submit" className="add-task-submit">
              <PlusIcon size={14} />
              Add Task
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle("");
              }}
              className="add-task-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="add-task-btn"
          onClick={() => setIsAddingTask(true)}
        >
          <PlusIcon size={15} />
          <span>Add Task</span>
        </button>
      )}
    </section>
  );
}

export default Column;