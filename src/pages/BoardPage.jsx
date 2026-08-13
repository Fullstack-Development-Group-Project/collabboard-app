import { useEffect, useState } from "react";

import Topbar from "../components/Topbar";
import Board from "../components/Board";
import apiClient from "../API/client";

function BoardPage() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBoard = async () => {
    try {
      const boardsRes = await apiClient.get("/boards");
      const activeBoard = boardsRes.data[0];

      if (!activeBoard) {
        setBoard(null);
        return;
      }

      const boardRes = await apiClient.get(`/boards/${activeBoard.id}`);
      setBoard(boardRes.data);
    } catch (err) {
      console.error("Failed to fetch board data:", err);
      setError("Unable to load board data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleColumnAdded = (newColumn) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return currentBoard;

      return {
        ...currentBoard,
        columns: [...(currentBoard.columns || []), newColumn],
      };
    });
  };

  const handleColumnUpdated = (updatedColumn) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return currentBoard;

      return {
        ...currentBoard,
        columns: (currentBoard.columns || []).map((column) =>
          column.id === updatedColumn.id ? updatedColumn : column,
        ),
      };
    });
  };

  const handleColumnDeleted = (columnId) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return currentBoard;

      return {
        ...currentBoard,
        columns: (currentBoard.columns || []).filter(
          (column) => column.id !== columnId,
        ),
      };
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Topbar title="Website Redesign" />
        <main className="content-area">
          <p>Loading board...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Topbar title="Website Redesign" />
        <main className="content-area">
          <p role="alert">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Topbar title={board?.title || "Website Redesign"} />

      <main className="content-area">
        {board ? (
          <Board
            board={board}
            onColumnAdded={handleColumnAdded}
            onColumnUpdated={handleColumnUpdated}
            onColumnDeleted={handleColumnDeleted}
          />
        ) : (
          <p>No active board found.</p>
        )}
      </main>
    </div>
  );
}

export default BoardPage;