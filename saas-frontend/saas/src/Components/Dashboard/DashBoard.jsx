import React, { useState } from "react";
import Headerpart from "./Headerpart";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import "./DashBoard.css";
import StatsCard from "../Card/StateCard";
import TaskCompletionDonut from "../charts/TaskCompletionDonut";
import ActivityBarChart from "../charts/ActivityBarChart";
import RecentWork from "../RecentWork/RecentWork";

const chartData = {
  January: {
    bar: [
      { status: "TODO", value: 30 },
      { status: "IN_PROGRESS", value: 45 },
      { status: "BLOCKED", value: 18 },
      { status: "DONE", value: 55 },
    ],
    donut: [
      { name: "Completed", value: 35 },
      { name: "In Progress", value: 45 },
      { name: "Blocked", value: 15 },
      { name: "Todo", value: 35 },
    ],
  },
  February: {
    bar: [
      { status: "TODO", value: 20 },
      { status: "IN_PROGRESS", value: 35 },
      { status: "BLOCKED", value: 10 },
      { status: "DONE", value: 65 },
    ],
    donut: [
      { name: "Completed", value: 50 },
      { name: "In Progress", value: 30 },
      { name: "Blocked", value: 10 },
      { name: "Todo", value: 10 },
    ],
  },
  March: {
    bar: [
      { status: "TODO", value: 40 },
      { status: "IN_PROGRESS", value: 25 },
      { status: "BLOCKED", value: 20 },
      { status: "DONE", value: 45 },
    ],
    donut: [
      { name: "Completed", value: 40 },
      { name: "In Progress", value: 35 },
      { name: "Blocked", value: 5 },
      { name: "Todo", value: 20 },
    ],
  },
};

const DashBoard = () => {
  const [selectedMonth, setSelectedMonth] = useState("January");

  return (
    //dashboard header
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
            </select>
          </div>

          <div className="project_overview_container">
            <StatsCard title="Total Projects" value="12" icon={<FileText />} />
            <StatsCard title="Total Tasks" value="147" icon={<Clock />} />
            <StatsCard
              title="Completed Tasks"
              value="89"
              icon={<CheckCircle />}
            />
            <StatsCard title="Overdue Tasks" value="8" icon={<AlertCircle />} />
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
            <ActivityBarChart data={chartData[selectedMonth].bar} />
          </div>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <TaskCompletionDonut data={chartData[selectedMonth].donut} />
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
