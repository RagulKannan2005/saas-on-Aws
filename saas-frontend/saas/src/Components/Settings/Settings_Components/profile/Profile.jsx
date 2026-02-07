import React from "react";
import "./profile.css";
import { Camera } from "lucide-react";

import { useAuth } from "../../../../Context/AuthContext";
import { Copy } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  // Handle both Admin (user.company) and Employee (user.user.tenantId) structures
  const profileData = user?.user || {};
  const tenantId = user?.company?.id || user?.user?.tenantId || "N/A";

  const handleCopy = () => {
    navigator.clipboard.writeText(tenantId);
    alert("Company ID copied to clipboard!");
  };

  return (
    <div className="profile_wrapper">
      <div className="profile_header_section">
        <div className="avatar_upload_container">
          <div className="avatar_placeholder">
            <span className="avatar_initials">
              {profileData.name?.substring(0, 2).toUpperCase() || "JD"}
            </span>
            <div className="camera_icon_overlay">
              <Camera size={16} />
            </div>
          </div>
          <div className="avatar_text">
            <h3>{profileData.name || "User"}</h3>
            <p>{profileData.email}</p>
          </div>
          {/* <button className="upload_btn">Upload New</button>
          <button className="delete_btn">Delete</button> */}
        </div>
      </div>

      <div className="profile_form_container">
        <div className="form_group full_width" style={{ position: "relative" }}>
          <label>Company ID (Share this with employees for login)</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={tenantId}
              readOnly
              style={{ backgroundColor: "#1e1e1e", cursor: "default" }}
            />
            <button
              onClick={handleCopy}
              className="save_changes_btn"
              style={{
                width: "auto",
                padding: "0 15px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>

        <div className="form_group">
          <label>Full Name</label>
          <input type="text" defaultValue={profileData.name} readOnly />
        </div>

        <div className="form_group">
          <label>Email Address</label>
          <input type="email" defaultValue={profileData.email} readOnly />
        </div>

        <div className="form_group">
          <label>Role</label>
          <input
            type="text"
            defaultValue={profileData.role || "Admin"}
            readOnly
          />
        </div>

        {/* Placeholder fields for address, can be implemented later */}
        {/* <div className="form_section_header full_width">
          <h3>Address Information</h3>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
