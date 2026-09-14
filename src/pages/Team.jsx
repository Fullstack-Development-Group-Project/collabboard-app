import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";
import { PlusIcon, MailIcon } from "../components/Icons";

function Team() {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("all");
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // "all", "admin", "member"
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteStatus, setInviteStatus] = useState({ loading: false, message: "", isError: false });
  const [toastMessage, setToastMessage] = useState("");

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/teams");
      const fetchedTeams = response.data || [];
      setTeams(fetchedTeams);

      const uniqueMembers = new Map();
      fetchedTeams.forEach(team => {
        (team.members || []).forEach(member => {
          const key = member.userId;
          if (!uniqueMembers.has(key)) {
            uniqueMembers.set(key, {
              name: member.name || "Colleague",
              email: member.email || `${(member.name || "user").toLowerCase().replace(/\s+/g, "")}@example.com`,
              role: member.role === "admin" ? "Team Admin" : "Member",
              type: member.role === "admin" ? "Admin" : "Member",
              initials: (member.name || "U").charAt(0).toUpperCase(),
              status: "online",
              userId: member.userId,
              teamId: team.id || team._id,
              teamName: team.name
            });
          }
        });
      });
      setMembers(Array.from(uniqueMembers.values()));
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteStatus({ loading: true, message: "", isError: false });
    try {
      const targetTeamId = selectedTeamId !== "all" ? selectedTeamId : (teams[0]?.id || "teamA");
      const res = await apiClient.post(`/teams/${targetTeamId}/invitations`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });

      setInviteStatus({
        loading: false,
        message: res.data?.message || `Invitation successfully sent to ${inviteEmail}`,
        isError: false
      });

      // Refresh team members
      setTimeout(() => {
        setInviteEmail("");
        setShowInviteModal(false);
        setInviteStatus({ loading: false, message: "", isError: false });
        fetchTeamMembers();
      }, 1200);
    } catch (err) {
      setInviteStatus({
        loading: false,
        message: err.response?.data?.message || "Failed to send invitation.",
        isError: true
      });
    }
  };

  const handleEmailClick = (email, name) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setToastMessage(`Copied ${name}'s email (${email}) to clipboard!`);
      setTimeout(() => setToastMessage(""), 3000);
    }
    window.open(`mailto:${email}`);
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    if (selectedTeamId !== "all" && member.teamId !== selectedTeamId) return false;
    if (roleFilter !== "all" && member.type.toLowerCase() !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchRole = member.role.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <Topbar title="Team Members" />

      <main className="team-page">
        {toastMessage && (
          <div style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#10b981",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            zIndex: 3000,
            fontSize: "14px",
            fontWeight: 500
          }}>
            ✓ {toastMessage}
          </div>
        )}

        <div className="team-heading">
          <div>
            <h1>Team Members</h1>
            <p>Manage your organization's team and access levels.</p>
          </div>

          <button
            className="invite-member-btn"
            type="button"
            onClick={() => setShowInviteModal(true)}
            style={{ cursor: "pointer" }}
          >
            <PlusIcon size={15} />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Team selector tabs */}
        {teams.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedTeamId("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: selectedTeamId === "all" ? "1px solid #6c5ce7" : "1px solid #3b3b4f",
                background: selectedTeamId === "all" ? "rgba(108, 92, 231, 0.2)" : "#1e1e2e",
                color: selectedTeamId === "all" ? "#a29bfe" : "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500
              }}
            >
              All Teams ({members.length})
            </button>
            {teams.map(t => (
              <button
                key={t.id || t._id}
                type="button"
                onClick={() => setSelectedTeamId(t.id || t._id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: selectedTeamId === (t.id || t._id) ? "1px solid #6c5ce7" : "1px solid #3b3b4f",
                  background: selectedTeamId === (t.id || t._id) ? "rgba(108, 92, 231, 0.2)" : "#1e1e2e",
                  color: selectedTeamId === (t.id || t._id) ? "#a29bfe" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                {t.name} ({(t.members || []).length})
              </button>
            ))}
          </div>
        )}

        <div className="team-toolbar">
          <div className="team-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search team members..."
              aria-label="Search team members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", paddingRight: "8px" }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="team-filter" style={{ position: "relative" }}>
            <span>FILTER:</span>
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{ cursor: "pointer" }}
            >
              {roleFilter === "all" ? "All Roles" : roleFilter === "admin" ? "Admins Only" : "Members Only"} ⌄
            </button>

            {showRoleDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#1e1e2e",
                  border: "1px solid #3b3b4f",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  zIndex: 100,
                  width: "140px",
                  overflow: "hidden"
                }}
              >
                {["all", "admin", "member"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRoleFilter(r); setShowRoleDropdown(false); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      textAlign: "left",
                      background: roleFilter === r ? "#2a2a3e" : "transparent",
                      border: "none",
                      color: roleFilter === r ? "#6c5ce7" : "#cbd5e1",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: roleFilter === r ? 600 : 400
                    }}
                  >
                    {r === "all" ? "All Roles" : r === "admin" ? "Admins Only" : "Members Only"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="team-grid">
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading team members...</p>
          ) : filteredMembers.length === 0 ? (
            <p style={{ padding: "2rem", color: "#888" }}>
              {searchQuery || roleFilter !== "all" ? "No members match the selected filters." : "No team members found."}
            </p>
          ) : (
            filteredMembers.map((member) => (
              <article className="team-card" key={member.userId}>
                <div className="team-avatar-wrapper">
                  <div className="team-avatar">{member.initials}</div>
                  <span
                    className={`member-status-dot ${member.status}`}
                    title={member.status}
                  ></span>
                </div>

                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  {member.email}
                </div>

                <div className="team-card-footer">
                  <span
                    className={`member-role ${member.type.toLowerCase()}`}
                  >
                    {member.type}
                  </span>

                  <button
                    className="member-email-btn"
                    type="button"
                    aria-label={`Email ${member.name}`}
                    title={`Send email to ${member.email}`}
                    onClick={() => handleEmailClick(member.email, member.name)}
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <MailIcon size={15} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
            <form
              onSubmit={handleInviteSubmit}
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
                Add new members to your organization and assign roles.
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
                  placeholder="name@company.com"
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #3b3b4f",
                    background: "#2a2a3e",
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  <option value="member">Member (Can edit tasks and boards)</option>
                  <option value="admin">Team Admin (Full administrative access)</option>
                </select>
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
                  {inviteStatus.loading ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Team;