import { useAuth } from "../hooks/useAuth";

function Topbar({ title = "CollabBoard", showSearch = true }) {
  const user = useAuth();

  const userInitials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  return (
    <header className="topbar">
      <div className="workspace-title">
        <h2>{title}</h2>
        <span className="star">☆</span>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <div className="topbar-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search boards, tasks..."
              aria-label="Search"
            />
          </div>
        )}

        <div className="member-avatars">
          <span title={user?.name || "User"}>{userInitials}</span>
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
  );
}

export default Topbar;