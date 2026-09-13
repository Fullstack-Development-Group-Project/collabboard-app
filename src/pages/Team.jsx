import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";

function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await apiClient.get("/teams");
        const teams = response.data || [];
        // Flatten all members from all teams the user belongs to, removing duplicates
        const uniqueMembers = new Map();
        teams.forEach(team => {
          team.members.forEach(member => {
            if (!uniqueMembers.has(member.userId)) {
              uniqueMembers.set(member.userId, {
                name: member.name,
                role: member.role === "admin" ? "Team Admin" : "Member",
                type: member.role === "admin" ? "Admin" : "Member",
                initials: member.name.charAt(0).toUpperCase(),
                status: "online", // Mock status
                userId: member.userId,
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
    fetchTeamMembers();
  }, []);

  return (
    <div className="page-wrapper">
      <Topbar title="Team Members" />

      <main className="team-page">
        <div className="team-heading">
          <div>
            <h1>Team Members</h1>
            <p>Manage your organization's team and access levels.</p>
          </div>

          <button className="invite-member-btn">
            <span>＋</span>
            Invite Member
          </button>
        </div>

        <div className="team-toolbar">
          <div className="team-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search team members..."
              aria-label="Search team members"
            />
          </div>

          <div className="team-filter">
            <span>FILTER:</span>
            <button>All Roles⌄</button>
          </div>
        </div>

        <div className="team-grid">
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading team members...</p>
          ) : members.length === 0 ? (
            <p style={{ padding: "2rem" }}>No team members found.</p>
          ) : (
            members.map((member) => (
              <article className="team-card" key={member.userId}>
                <div className="team-avatar-wrapper">
                  <div className="team-avatar">{member.initials}</div>
                  <span
                    className={`member-status-dot ${member.status}`}
                  ></span>
                </div>

                <h3>{member.name}</h3>
                <p>{member.role}</p>

                <div className="team-card-footer">
                  <span
                    className={`member-role ${member.type.toLowerCase()}`}
                  >
                    {member.type}
                  </span>

                  <button
                    className="member-email-btn"
                    aria-label={`Email ${member.name}`}
                  >
                    ✉
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Team;