import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideBar from "../src/Components/Navbar/SideBar";

import Dashboard from "../src/Components/Dashboard/DashBoard";
import Projects from "../src/Components/Projects/Projects";
import Tasks from "../src/Components/Tasks/Tasks";
import Teams from "../src/Components/Teams/Teams";
import Settings from "../src/Components/Settings/Settings";

import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <SideBar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
