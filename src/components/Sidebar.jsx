import { useAuth } from "../hooks/useAuth";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";
import {
  DashboardIcon,
  BoardsIcon,
  RecentIcon,
  AssignedIcon,
  TeamIcon,
  ActivityIcon,
  SettingsIcon,
  LogoutIcon,
} from "./Icons";

function Sidebar() {
  const navigate = useNavigate();
  const user = useAuth();

  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  
  const navItems = [
    { path: "/", icon: DashboardIcon, label: "Dashboard" },
    { path: "/boards", icon: BoardsIcon, label: "My Boards" },
    { path: "/recent", icon: RecentIcon, label: "Recent" },
    { path: "/assigned", icon: AssignedIcon, label: "Assigned to Me" },
    { path: "/team", icon: TeamIcon, label: "Team" },
    { path: "/activity", icon: ActivityIcon, label: "Activity" },
    { path: "/settings", icon: SettingsIcon, label: "Settings" },
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
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingTop: "20px" }}>
        <div
          className="profile-link"
          onClick={() => navigate("/settings")}
          style={{ cursor: "pointer" }}
          title="View Settings & Profile"
        >
          <div className="profile-avatar">{userInitials}</div>

          <div className="profile-info">
            <strong>Profile</strong>
            <span>{userName}</span>
          </div>
        </div>

        <button
          className="sidebar-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          type="button"
          aria-label="Sign out"
        >
          <LogoutIcon size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;