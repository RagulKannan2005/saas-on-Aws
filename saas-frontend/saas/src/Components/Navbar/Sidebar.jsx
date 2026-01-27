import React, { useState } from "react";
import {
  Menu,
  LayoutGrid,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const navItems = [
    { title: "Dashboard", icon: LayoutGrid },
    { title: "Projects", icon: FolderOpen },
    { title: "Tasks", icon: CheckSquare },
    { title: "Team", icon: Users },
    { title: "Settings", icon: Settings },
  ];

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* ===== Header ===== */}
      <div className="first_tile_in_navbar">
        <div className="logo" />

        {!collapsed && (
          <div className="company_name">
            <span>ProjectSync</span>
          </div>
        )}

        <div className="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={22} />
        </div>
      </div>

      {/* ===== Navigation Items ===== */}
      <div className="nav-items">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`title-name ${
                active === item.title ? "active" : ""
              }`}
              onClick={() => setActive(item.title)}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.title}</span>}
            </div>
          );
        })}
      </div>

      {/* ===== Divider ===== */}
      <div className="divider" />

      {/* ===== Sign Out ===== */}
      <div className="signout">
        <LogOut size={20} />
        {!collapsed && <span>Sign Out</span>}
      </div>
    </nav>
  );
};

export default SideBar;
