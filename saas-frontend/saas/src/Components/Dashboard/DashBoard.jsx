import React from "react";
import { Bell, Settings } from "lucide-react";
import "./DashBoard.css";

const DashBoard = () => {
  return (
    //dashboard header
    <>

      <div className="dashboardheader">
        <div className="company_details">
          <h2>Acme Corporation</h2>
          <span>Welcome back, Sarah</span>
        </div>

        <div className="right_section">
          <Bell className="icon" />
          <Settings className="icon" />

          <div className="user_profile"></div>

          <div className="user_info">
            <h3>Sarah Johnson</h3>
            <span>Admin</span>
          </div>
        </div>
      </div>
    <div className="dashboard_content">
      <h1>Dashboard</h1>
    </div>
    </>
  );
};

export default DashBoard;
