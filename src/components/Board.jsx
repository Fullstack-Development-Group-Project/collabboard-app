import { useState } from "react";

import apiClient from "../API/client";
import Column from "./Column";

function Board({ board, onColumnAdded, onColumnUpdated, onColumnDeleted }) {
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

  return (
    <div className="board-area">
      <div className="board-heading">
        <div>
          <p className="board-label">My Boards</p>
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
            onColumnRename={onColumnUpdated}
            onColumnDelete={onColumnDeleted}
          />
        ))}

        <form className="column-create-form" onSubmit={handleCreateColumn}>
          <input
            type="text"
            value={newColumnTitle}
            onChange={(event) => setNewColumnTitle(event.target.value)}
            placeholder="Add a new column"
            aria-label="New column title"
          />
          <button type="submit">+ Add Column</button>
        </form>
      </div>
    </div>
  );
}

export default Board;