import { Routes, Route } from "react-router";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import Recent from "./pages/Recent";
import AssignedToMe from "./pages/AssignedToMe";
import Team from "./pages/Team";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Authentication Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Workspace */}
      <Route
        path="*"
        element={
          <div className="app-layout">
            <Sidebar />

            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/boards" element={<BoardPage />} />
                <Route path="/recent" element={<Recent />} />
                <Route path="/assigned" element={<AssignedToMe />} />
                <Route path="/team" element={<Team />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;