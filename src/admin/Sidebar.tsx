import React from "react";
import "./dashboard.css";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <button className="toggle-btn" onClick={onToggle}>
          ✖
        </button>
        <ul>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/employee">Employees</NavLink>
          </li>
          <li>
            <NavLink to="/visitors">Visitors</NavLink>
          </li>
        </ul>
      </div>

      {collapsed && (
        <button className="open-btn" onClick={onToggle}>
          ☰
        </button>
      )}
    </>
  );
};

export default Sidebar;
