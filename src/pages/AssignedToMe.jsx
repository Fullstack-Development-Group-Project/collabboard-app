import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";
import { ListIcon, KanbanIcon, FilterIcon, ThreeDotsIcon } from "../components/Icons";

function AssignedToMe() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState("list");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Action menu state
  const [activeMenuTaskId, setActiveMenuTaskId] = useState(null);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tasks/assigned");
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch assigned tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await apiClient.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, status: newStatus } : t));
      setActiveMenuTaskId(null);
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => (t.id || t._id) !== taskId));
      setActiveMenuTaskId(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== "All" && task.status !== statusFilter) return false;
    if (priorityFilter !== "All" && (task.priority || "").toLowerCase() !== priorityFilter.toLowerCase()) return false;
    return true;
  });

  const columnsList = ["To Do", "In Progress", "Review", "Done"];

  return (
    <div className="page-wrapper" onClick={() => setActiveMenuTaskId(null)}>
      <Topbar title="Assigned to Me" />

      <main className="assigned-page">
        <div className="assigned-heading">
          <div>
            <h1>Assigned to Me</h1>
            <p>Track and manage tasks across all your boards.</p>
          </div>

          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ListIcon size={14} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={viewMode === "kanban" ? "active" : ""}
              onClick={() => setViewMode("kanban")}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <KanbanIcon size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        <div className="task-filters" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <FilterIcon size={14} />
            <span>Filter by:</span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8" }}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: "#1e1e2e",
                border: "1px solid #3b3b4f",
                borderRadius: "6px",
                color: "#cbd5e1",
                padding: "6px 12px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <option value="All">Status: All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8" }}>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: "#1e1e2e",
                border: "1px solid #3b3b4f",
                borderRadius: "6px",
                color: "#cbd5e1",
                padding: "6px 12px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <option value="All">Priority: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {(statusFilter !== "All" || priorityFilter !== "All") && (
            <button
              type="button"
              onClick={() => { setStatusFilter("All"); setPriorityFilter("All"); }}
              style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {viewMode === "list" ? (
          <div className="assigned-table-wrapper">
            <table className="assigned-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Board</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                      {tasks.length === 0 ? "You have no assigned tasks." : "No tasks match the active filters."}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const taskId = task.id || task._id;
                    return (
                      <tr key={taskId}>
                        <td>
                          <div
                            className={`task-name ${task.status === "Done" ? "completed-task" : ""}`}
                            onClick={() => task.boardId && navigate(`/boards?id=${task.boardId}`)}
                            style={{ cursor: task.boardId ? "pointer" : "default" }}
                            title={task.boardId ? "View on board" : ""}
                          >
                            <span className="task-status-dot"></span>
                            {task.title}
                          </div>
                        </td>

                        <td>
                          <span
                            className="board-chip"
                            onClick={() => task.boardId && navigate(`/boards?id=${task.boardId}`)}
                            style={{ cursor: task.boardId ? "pointer" : "default" }}
                            title="Go to board"
                          >
                            {task.boardId ? "Board " + String(task.boardId).substring(0, 6) : "Workspace"}
                          </span>
                        </td>

                        <td>
                          <span className={`assigned-priority ${(task.priority || "Medium").toLowerCase()}`}>
                            {task.priority || "Medium"}
                          </span>
                        </td>

                        <td>
                          <span className={`assigned-status ${(task.status || "To Do").toLowerCase().replace(" ", "-")}`}>
                            {task.status || "To Do"}
                          </span>
                        </td>

                        <td className={!task.dueDate ? "" : new Date(task.dueDate).toDateString() === new Date().toDateString() ? "due-today" : ""}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}
                        </td>

                        <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="table-action-btn"
                            aria-label="Task options"
                            onClick={() => setActiveMenuTaskId(activeMenuTaskId === taskId ? null : taskId)}
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <ThreeDotsIcon size={16} />
                          </button>

                          {activeMenuTaskId === taskId && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                background: "#1e1e2e",
                                border: "1px solid #3b3b4f",
                                borderRadius: "8px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                                zIndex: 100,
                                width: "160px",
                                overflow: "hidden"
                              }}
                            >
                              {task.boardId && (
                                <button
                                  type="button"
                                  onClick={() => { setActiveMenuTaskId(null); navigate(`/boards?id=${task.boardId}`); }}
                                  style={{ width: "100%", padding: "8px 12px", textAlign: "left", background: "none", border: "none", color: "#cbd5e1", fontSize: "13px", cursor: "pointer" }}
                                >
                                  Open in Board
                                </button>
                              )}
                              {task.status !== "Done" ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(taskId, "Done")}
                                  style={{ width: "100%", padding: "8px 12px", textAlign: "left", background: "none", border: "none", color: "#10b981", fontSize: "13px", cursor: "pointer" }}
                                >
                                  ✓ Mark as Done
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(taskId, "In Progress")}
                                  style={{ width: "100%", padding: "8px 12px", textAlign: "left", background: "none", border: "none", color: "#f59e0b", fontSize: "13px", cursor: "pointer" }}
                                >
                                  ↺ Reopen Task
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(taskId)}
                                style={{ width: "100%", padding: "8px 12px", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: "13px", cursor: "pointer", borderTop: "1px solid #2a2a3e" }}
                              >
                                🗑 Delete Task
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban View of Assigned Tasks */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "20px" }}>
            {columnsList.map((colStatus) => {
              const colTasks = filteredTasks.filter(t => (t.status || "To Do") === colStatus);
              return (
                <div key={colStatus} style={{ background: "#181824", border: "1px solid #2a2a3e", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>{colStatus}</h3>
                    <span style={{ background: "#2a2a3e", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", color: "#94a3b8" }}>
                      {colTasks.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {colTasks.length === 0 ? (
                      <div style={{ padding: "20px 10px", textAlign: "center", color: "#64748b", fontSize: "12px", border: "1px dashed #2a2a3e", borderRadius: "6px" }}>
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <div
                          key={t.id || t._id}
                          onClick={() => t.boardId && navigate(`/boards?id=${t.boardId}`)}
                          style={{
                            background: "#1e1e2e",
                            border: "1px solid #3b3b4f",
                            borderRadius: "8px",
                            padding: "12px",
                            cursor: "pointer",
                            transition: "border-color 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "10px", textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: "#332a4e", color: "#a29bfe", fontWeight: 700 }}>
                              {t.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px" }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                            {t.description || "No description"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : "No due date"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default AssignedToMe;