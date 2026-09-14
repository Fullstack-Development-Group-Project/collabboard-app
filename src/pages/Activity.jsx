import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";
import { FilterIcon, ChevronDownIcon, RefreshIcon } from "../components/Icons";

function Activity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(8);
  const [actionFilter, setActionFilter] = useState("all"); // "all", "create", "update", "delete"
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/activities");
      setActivities(response.data || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleLoadMore = () => {
    if (displayLimit >= activities.length) {
      // Refresh to check for newer activities
      setIsRefreshing(true);
      fetchActivities();
    } else {
      setDisplayLimit(prev => prev + 5);
    }
  };

  const filteredActivities = activities.filter(item => {
    if (actionFilter === "all") return true;
    const actionLower = (item.action || "").toLowerCase();
    if (actionFilter === "create") return actionLower.includes("create") || actionLower.includes("add");
    if (actionFilter === "update") return actionLower.includes("update") || actionLower.includes("move") || actionLower.includes("rename");
    if (actionFilter === "delete") return actionLower.includes("delete") || actionLower.includes("remove");
    return true;
  });

  const visibleActivities = filteredActivities.slice(0, displayLimit);

  return (
    <div className="page-wrapper">
      <Topbar title="Activity" />

      <main className="activity-page">
        <div className="activity-heading">
          <div>
            <h1>Activity</h1>
            <p>Track recent changes, comments, and updates across your team.</p>
          </div>

          <div style={{ position: "relative" }}>
            <button
              className="activity-filter-btn"
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FilterIcon size={14} />
              <span>Filter: {actionFilter === "all" ? "All" : actionFilter.charAt(0).toUpperCase() + actionFilter.slice(1)}</span>
              <ChevronDownIcon size={13} />
            </button>

            {showFilterDropdown && (
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
                  width: "150px",
                  overflow: "hidden"
                }}
              >
                {[
                  { key: "all", label: "All Activities" },
                  { key: "create", label: "Creations" },
                  { key: "update", label: "Updates" },
                  { key: "delete", label: "Deletions" }
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => { setActionFilter(f.key); setShowFilterDropdown(false); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      textAlign: "left",
                      background: actionFilter === f.key ? "#2a2a3e" : "transparent",
                      border: "none",
                      color: actionFilter === f.key ? "#6c5ce7" : "#cbd5e1",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: actionFilter === f.key ? 600 : 400
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="activity-timeline">
          {loading ? (
            <p style={{ padding: "2rem" }}>Loading activity feed...</p>
          ) : visibleActivities.length === 0 ? (
            <p style={{ padding: "2rem", color: "#888" }}>
              {actionFilter !== "all" ? "No activities matching this filter." : "No recent activity."}
            </p>
          ) : (
            visibleActivities.map((item) => (
              <div className="activity-item" key={item.id || item._id}>
                <div className="activity-avatar">{item.userName ? item.userName.charAt(0).toUpperCase() : "U"}</div>

                <div className="activity-card">
                  <div className="activity-card-top">
                    <div>
                      <strong>{item.userName || "Unknown User"}</strong>{" "}
                      <span>{item.action}</span>{" "}
                      {item.boardId && (
                        <span
                          className="activity-target"
                          onClick={() => navigate(`/boards?id=${item.boardId}`)}
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                          title="Click to view board"
                        >
                          on Board {String(item.boardId).substring(0, 6)}
                        </span>
                      )}
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

        {visibleActivities.length > 0 && (
          <button
            className="load-more-activity"
            type="button"
            onClick={handleLoadMore}
            disabled={isRefreshing}
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <RefreshIcon size={14} className={isRefreshing ? "spin-icon" : ""} />
            <span>
              {isRefreshing ? "Refreshing feed..." : displayLimit < filteredActivities.length ? `Load More (${filteredActivities.length - displayLimit} remaining)` : "Refresh Feed"}
            </span>
          </button>
        )}
      </main>
    </div>
  );
}

export default Activity;