import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../API/client";

function Dashboard() {
  const user = useAuth();
  
  const [boards, setBoards] = useState([]);
  const [stats, setStats] = useState([
    { label: "TOTAL BOARDS", value: "0", icon: "◉" },
    { label: "TASKS ASSIGNED", value: "0", icon: "▣" },
    { label: "DUE SOON", value: "0", icon: "◷" },
    { label: "COMPLETED", value: "0", icon: "✓" },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [boardsRes, tasksRes] = await Promise.all([
          apiClient.get("/boards"),
          apiClient.get("/tasks/assigned")
        ]);

        const fetchedBoards = boardsRes.data.boards || [];
        const assignedTasks = tasksRes.data.tasks || [];

        setBoards(fetchedBoards);

        const dueSoon = assignedTasks.filter(t => {
          if (!t.dueDate) return false;
          const timeDiff = new Date(t.dueDate) - new Date();
          return timeDiff > 0 && timeDiff < 3 * 24 * 60 * 60 * 1000; // 3 days
        });

        const completed = assignedTasks.filter(t => t.status === 'Done');

        setStats([
          { label: "TOTAL BOARDS", value: fetchedBoards.length.toString(), icon: "◉" },
          { label: "TASKS ASSIGNED", value: assignedTasks.length.toString(), icon: "▣" },
          { label: "DUE SOON", value: dueSoon.length.toString(), icon: "◷" },
          { label: "COMPLETED", value: completed.length.toString(), icon: "✓" },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const userName = user?.name || "User";
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="page-wrapper">
      <Topbar title="Dashboard" />

      <main className="dashboard-page">
        <section className="dashboard-intro">
          <h1>{greeting()}, {userName}</h1>
          <p>Here is what's happening with your projects today.</p>
        </section>

        <section className="dashboard-stats">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
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
            <button type="button">View All</button>
          </div>

          <div className="dashboard-board-grid">
            {boards.map((board) => (
              <article className="dashboard-board-card" key={board._id || board.id}>
                <div className="board-card-top">
                  <h3>{board.title}</h3>
                  <button type="button" aria-label="Board options">
                    ⋮
                  </button>
                </div>

                <p>{board.description || "No description provided."}</p>

                {/* Hiding complex relational fields (tasks, comments, progress) for now as requested */}
                {/* 
                <div className="board-meta">
                  <span>☑ {board.tasks || 0}</span>
                  <span>▢ {board.comments || 0}</span>
                </div>
                <div className="board-progress-heading">
                  <span>Progress</span>
                  <span>{board.progress || 0}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${board.progress || 0}%` }}
                  ></div>
                </div> 
                */}

                <div className="board-card-footer" style={{ marginTop: '20px' }}>
                  <div className="dashboard-members">
                    {/* Placeholder for members array if populated in future */}
                  </div>
                </div>
              </article>
            ))}

            <article className="create-board-card">
              <div className="create-board-icon">+</div>

              <h3>Create New Board</h3>

              <p>
                Start an empty board or use a template to get started quickly.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;