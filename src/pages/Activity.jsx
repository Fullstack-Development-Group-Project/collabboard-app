import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await apiClient.get("/activities");
        setActivities(response.data || []);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

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
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading activity feed...</p>
          ) : activities.length === 0 ? (
            <p style={{ padding: "2rem" }}>No recent activity.</p>
          ) : (
            activities.map((item) => (
              <div className="activity-item" key={item.id || item._id}>
                <div className="activity-avatar">{item.userName ? item.userName.charAt(0).toUpperCase() : "U"}</div>

                <div className="activity-card">
                  <div className="activity-card-top">
                    <div>
                      <strong>{item.userName || "Unknown User"}</strong>{" "}
                      <span>{item.action}</span>{" "}
                      {item.boardId && <span className="activity-target">on Board {item.boardId.substring(0,6)}</span>}
                    </div>

                    <span className="activity-time">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}</span>
                  </div>

                  {item.metadata && item.metadata.fields && (
                    <div className="activity-extra">
                      Updated fields: {item.metadata.fields.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="load-more-activity">Load More Activity</button>
      </main>
    </div>
  );
}

export default Activity;