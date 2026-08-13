import { useEffect, useState } from "react";

import apiClient from "../API/client";
import TaskCard from "./TaskCard";

function Column({ column, onColumnRename, onColumnDelete }) {
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
    if (!column.boardId || !column.id) return;

    try {
      await apiClient.delete(`/boards/${column.boardId}/columns/${column.id}`);
      onColumnDelete?.(column.id);
    } catch (error) {
      console.error("Failed to delete column:", error);
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

        <div>
          {!isEditing && (
            <button
              type="button"
              className="column-menu"
              aria-label="Rename column"
              onClick={() => setIsEditing(true)}
            >
              ✎
            </button>
          )}
          <button
            type="button"
            className="column-menu"
            aria-label="Delete column"
            onClick={handleDelete}
          >
            🗑
          </button>
        </div>
      </div>

      <div className="task-list">
        {(column.tasks || []).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <button type="button" className="add-task-btn">
        + Add Task
      </button>
    </section>
  );
}

export default Column;