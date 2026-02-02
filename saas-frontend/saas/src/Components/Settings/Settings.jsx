import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Lock,
  CreditCard,
  HelpCircle,
  Gem,
} from "lucide-react";
import React, { useState } from "react";
import Headerpart from "../Dashboard/Headerpart";
import "./Setting.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  const menuItems = [
    { name: "Profile", icon: User },
    { name: "Account", icon: SettingsIcon },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
    { name: "Privacy", icon: Lock },
    { name: "Billing", icon: CreditCard },
    { name: "Subscription", icon: Gem },
    { name: "Help", icon: HelpCircle },
  ];

  return (
    <>
      <Headerpart />
      <div className="dashboard_content">
        <div className="settings_container">
          <div className="settings_header">
            <h1>Settings</h1>
            <p>Manage your account and preferences</p>
          </div>
          <div className="settings_body">
            <div className="settings_sidebar">
              <ul className="settings_menu">
                {menuItems.map((item) => (
                  <li
                    key={item.name}
                    className={`settings_menu_item ${
                      activeTab === item.name ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(item.name)}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="settings_content">
              <div className="content_header">
                <h2>{activeTab}</h2>
                <p>Manage your {activeTab.toLowerCase()} settings</p>
              </div>
              <div className="content_body">
                {/* Placeholder content for demonstration */}
                <div className="placeholder_card">
                  <p>Settings for {activeTab} will appear here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
