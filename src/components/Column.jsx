import TaskCard from "./TaskCard";

function Column({ column }) {
  return (
    <section className="board-column">
      <div className="column-header">
        <div className="column-title-wrap">
          <h2>{column.title}</h2>
          <span className="task-count">{column.tasks.length}</span>
        </div>

        <button className="column-menu" aria-label="Column options">
          ⋯
        </button>
      </div>

      <div className="task-list">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <button className="add-task-btn">+ Add Task</button>
    </section>
  );
}

export default Column;