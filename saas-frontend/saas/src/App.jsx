import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import SideBar from "../src/Components/Navbar/SideBar";

import Dashboard from "../src/Components/Dashboard/DashBoard";
import Projects from "../src/Components/Projects/Projects";
import Tasks from "../src/Components/Tasks/Tasks";
import Teams from "../src/Components/Teams/Teams";
import Settings from "../src/Components/Settings/Settings";
import Login from "../src/Components/AuthPages/Login/Login.jsx";
import Register from "../src/Components/AuthPages/Register/Register";
import ErrorPage from "../src/Components/ErrorPage/ErrorPage";
import "./App.css";

function App() {
  const location = useLocation();
  const showSidebarRoutes = [
    "/dashboard",
    "/projects",
    "/tasks",
    "/teams",
    "/settings",
  ];
  const shouldShowSidebar = showSidebarRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  return (
    <AuthProvider>
      <div className="app-layout">
        {shouldShowSidebar && <SideBar />}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
