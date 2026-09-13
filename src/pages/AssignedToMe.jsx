import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiClient from "../API/client";

function AssignedToMe() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const response = await apiClient.get("/tasks/assigned");
        setTasks(response.data || []);
      } catch (error) {
        console.error("Failed to fetch assigned tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedTasks();
  }, []);

  return (
    <div className="page-wrapper">
      <Topbar title="Assigned to Me" />

      <main className="assigned-page">
        <div className="assigned-heading">
          <div>
            <h1>Assigned to Me</h1>
            <p>Track and manage tasks across all your boards.</p>
          </div>

          <div className="view-toggle">
            <button className="active">List</button>
            <button>Kanban</button>
          </div>
        </div>

        <div className="task-filters">
          <span>☰ Filter by:</span>
          <button>Status: All</button>
          <button>Priority: All</button>
        </div>

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
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    You have no assigned tasks.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id || task._id}>
                    <td>
                      <div
                        className={`task-name ${
                          task.status === "Done" ? "completed-task" : ""
                        }`}
                      >
                        <span className="task-status-dot"></span>
                        {task.title}
                      </div>
                    </td>

                    <td>
                      <span className="board-chip">{task.boardId ? "Board ID: " + task.boardId.substring(0,6) : "N/A"}</span>
                    </td>

                    <td>
                      <span
                        className={`assigned-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`assigned-status ${task.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td
                      className={
                        !task.dueDate ? "" : new Date(task.dueDate).toDateString() === new Date().toDateString() ? "due-today" : ""
                      }
                    >
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}
                    </td>

                    <td>
                      <button
                        className="table-action-btn"
                        aria-label="Task options"
                      >
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AssignedToMe;