import Topbar from "../components/Topbar";

function Team() {
  const members = [
    {
      name: "Nethupa",
      role: "Product Manager",
      type: "Member",
      initials: "N",
      status: "online",
    },
    {
      name: "Induwara",
      role: "Senior Developer",
      type: "Member",
      initials: "I",
      status: "online",
    },
    {
      name: "Udan",
      role: "UX Designer",
      type: "Member",
      initials: "U",
      status: "online",
    },
    {
      name: "Danindu",
      role: "QA Engineer",
      type: "Member",
      initials: "D",
      status: "away",
    },
  ];

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
          {members.map((member) => (
            <article className="team-card" key={member.name}>
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
          ))}
        </div>
      </main>
    </div>
  );
}

export default Team;