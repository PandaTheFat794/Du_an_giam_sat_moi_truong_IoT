import { Activity, Bell, Grid, Settings, Shield, LogOut, User } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <Grid size={20} /> },
    { id: 'alarms', label: 'Cảnh báo', icon: <Bell size={20} /> },
    { id: 'settings', label: 'Cấu hình', icon: <Settings size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Activity size={24} />
        </div>
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

      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.full_name || user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

