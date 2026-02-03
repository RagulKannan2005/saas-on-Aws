import React, { useState } from "react";
import "./Security.css";
import { Shield, Key, Smartphone, Monitor } from "lucide-react";

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label className="toggle_switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

const Security = () => {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="security_wrapper">
      {/* Password Section */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Key size={20} className="section_icon" />
            <h3>Password</h3>
          </div>
          <p>Please enter your current password to change your password.</p>
        </div>

        <div className="password_form">
          <div className="form_group full_width">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="form_group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="form_group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
        </div>

        <div
          className="form_actions"
          style={{ marginTop: "1.5rem", borderTop: "none", paddingTop: 0 }}
        >
          <button className="secondary_btn">Update Password</button>
          <span className="forgot_password">Forgot password?</span>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Smartphone size={20} className="section_icon" />
            <h3>Two-Factor Authentication</h3>
          </div>
          <p>Add an extra layer of security to your account.</p>
        </div>

        <div className="notification_item" style={{ marginTop: "1.5rem" }}>
          <div className="item_info">
            <h4>Secure your account</h4>
            <p>
              Two-factor authentication adds an extra layer of security to your
              account. To log in, you'll need to provide a 4 digit amazing code.
            </p>
          </div>
          <ToggleSwitch
            checked={twoFactor}
            onChange={() => setTwoFactor(!twoFactor)}
          />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Monitor size={20} className="section_icon" />
            <h3>Active Sessions</h3>
          </div>
          <p>Manage your active sessions on other devices.</p>
        </div>

        <div className="sessions_list">
          <div className="session_item">
            <Monitor size={24} className="device_icon" />
            <div className="session_details">
              <h4>Windows PC • Chrome</h4>
              <p>
                192.168.1.1 • <span className="active_now">Active now</span>
              </p>
            </div>
            <button className="text_btn">Log out</button>
          </div>

          <div className="session_item">
            <Smartphone size={24} className="device_icon" />
            <div className="session_details">
              <h4>iPhone 13 • Safari</h4>
              <p>192.168.1.5 • 2 hours ago</p>
            </div>
            <button className="text_btn">Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
