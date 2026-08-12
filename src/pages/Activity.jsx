import Topbar from "../components/Topbar";

function Activity() {
  const activities = [
    {
      user: "Udan",
      action: "moved",
      target: "API Integration",
      extra: "to Done in Backend Architecture board",
      time: "2 hours ago",
      avatar: "S",
    },
    {
      user: "Sumith",
      action: "commented on",
      target: "Website Redesign",
      extra:
        "\"I've uploaded the new assets for the hero section. Let me know if the contrast meets accessibility standards.\"",
      time: "4 hours ago",
      avatar: "A",
    },
    {
      user: "Rumeth",
      action: "attached a file to",
      target: "Q3 Marketing Deck",
      extra: "Q3_Campaign_Final.pdf",
      time: "Yesterday, 3:15 PM",
      avatar: "E",
    },
    {
      user: "Siril",
      action: "created a new board",
      target: "Mobile App V2",
      extra: "",
      time: "Oct 12",
      avatar: "D",
    },
  ];

  return (
    <div className="page-wrapper">
      <Topbar title="Activity" />

      <main className="activity-page">
        <div className="activity-heading">
          <div>
            <h1>Activity</h1>
            <p>Track recent changes, comments, and updates across your team.</p>
          </div>

          <button className="activity-filter-btn">☰ Filter</button>
        </div>

        <div className="activity-timeline">
          {activities.map((item, index) => (
            <div className="activity-item" key={`${item.user}-${index}`}>
              <div className="activity-avatar">{item.avatar}</div>

              <div className="activity-card">
                <div className="activity-card-top">
                  <div>
                    <strong>{item.user}</strong>{" "}
                    <span>{item.action}</span>{" "}
                    <span className="activity-target">{item.target}</span>
                  </div>

                  <span className="activity-time">{item.time}</span>
                </div>

                {item.extra && (
                  <div
                    className={`activity-extra ${
                      item.extra.includes(".pdf") ? "file-extra" : ""
                    }`}
                  >
                    {item.extra.includes(".pdf") ? (
                      <>
                        <span className="file-icon">PDF</span>
                        <span>{item.extra}</span>
                      </>
                    ) : (
                      item.extra
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="load-more-activity">Load More Activity</button>
      </main>
    </div>
  );
}

export default Activity;