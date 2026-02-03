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
import Profile from "./Settings_Components/profile/Profile";
import Account from "./Settings_Components/Account/Account";
import Notification from "./Settings_Components/Notification/Notification";
import Security from "./Settings_Components/Security/Security";
import Privacy from "./Settings_Components/Privacy/Privacy";
import Billing from "./Settings_Components/Billing/Billing";
import Subscription from "./Settings_Components/Subscription/Subscription";
import Help from "./Settings_Components/Help/Help";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  const menuItems = [
    { name: "Profile", icon: User, component: Profile },
    { name: "Account", icon: SettingsIcon, component: Account },
    { name: "Notifications", icon: Bell, component: Notification },
    { name: "Security", icon: Shield, component: Security },
    { name: "Privacy", icon: Lock, component: Privacy },
    { name: "Billing", icon: CreditCard, component: Billing },
    { name: "Subscription", icon: Gem, component: Subscription },
    { name: "Help", icon: HelpCircle, component: Help },
  ];

  const activeMenu = menuItems.find((item) => item.name === activeTab);

  const ActiveComponent = activeMenu?.component;

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
                {ActiveComponent ? (
                  <ActiveComponent />
                ) : (
                  <div className="placeholder_card">
                    <p>Settings for {activeTab} will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
