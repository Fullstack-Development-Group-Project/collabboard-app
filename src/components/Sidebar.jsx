import { NavLink } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";

function Sidebar() {
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
        <div className="profile-avatar">N</div>

        <div className="profile-info">
          <strong>Profile</strong>
          <span>Nethupa</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;