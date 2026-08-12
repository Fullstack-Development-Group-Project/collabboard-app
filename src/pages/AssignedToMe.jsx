import Topbar from "../components/Topbar";

function AssignedToMe() {
  const tasks = [
    {
      name: "Finalize Q3 Marketing Budget",
      board: "Marketing Strategy",
      priority: "High",
      status: "Doing",
      dueDate: "Today",
    },
    {
      name: "Review Design System Updates",
      board: "Product Development",
      priority: "Medium",
      status: "To Do",
      dueDate: "Oct 15, 2026",
    },
    {
      name: "Client Onboarding: Acme Corp",
      board: "Customer Success",
      priority: "High",
      status: "To Do",
      dueDate: "Oct 16, 2026",
    },
    {
      name: "Prepare Monthly Analytics Report",
      board: "Data & Insights",
      priority: "Low",
      status: "Done",
      dueDate: "Oct 10, 2026",
    },
  ];

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
              {tasks.map((task) => (
                <tr key={task.name}>
                  <td>
                    <div
                      className={`task-name ${
                        task.status === "Done" ? "completed-task" : ""
                      }`}
                    >
                      <span className="task-status-dot"></span>
                      {task.name}
                    </div>
                  </td>

                  <td>
                    <span className="board-chip">{task.board}</span>
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
                      task.dueDate === "Today" ? "due-today" : ""
                    }
                  >
                    {task.dueDate}
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
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AssignedToMe;