import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../API/client";
import {
  BoardsIcon,
  KanbanIcon,
  ClockIcon,
  CheckIcon,
  ThreeDotsIcon,
  PlusIcon,
} from "../components/Icons";

function Dashboard() {
  const user = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [boards, setBoards] = useState([]);
  const [stats, setStats] = useState([
    { label: "TOTAL BOARDS", value: "0", icon: <BoardsIcon size={20} /> },
    { label: "TASKS ASSIGNED", value: "0", icon: <KanbanIcon size={20} /> },
    { label: "DUE SOON", value: "0", icon: <ClockIcon size={20} /> },
    { label: "COMPLETED", value: "0", icon: <CheckIcon size={20} /> },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [boardsRes, tasksRes] = await Promise.all([
          apiClient.get("/boards"),
          apiClient.get("/tasks/assigned")
        ]);

        const fetchedBoards = Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || [];
        const assignedTasks = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [];

        setBoards(fetchedBoards);

        const dueSoon = assignedTasks.filter(t => {
          if (!t.dueDate) return false;
          const timeDiff = new Date(t.dueDate) - new Date();
          return timeDiff > 0 && timeDiff < 3 * 24 * 60 * 60 * 1000; // 3 days
        });

        const completed = assignedTasks.filter(t => t.status === 'Done');

        setStats([
          { label: "TOTAL BOARDS", value: fetchedBoards.length.toString(), icon: <BoardsIcon size={20} /> },
          { label: "TASKS ASSIGNED", value: assignedTasks.length.toString(), icon: <KanbanIcon size={20} /> },
          { label: "DUE SOON", value: dueSoon.length.toString(), icon: <ClockIcon size={20} /> },
          { label: "COMPLETED", value: completed.length.toString(), icon: <CheckIcon size={20} /> },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    const trimmed = newBoardTitle.trim();
    if (!trimmed) return;
    try {
      await apiClient.post("/boards", { title: trimmed });
      setNewBoardTitle("");
      setShowCreateModal(false);
      // Re-fetch boards
      const boardsRes = await apiClient.get("/boards");
      const fetchedBoards = Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || [];
      setBoards(fetchedBoards);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const userName = user?.name || "User";
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Board options & rename state
  const [activeMenuBoardId, setActiveMenuBoardId] = useState(null);
  const [renameBoard, setRenameBoard] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const handleStatClick = (label) => {
    if (label === "TOTAL BOARDS") navigate("/boards");
    else if (label === "TASKS ASSIGNED" || label === "DUE SOON" || label === "COMPLETED") navigate("/assigned");
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;
    try {
      await apiClient.delete(`/boards/${boardId}`);
      setBoards(prev => prev.filter(b => (b._id || b.id) !== boardId));
      setActiveMenuBoardId(null);
    } catch (err) {
      console.error("Failed to delete board:", err);
      alert("Failed to delete board.");
    }
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!renameTitle.trim() || !renameBoard) return;
    try {
      const boardId = renameBoard._id || renameBoard.id;
      await apiClient.put(`/boards/${boardId}`, { title: renameTitle.trim() });
      setBoards(prev => prev.map(b => (b._id || b.id) === boardId ? { ...b, title: renameTitle.trim() } : b));
      setRenameBoard(null);
      setRenameTitle("");
    } catch (err) {
      console.error("Failed to rename board:", err);
      alert("Failed to rename board.");
    }
  };

  return (
    <div className="page-wrapper" onClick={() => setActiveMenuBoardId(null)}>
      <Topbar title="Dashboard" />

      <main className="dashboard-page">
        <section className="dashboard-intro">
          <h1>{greeting()}, {userName}</h1>
          <p>Here is what's happening with your projects today.</p>
        </section>

        <section className="dashboard-stats">
          {stats.map((stat) => (
            <article
              className="stat-card"
              key={stat.label}
              onClick={() => handleStatClick(stat.label)}
              style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
              title={`Click to view ${stat.label.toLowerCase()}`}
            >
              <div className="stat-card-top">
                <span>{stat.label}</span>
                <div className="stat-icon">{stat.icon}</div>
              </div>

              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-boards-section">
          <div className="section-heading">
            <h2>My Boards</h2>
            <button type="button" onClick={() => navigate("/boards")}>View All</button>
          </div>

          <div className="dashboard-board-grid">
            {boards.map((board) => {
              const bId = board._id || board.id;
              return (
                <article
                  className="dashboard-board-card"
                  key={bId}
                  onClick={() => navigate(`/boards?id=${bId}`)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="board-card-top">
                    <h3>{board.title}</h3>
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-label="Board options"
                        onClick={() => setActiveMenuBoardId(activeMenuBoardId === bId ? null : bId)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '2px 4px' }}
                      >
                        <ThreeDotsIcon size={18} />
                      </button>

                      {activeMenuBoardId === bId && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: '#1e1e2e',
                            border: '1px solid #3b3b4f',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            zIndex: 100,
                            width: '140px',
                            overflow: 'hidden'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => { setActiveMenuBoardId(null); navigate(`/boards?id=${bId}`); }}
                            style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer' }}
                          >
                            Open Board
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuBoardId(null);
                              setRenameBoard(board);
                              setRenameTitle(board.title);
                            }}
                            style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer' }}
                          >
                            Rename Board
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBoard(bId)}
                            style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', borderTop: '1px solid #2a2a3e' }}
                          >
                            Delete Board
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p>{board.description || "No description provided."}</p>

                  <div className="board-card-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: 600 }}>
                      {board.columnCount ? `${board.columnCount} columns` : "Kanban Board"}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>
                </article>
              );
            })}

            <article className="create-board-card" onClick={() => setShowCreateModal(true)} style={{ cursor: 'pointer' }}>
              <div className="create-board-icon">
                <PlusIcon size={24} />
              </div>

              <h3>Create New Board</h3>

              <p>
                Start an empty board or use a template to get started quickly.
              </p>
            </article>
          </div>
        </section>

        {/* Create Board Modal */}
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <form onSubmit={handleCreateBoard} style={{ background: '#1e1e2e', border: '1px solid #3b3b4f', padding: '32px', borderRadius: '12px', minWidth: '360px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <h2 style={{ marginBottom: '16px', color: '#fff' }}>Create New Board</h2>
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board title..."
                autoFocus
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #3b3b4f', background: '#2a2a3e', color: '#fff', marginBottom: '16px', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6c5ce7', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Create</button>
              </div>
            </form>
          </div>
        )}

        {/* Rename Board Modal */}
        {renameBoard && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <form onSubmit={handleSaveRename} style={{ background: '#1e1e2e', border: '1px solid #3b3b4f', padding: '32px', borderRadius: '12px', minWidth: '360px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <h2 style={{ marginBottom: '16px', color: '#fff' }}>Rename Board</h2>
              <input
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="New board title..."
                autoFocus
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #3b3b4f', background: '#2a2a3e', color: '#fff', marginBottom: '16px', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRenameBoard(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6c5ce7', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;