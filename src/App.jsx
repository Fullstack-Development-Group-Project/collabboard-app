import Board from "./components/Board";
import mockData from "./mockData.json";
import logo from "./assets/collabboard-logo.jpeg";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <img
            src={logo}
            alt="CollabBoard Logo"
            className="brand-logo-image"
          />

          <div className="brand-text">
            <h2>CollabBoard</h2>
            <p>Enterprise Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <button className="nav-item">
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </button>

          <button className="nav-item active">
            <span className="nav-icon">◉</span>
            <span>My Boards</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">↶</span>
            <span>Recent</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">✓</span>
            <span>Assigned to Me</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">♟</span>
            <span>Team</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">▣</span>
            <span>Activity</span>
          </button>

          <button className="nav-item settings-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </button>
        </nav>

        {/* Profile */}
        <div className="profile-link">
          <div className="profile-avatar">N</div>

          <div className="profile-info">
            <strong>Profile</strong>
            <span>Nethupa</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="topbar">
          <div className="workspace-title">
            <h2>Website Redesign</h2>
            <span className="star">☆</span>
          </div>

          <div className="topbar-actions">
            <div className="member-avatars">
              <span>N</span>
              <span>I</span>
              <span>U</span>
            </div>

            <button className="invite-btn">
              <span>＋</span>
              Invite
            </button>

            <button
              className="notification-btn"
              aria-label="Notifications"
            >
              ♢
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>

        {/* Board Content */}
        <main className="content-area">
          <Board board={mockData.board} />
        </main>
      </div>
    </div>
  );
}

export default App;