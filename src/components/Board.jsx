import Column from "./Column";

function Board({ board }) {
  return (
    <div className="board-area">
      <div className="board-heading">
        <div>
          <p className="board-label">My Boards</p>
          <h1>{board.title}</h1>
        </div>

        <div className="board-status">
          <span className="status-dot"></span>
          Live — syncing
        </div>
      </div>

      <div className="board-columns">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}

export default Board;