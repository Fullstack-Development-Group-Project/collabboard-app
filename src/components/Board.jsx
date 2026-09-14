import { useState } from "react";
import apiClient from "../API/client";
import Column from "./Column";
import { PlusIcon, ChevronDownIcon } from "./Icons";

function Board({ board, boardsList = [], onSelectBoard, onColumnAdded, onColumnUpdated, onColumnDeleted, onTaskAdded, onTaskUpdated, onTaskDeleted }) {
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const handleCreateColumn = async (event) => {
    event.preventDefault();

    const trimmedTitle = newColumnTitle.trim();
    if (!trimmedTitle || !board?.id) return;

    try {
      const { data } = await apiClient.post(`/boards/${board.id}/columns`, {
        title: trimmedTitle,
      });

      onColumnAdded?.(data);
      setNewColumnTitle("");
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    onTaskUpdated?.(updatedTask);
  };

  return (
    <div className="board-area">
      <div className="board-heading">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p className="board-label" style={{ margin: 0 }}>My Boards</p>
            {boardsList.length > 1 && (
              <div className="board-switcher-wrap">
                <select
                  value={board.id || board._id}
                  onChange={(e) => onSelectBoard?.(e.target.value)}
                  className="board-switcher-select"
                  aria-label="Switch board"
                >
                  {boardsList.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={12} className="board-switcher-chevron" />
              </div>
            )}
          </div>
          <h1>{board.title}</h1>
        </div>

        <div className="board-status">
          <span className="status-dot"></span>
          Live — syncing
        </div>
      </div>

      <div className="board-columns">
        {(board.columns || []).map((column) => (
          <Column
            key={column.id}
            column={column}
            boardId={board.id}
            onColumnRename={onColumnUpdated}
            onColumnDelete={onColumnDeleted}
            onTaskAdded={onTaskAdded}
            columns={board.columns || []}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}

        <form className="column-create-form" onSubmit={handleCreateColumn}>
          <input
            type="text"
            value={newColumnTitle}
            onChange={(event) => setNewColumnTitle(event.target.value)}
            placeholder="Add new column title..."
            aria-label="New column title"
          />
          <button type="submit">
            <PlusIcon size={14} />
            <span>Add Column</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Board;