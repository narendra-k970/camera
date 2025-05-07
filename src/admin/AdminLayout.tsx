import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './dashboard.css';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`admin-layout ${collapsed ? 'full-width' : ''}`}>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};


export default AdminLayout;
