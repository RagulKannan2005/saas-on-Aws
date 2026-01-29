import React from "react";
import Headerpart from "./Headerpart";
import { FileText,Clock,CheckCircle,AlertCircle } from "lucide-react";
import "./DashBoard.css";
import StatsCard from "../Card/StateCard";
const DashBoard = () => {
  return (
    //dashboard header
    <>
      <div className="dashboard_content">
        <Headerpart />
        <div className="project_detail_container">
          <div className="dashboard_content" style={{ padding: "20px" }}>
            <h1>Dashboard</h1>
            <p>Welcome to your project management hub</p>
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
      </div>
    </>
  );
};

export default DashBoard;
