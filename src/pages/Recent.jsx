import Topbar from "../components/Topbar";

function Recent() {
  const recentBoards = [
    {
      title: "Q3 Marketing Campaign",
      description: "Coordination for the upcoming product launch...",
      updated: "Updated 2h ago",
      progress: "12/24",
      icon: "📣",
    },
    {
      title: "Frontend Rewrite",
      description: "Tracking the migration of legacy components to the...",
      updated: "Updated 5h ago",
      progress: "45/50",
      icon: "⌨",
    },
    {
      title: "Critical Bug Triage",
      description: "High priority issues reported from the latest mobile...",
      updated: "Updated 1d ago",
      progress: "3 Open",
      icon: "🐞",
    },
    {
      title: "Design System Update",
      description: "Weekly sync notes and action items for the core...",
      updated: "Updated 2d ago",
      progress: "8 New",
      icon: "👥",
    },
  ];

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
          {recentBoards.map((board) => (
            <article className="recent-card" key={board.title}>
              <div className="recent-card-top">
                <div className="recent-icon">{board.icon}</div>
                <span>{board.updated}</span>
              </div>

              <h3>{board.title}</h3>
              <p>{board.description}</p>

              <div className="recent-card-footer">
                <div className="recent-members">
                  <span>N</span>
                  <span>I</span>
                  <span>+3</span>
                </div>

                <strong>{board.progress}</strong>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Recent;