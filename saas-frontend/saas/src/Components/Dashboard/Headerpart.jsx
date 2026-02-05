import React from "react";
import { Bell, Settings } from "lucide-react";
import "./Headerpart.css";
import { useAuth } from "../../Context/AuthContext";

const Headerpart = () => {
  const { user } = useAuth();

  const companyname = user?.company?.name || "";
  const role = user?.user?.role || "";
  const username = user?.user?.name || "";

  return (
    <div className="dashboardheader">
      <div className="company_details">
        <h2>{companyname}</h2>
        <span>Welcome back, {username}</span>
      </div>

      <div className="right_section">
        <Bell className="icon" />
        <Settings className="icon" />

        <div className="user_profile"></div>

        <div className="user_info">
          <h3>{username}</h3>
          <span>{role === "COMPANY" ? "Admin" : "User"}</span>
        </div>
      </div>
    </div>
  );
};

export default Headerpart;
