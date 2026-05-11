import { Leaf, Bell, Grid, Settings } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <Grid size={16} /> },
    { id: 'alarms', label: 'Cảnh báo', icon: <Bell size={16} /> },
    { id: 'settings', label: 'Cấu hình', icon: <Settings size={16} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="logo-icon">🌱</div>
          <span>SmartGarden IoT</span>
        </div>

        <div className="nav-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
