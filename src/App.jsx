import { Routes, Route, Navigate } from "react-router";

import Sidebar from "./components/Sidebar";
import ConflictModal from "./components/ConflictModal";
import DatabaseNotification from "./components/DatabaseNotification";

import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import Recent from "./pages/Recent";
import AssignedToMe from "./pages/AssignedToMe";
import Team from "./pages/Team";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { jwtDecode } from "jwt-decode";

import "./App.css";

function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
    return true;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
}

function ProtectedLayout({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

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
          <ProtectedLayout>
            <div className="app-layout">
              <Sidebar />
              <ConflictModal />
              <DatabaseNotification />

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
          </ProtectedLayout>
        }
      />
    </Routes>
  );
}

export default App;