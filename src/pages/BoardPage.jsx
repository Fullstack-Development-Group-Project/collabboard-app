import Topbar from "../components/Topbar";
import Board from "../components/Board";
import mockData from "../mockData.json";

function BoardPage() {
  return (
    <div className="page-wrapper">
      <Topbar title="Website Redesign" />

      <main className="content-area">
        <Board board={mockData.board} />
      </main>
    </div>
  );
}

export default BoardPage;