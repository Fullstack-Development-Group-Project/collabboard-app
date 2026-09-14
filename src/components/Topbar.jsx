import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../API/client";
import { SearchIcon, StarIcon, BellIcon, PlusIcon, CloseIcon } from "./Icons";

function Topbar({ title = "CollabBoard", showSearch = true }) {
  const user = useAuth();
  const navigate = useNavigate();

  // State
  const [isStarred, setIsStarred] = useState(() => {
    return localStorage.getItem(`starred_${title}`) === "true";
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ loading: false, message: "", isError: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ boards: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [allBoards, setAllBoards] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const userInitials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  // Load notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await apiClient.get("/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifs();
  }, []);

  // Pre-fetch boards and tasks for search
  useEffect(() => {
    if (!showSearch) return;
    const fetchSearchData = async () => {
      try {
        const [boardsRes, tasksRes] = await Promise.all([
          apiClient.get("/boards"),
          apiClient.get("/tasks/assigned")
        ]);
        setAllBoards(Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || []);
        setAllTasks(Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || []);
      } catch (err) {
        console.error("Error pre-fetching search data:", err);
      }
    };
    fetchSearchData();
  }, [showSearch]);

  // Handle Search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults({ boards: [], tasks: [] });
      return;
    }

    const q = searchQuery.toLowerCase();
    const matchedBoards = allBoards.filter(b => b.title?.toLowerCase().includes(q));
    const matchedTasks = allTasks.filter(t => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));

    setSearchResults({ boards: matchedBoards, tasks: matchedTasks });
    setIsSearching(true);
  }, [searchQuery, allBoards, allTasks]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStar = () => {
    const nextState = !isStarred;
    setIsStarred(nextState);
    localStorage.setItem(`starred_${title}`, String(nextState));
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteStatus({ loading: true, message: "", isError: false });
    try {
      // Find a team or default team
      const teamsRes = await apiClient.get("/teams");
      const teams = teamsRes.data || [];
      const teamId = teams[0]?.id || "teamA";

      const res = await apiClient.post(`/teams/${teamId}/invitations`, { email: inviteEmail.trim() });
      setInviteStatus({
        loading: false,
        message: res.data?.message || `Invitation successfully sent to ${inviteEmail}`,
        isError: false,
      });
      setTimeout(() => {
        setInviteEmail("");
        setShowInviteModal(false);
        setInviteStatus({ loading: false, message: "", isError: false });
      }, 1500);
    } catch (err) {
      setInviteStatus({
        loading: false,
        message: err.response?.data?.message || "Failed to send invitation.",
        isError: true,
      });
    }
  };

  const markAllRead = async () => {
    try {
      for (const n of notifications) {
        if (!n.read) {
          await apiClient.put(`/notifications/${n.id || n._id}/read`);
        }
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed marking notifications read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar" style={{ position: "relative" }}>
      <div className="workspace-title">
        <h2>{title}</h2>
        <button
          type="button"
          onClick={toggleStar}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: isStarred ? "#eab308" : "#94a3b8",
            padding: "4px",
            lineHeight: 1,
            transition: "transform 0.15s ease",
          }}
          title={isStarred ? "Favorited (Click to remove)" : "Add to favorites"}
          aria-label="Star workspace"
        >
          <StarIcon size={19} filled={isStarred} />
        </button>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <div className="topbar-search" ref={searchRef} style={{ position: "relative" }}>
            <span className="search-icon-wrap">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search boards, tasks..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearching(true)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", paddingRight: "8px", display: "inline-flex", alignItems: "center" }}
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}

            {/* Live Search Results Dropdown */}
            {isSearching && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: "320px",
                  background: "#1e1e2e",
                  border: "1px solid #3b3b4f",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 1000,
                  overflow: "hidden",
                  maxHeight: "360px",
                  overflowY: "auto"
                }}
              >
                {searchResults.boards.length === 0 && searchResults.tasks.length === 0 ? (
                  <div style={{ padding: "16px", color: "#888", textAlign: "center", fontSize: "13px" }}>
                    No matching boards or tasks found.
                  </div>
                ) : (
                  <>
                    {searchResults.boards.length > 0 && (
                      <div style={{ padding: "8px 0" }}>
                        <div style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.5px" }}>
                          BOARDS ({searchResults.boards.length})
                        </div>
                        {searchResults.boards.map(b => (
                          <div
                            key={b.id || b._id}
                            onClick={() => {
                              navigate(`/boards?id=${b.id || b._id}`);
                              setIsSearching(false);
                              setSearchQuery("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: "#e2e8f0",
                              fontSize: "13px",
                              borderBottom: "1px solid #2a2a3e"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a3e"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <span>📋</span>
                            <span style={{ fontWeight: 600 }}>{b.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.tasks.length > 0 && (
                      <div style={{ padding: "8px 0" }}>
                        <div style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#10b981", letterSpacing: "0.5px" }}>
                          TASKS ({searchResults.tasks.length})
                        </div>
                        {searchResults.tasks.map(t => (
                          <div
                            key={t.id || t._id}
                            onClick={() => {
                              navigate(`/boards?id=${t.boardId}`);
                              setIsSearching(false);
                              setSearchQuery("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              color: "#e2e8f0",
                              fontSize: "13px",
                              borderBottom: "1px solid #2a2a3e"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a3e"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <div>
                              <div style={{ fontWeight: 500 }}>{t.title}</div>
                              <div style={{ fontSize: "11px", color: "#888" }}>Status: {t.status}</div>
                            </div>
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "#3b3b4f" }}>
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Menu Avatar */}
        <div className="member-avatars" ref={userMenuRef} style={{ position: "relative" }}>
          <span
            title={user?.name || "User"}
            style={{ cursor: "pointer" }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {userInitials}
          </span>

          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "180px",
                background: "#1e1e2e",
                border: "1px solid #3b3b4f",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 1000,
                padding: "8px 0"
              }}
            >
              <div style={{ padding: "8px 16px", borderBottom: "1px solid #2e2e42" }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "13px" }}>{user?.name || "User"}</div>
                <div style={{ fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => { setShowUserMenu(false); navigate("/settings"); }}
                style={{ width: "100%", padding: "8px 16px", textAlign: "left", background: "none", border: "none", color: "#cbd5e1", fontSize: "13px", cursor: "pointer", display: "flex", gap: "8px" }}
              >
                ⚙ Settings
              </button>
              <button
                type="button"
                onClick={() => { setShowUserMenu(false); navigate("/assigned"); }}
                style={{ width: "100%", padding: "8px 16px", textAlign: "left", background: "none", border: "none", color: "#cbd5e1", fontSize: "13px", cursor: "pointer", display: "flex", gap: "8px" }}
              >
                ✓ My Tasks
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                style={{ width: "100%", padding: "8px 16px", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: "13px", cursor: "pointer", display: "flex", gap: "8px", borderTop: "1px solid #2e2e42" }}
              >
                ➔ Logout
              </button>
            </div>
          )}
        </div>

        {/* Invite Button */}
        <button
          className="invite-btn"
          type="button"
          onClick={() => setShowInviteModal(true)}
          style={{ cursor: "pointer" }}
        >
          <PlusIcon size={15} />
          <span>Invite</span>
        </button>

        {/* Notification Button */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="notification-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <BellIcon size={18} />
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "320px",
                background: "#1e1e2e",
                border: "1px solid #3b3b4f",
                borderRadius: "10px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                zIndex: 1000,
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2e2e42" }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                  Notifications {unreadCount > 0 && <span style={{ background: "#6c5ce7", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", marginLeft: "6px" }}>{unreadCount}</span>}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#888", fontSize: "13px" }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id || n._id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #2a2a3e",
                        background: n.read ? "transparent" : "rgba(108, 92, 231, 0.08)",
                        fontSize: "13px",
                        color: "#e2e8f0"
                      }}
                    >
                      <div style={{ fontWeight: n.read ? 400 : 600, marginBottom: "4px" }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: "8px 16px", background: "#181824", textAlign: "center", borderTop: "1px solid #2e2e42" }}>
                <button
                  type="button"
                  onClick={() => { setShowNotifications(false); navigate("/activity"); }}
                  style={{ background: "none", border: "none", color: "#aaa", fontSize: "12px", cursor: "pointer" }}
                >
                  View full activity feed →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <form
            onSubmit={handleSendInvite}
            style={{
              background: "#1e1e2e",
              border: "1px solid #3b3b4f",
              padding: "28px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}
          >
            <h3 style={{ color: "#fff", marginBottom: "8px", fontSize: "1.25rem" }}>Invite Team Member</h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
              Invite a collaborator to join your workspace and boards.
            </p>

            {inviteStatus.message && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  background: inviteStatus.isError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: inviteStatus.isError ? "#ef4444" : "#10b981",
                  border: `1px solid ${inviteStatus.isError ? "#ef4444" : "#10b981"}`
                }}
              >
                {inviteStatus.message}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #3b3b4f",
                  background: "#2a2a3e",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteStatus({ loading: false, message: "", isError: false }); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #475569",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteStatus.loading}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#6c5ce7",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600
                }}
              >
                {inviteStatus.loading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

export default Topbar;