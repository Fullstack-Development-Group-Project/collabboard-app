import { useMemo } from "react";
import Topbar from "../components/Topbar";

function Dashboard() {
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const userName = user?.name || "User";
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "TOTAL BOARDS", value: "12", icon: "◉" },
    { label: "TASKS ASSIGNED", value: "8", icon: "▣" },
    { label: "DUE SOON", value: "3", icon: "◷" },
    { label: "COMPLETED", value: "45", icon: "✓" },
  ];

  const boards = [
    {
      title: "Website Redesign",
      description: "Overhauling the corporate marketing site with new...",
      tasks: "12/34 Tasks",
      comments: "8",
      progress: 35,
      priority: "High",
      members: ["A", "N", "+3"],
    },
    {
      title: "Mobile App v2.0",
      description: "React Native development for the upcoming Q3 release...",
      tasks: "45/50 Tasks",
      comments: "24",
      progress: 90,
      priority: "Medium",
      members: ["I", "U"],
    },
    {
      title: "Marketing Q1 Campaign",
      description: "Assets, ad copy, and launch strategy for the new product...",
      tasks: "5/18 Tasks",
      comments: "2",
      progress: 28,
      priority: "Low",
      members: ["N"],
    },
    {
      title: "University Partnership",
      description: "Coordinating internship program rollout with local...",
      tasks: "20/20 Tasks",
      comments: "15",
      progress: 100,
      priority: "Done",
      members: ["A", "M"],
    },
  ];

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
              <article className="dashboard-board-card" key={board.title}>
                <div className="board-card-top">
                  <h3>{board.title}</h3>
                  <button type="button" aria-label="Board options">
                    ⋮
                  </button>
                </div>

                <p>{board.description}</p>

                <div className="board-meta">
                  <span>☑ {board.tasks}</span>
                  <span>▢ {board.comments}</span>
                </div>

                <div className="board-progress-heading">
                  <span>Progress</span>
                  <span>{board.progress}%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${board.progress}%` }}
                  ></div>
                </div>

                <div className="board-card-footer">
                  <div className="dashboard-members">
                    {board.members.map((member) => (
                      <span key={member}>{member}</span>
                    ))}
                  </div>

                  <span
                    className={`dashboard-priority ${board.priority.toLowerCase()}`}
                  >
                    {board.priority}
                  </span>
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