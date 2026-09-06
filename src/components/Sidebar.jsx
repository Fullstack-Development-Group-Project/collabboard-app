import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";

function Sidebar() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  const navItems = [
    { path: "/", icon: "▦", label: "Dashboard" },
    { path: "/boards", icon: "◉", label: "My Boards" },
    { path: "/recent", icon: "↶", label: "Recent" },
    { path: "/assigned", icon: "✓", label: "Assigned to Me" },
    { path: "/team", icon: "♟", label: "Team" },
    { path: "/activity", icon: "▣", label: "Activity" },
    { path: "/settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <aside className="sidebar">
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

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="profile-link">
        <div className="profile-avatar">{userInitials}</div>

        <div className="profile-info">
          <strong>Profile</strong>
          <span>{userName}</span>
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }}
        style={{
          marginTop: "16px",
          padding: "10px",
          background: "transparent",
          color: "#dc2626",
          border: "1px solid #dc2626",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;