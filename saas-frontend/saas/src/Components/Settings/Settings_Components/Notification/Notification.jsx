import React, { useState } from "react";
import "./Notification.css";
import { Mail, Bell, Smartphone, Clock } from "lucide-react";

/**
 * Reusable Toggle Switch Component
 */
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label className="toggle_switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

const Notification = () => {
  // State for notification settings
  const [settings, setSettings] = useState({
    email_news: true,
    email_activity: true,
    email_login: true,
    push_mentions: true,
    push_reminders: false,
    push_comments: true,
    slack_integration: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="notification_wrapper">
      {/* Email Notifications */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Mail size={20} className="section_icon" />
            <h3>Email Notifications</h3>
          </div>
          <p>Manage what emails you receive from us.</p>
        </div>

        <div className="notification_list">
          <div className="notification_item">
            <div className="item_info">
              <h4>News & Updates</h4>
              <p>Get the latest news about features and product updates.</p>
            </div>
            <ToggleSwitch
              checked={settings.email_news}
              onChange={() => handleToggle("email_news")}
            />
          </div>

          <div className="notification_item">
            <div className="item_info">
              <h4>Activity Digest</h4>
              <p>Daily summary of tasks and project activity.</p>
            </div>
            <ToggleSwitch
              checked={settings.email_activity}
              onChange={() => handleToggle("email_activity")}
            />
          </div>

          <div className="notification_item">
            <div className="item_info">
              <h4>Login Alerts</h4>
              <p>Get notified when a new device logs into your account.</p>
            </div>
            <ToggleSwitch
              checked={settings.email_login}
              onChange={() => handleToggle("email_login")}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Smartphone size={20} className="section_icon" />
            <h3>Push Notifications</h3>
          </div>
          <p>Control alerts on your mobile and desktop devices.</p>
        </div>

        <div className="notification_list">
          <div className="notification_item">
            <div className="item_info">
              <h4>Mentions</h4>
              <p>Notify when someone mentions you in a comment.</p>
            </div>
            <ToggleSwitch
              checked={settings.push_mentions}
              onChange={() => handleToggle("push_mentions")}
            />
          </div>

          <div className="notification_item">
            <div className="item_info">
              <h4>Task Reminders</h4>
              <p>Get reminded 1 hour before a task is due.</p>
            </div>
            <ToggleSwitch
              checked={settings.push_reminders}
              onChange={() => handleToggle("push_reminders")}
            />
          </div>

          <div className="notification_item">
            <div className="item_info">
              <h4>New Comments</h4>
              <p>Notify when someone comments on your assigned tasks.</p>
            </div>
            <ToggleSwitch
              checked={settings.push_comments}
              onChange={() => handleToggle("push_comments")}
            />
          </div>
        </div>
      </div>

      {/* Privacy & Others */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Clock size={20} className="section_icon" />
            <h3>Quiet Mode</h3>
          </div>
          <p>Pause specific notifications during focused work hours.</p>
        </div>

        <div className="quiet_mode_card">
          <div className="mode_info">
            <Bell size={20} />
            <div>
              <h4>Pause all notifications</h4>
              <p>Temporarily disable all alerts for 2 hours.</p>
            </div>
          </div>
          <button className="secondary_btn">Pause Now</button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
