import React from "react";
import "./Account.css";
import { AlertTriangle, Download } from "lucide-react";

const Account = () => {
  return (
    <div className="account_wrapper">
      <div className="account_section">
        <div className="section_header">
          <h3>Personal Information</h3>
          <p>Manage your personal account details.</p>
        </div>

        <div className="account_form_grid">
          <div className="form_group">
            <label>Email Address</label>
            <div className="input_with_badge">
              <input type="email" defaultValue="user@example.com" disabled />
              <span className="badge verified">Verified</span>
            </div>
            <p className="helper_text">Contact support to change your email.</p>
          </div>

          <div className="form_group">
            <label>Username</label>
            <div className="input_prefix_wrapper">
              <span className="input_prefix">saas.com/</span>
              <input type="text" defaultValue="johndoe" />
            </div>
          </div>
        </div>
      </div>

      <div className="account_section">
        <div className="section_header">
          <h3>Regional Preferences</h3>
          <p>Set your language and timezone.</p>
        </div>

        <div className="account_form_grid">
          <div className="form_group">
            <label>Language</label>
            <select defaultValue="en">
              <option value="en">English (United States)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="form_group">
            <label>Timezone</label>
            <select defaultValue="utc-5">
              <option value="utc-8">Pacific Time (UTC-08:00)</option>
              <option value="utc-5">Eastern Time (UTC-05:00)</option>
              <option value="utc+0">Greenwich Mean Time (UTC+0)</option>
              <option value="utc+1">Central European Time (UTC+01:00)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="account_section">
        <div className="section_header">
          <h3>Data Export</h3>
          <p>Download a copy of your data.</p>
        </div>
        <div className="export_card">
          <div className="export_info">
            <Download size={20} />
            <div>
              <h4>Export your data</h4>
              <p>
                Download all your projects, tasks, and settings in JSON format.
              </p>
            </div>
          </div>
          <button className="export_btn">Export Data</button>
        </div>
      </div>

      <div className="account_section danger_zone">
        <div className="section_header">
          <h3 className="danger_text">Danger Zone</h3>
          <p>Irreversible and destructive actions.</p>
        </div>

        <div className="danger_card">
          <div className="danger_info">
            <AlertTriangle size={20} className="danger_icon" />
            <div>
              <h4>Delete Account</h4>
              <p>
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
          </div>
          <button className="delete_account_btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Account;
