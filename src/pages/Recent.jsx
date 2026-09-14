import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";
import { BoardsIcon, SortIcon, FilterIcon } from "../components/Icons";

function Recent() {
  const navigate = useNavigate();
  const [recentBoards, setRecentBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort states
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent", "alpha", "oldest"

  useEffect(() => {
    const fetchRecentBoards = async () => {
      try {
        const response = await apiClient.get("/boards");
        const boards = response.data || [];
        setRecentBoards(boards);
      } catch (error) {
        console.error("Failed to fetch recent boards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBoards();
  }, []);

  const handleSortToggle = () => {
    if (sortBy === "recent") setSortBy("alpha");
    else if (sortBy === "alpha") setSortBy("oldest");
    else setSortBy("recent");
  };

  const sortedAndFilteredBoards = [...recentBoards]
    .filter(b => !filterText.trim() || b.title.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      if (sortBy === "oldest") return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

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
            <button
              type="button"
              className={showFilterBar ? "active" : ""}
              onClick={() => setShowFilterBar(!showFilterBar)}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FilterIcon size={14} />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={handleSortToggle}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Click to toggle sorting"
            >
              <SortIcon size={14} />
              <span>Sort: {sortBy === "recent" ? "Newest" : sortBy === "alpha" ? "A-Z" : "Oldest"}</span>
            </button>
          </div>
        </div>

        {showFilterBar && (
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Filter recent boards by name..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                maxWidth: "360px",
                padding: "8px 14px",
                background: "#1e1e2e",
                border: "1px solid #3b3b4f",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px"
              }}
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText("")}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="recent-grid">
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading recent boards...</p>
          ) : sortedAndFilteredBoards.length === 0 ? (
            <p style={{ padding: "2rem", color: "#888" }}>
              {filterText ? "No boards match your search filter." : "No recent boards found."}
            </p>
          ) : (
            sortedAndFilteredBoards.map((board) => {
              const bId = board.id || board._id;
              return (
                <article
                  className="recent-card"
                  key={bId}
                  onClick={() => navigate(`/boards?id=${bId}`)}
                  style={{ cursor: "pointer", transition: "transform 0.15s ease, border-color 0.15s ease" }}
                  title="Click to open this board"
                >
                  <div className="recent-card-top">
                    <div className="recent-icon">
                      <BoardsIcon size={18} />
                    </div>
                    <span>{board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : "Just now"}</span>
                  </div>

                  <h3>{board.title}</h3>
                  <p>{board.description || "Personal or Team Board"}</p>

                  <div className="recent-card-footer">
                    <div className="recent-members">
                      <span>B</span>
                    </div>

                    <strong>{board.columnCount !== undefined ? `${board.columnCount} Cols` : "Open →"}</strong>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Recent;