import React, { useState, useEffect } from "react";
import Headerpart from "./Headerpart";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import "./DashBoard.css";
import StatsCard from "../Card/StateCard";
import TaskCompletionDonut from "../charts/TaskCompletionDonut";
import ActivityBarChart from "../charts/ActivityBarChart";
import RecentWork from "../RecentWork/RecentWork";
import axios from "axios";

const DashBoard = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects and tasks data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const allTasks = projects.flatMap((project) => project.tasks || []);
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => task.status === "DONE",
    ).length;

    // Calculate overdue tasks (due_date in the past and not completed)
    const now = new Date();
    const overdueTasks = allTasks.filter((task) => {
      if (!task.due_date || task.status === "DONE") return false;
      const dueDate = new Date(task.due_date);
      return dueDate < now;
    }).length;

    return { totalProjects, totalTasks, completedTasks, overdueTasks };
  };

  // Generate chart data based on selected month
  const generateChartData = () => {
    const allTasks = projects.flatMap((project) => project.tasks || []);

    // Filter tasks by selected month
    const monthIndex = new Date(
      Date.parse(selectedMonth + " 1, 2026"),
    ).getMonth();
    const tasksInMonth = allTasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.getMonth() === monthIndex;
    });

    // Count by status
    const statusCounts = {
      TODO: tasksInMonth.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: tasksInMonth.filter((t) => t.status === "IN_PROGRESS")
        .length,
      BLOCKED: tasksInMonth.filter((t) => t.status === "BLOCKED").length,
      DONE: tasksInMonth.filter((t) => t.status === "DONE").length,
    };

    const barData = [
      { status: "TODO", value: statusCounts.TODO },
      { status: "IN_PROGRESS", value: statusCounts.IN_PROGRESS },
      { status: "BLOCKED", value: statusCounts.BLOCKED },
      { status: "DONE", value: statusCounts.DONE },
    ];

    const donutData = [
      { name: "Completed", value: statusCounts.DONE },
      { name: "In Progress", value: statusCounts.IN_PROGRESS },
      { name: "Blocked", value: statusCounts.BLOCKED },
      { name: "Todo", value: statusCounts.TODO },
    ];

    return { bar: barData, donut: donutData };
  };

  const stats = calculateStats();
  const chartData = generateChartData();

  if (loading) {
    return (
      <>
        <Headerpart />
        <div className="dashboard_content">
          <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
            Loading dashboard data...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Headerpart />
        <div className="dashboard_content">
          <div
            style={{ textAlign: "center", padding: "50px", color: "#ff6b6b" }}
          >
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Headerpart />
      <div className="dashboard_content">
        <div className="project_detail_container">
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h1>Dashboard</h1>
              <p>Welcome to your project management hub</p>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: "#141414",
                color: "white",
                border: "1px solid #333",
                padding: "8px 16px",
                borderRadius: "8px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div className="project_overview_container">
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects.toString()}
              icon={<FileText />}
            />
            <StatsCard
              title="Total Tasks"
              value={stats.totalTasks.toString()}
              icon={<Clock />}
            />
            <StatsCard
              title="Completed Tasks"
              value={stats.completedTasks.toString()}
              icon={<CheckCircle />}
            />
            <StatsCard
              title="Overdue Tasks"
              value={stats.overdueTasks.toString()}
              icon={<AlertCircle />}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <div style={{ flex: 2, minWidth: "300px" }}>
            <ActivityBarChart data={chartData.bar} />
          </div>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <TaskCompletionDonut data={chartData.donut} />
          </div>
        </div>
        <div className="recentwork">
          <RecentWork />
        </div>
      </div>
    </>
  );
};

export default DashBoard;
