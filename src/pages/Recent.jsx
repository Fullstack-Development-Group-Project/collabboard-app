import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";

function Recent() {
  const [recentBoards, setRecentBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBoards = async () => {
      try {
        const response = await apiClient.get("/boards");
        // Sort by most recently updated if available, or just use the API order (which is usually recent first)
        const boards = response.data || [];
        setRecentBoards(boards.slice(0, 6)); // Show top 6 recent
      } catch (error) {
        console.error("Failed to fetch recent boards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBoards();
  }, []);

  return (
    <div className="page-wrapper">
      <Topbar title="Recent Boards" />

      <main className="recent-page">
        <div className="recent-heading">
          <div>
            <h1>Recent Boards</h1>
            <p>Pick up right where you left off.</p>
          </div>

          <div className="recent-actions">
            <button>☰ Filter</button>
            <button>☷ Sort</button>
          </div>
        </div>

        <div className="recent-grid">
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading recent boards...</p>
          ) : recentBoards.length === 0 ? (
            <p style={{ padding: "2rem" }}>No recent boards found.</p>
          ) : (
            recentBoards.map((board) => (
              <article className="recent-card" key={board.id || board._id}>
                <div className="recent-card-top">
                  <div className="recent-icon">📋</div>
                  <span>{board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : "Just now"}</span>
                </div>

                <h3>{board.title}</h3>
                <p>Personal or Team Board</p>

                <div className="recent-card-footer">
                  <div className="recent-members">
                    <span>Y</span>
                  </div>

                  <strong>{board.columnCount !== undefined ? `${board.columnCount} Cols` : "Active"}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Recent;