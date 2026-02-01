import React, { useState, useEffect } from "react";
import {
  Menu,
  LayoutGrid,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper to close sidebar on mobile when a link is clicked
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  const navItems = [
    { title: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { title: "Projects", icon: FolderOpen, path: "/projects" },
    { title: "Tasks", icon: CheckSquare, path: "/tasks" },
    { title: "Team", icon: Users, path: "/teams" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      <div
        className={`overlay ${!collapsed ? "show" : ""}`}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile Toggle Button (Visible only on mobile when sidebar is collapsed) */}
      <div className="mobile_toggle" onClick={() => setCollapsed(false)}>
        <Menu size={24} color="#fff" />
      </div>

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
              <NavLink
                key={item.title}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `title-name ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
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
    </>
  );
};

export default SideBar;
