import { Activity, Bell, Grid, Home, Users, Settings, Shield, Box, LayoutTemplate } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'alarms', label: 'Alarms', icon: <Bell size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Grid size={20} /> },
    { id: 'entities', label: 'Entities', icon: <Box size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'profiles', label: 'Profiles', icon: <LayoutTemplate size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Activity size={24} />
        </div>
        <span>Cooperative</span>
      </div>
      
      <div className="nav-menu">
        {menuItems.map(item => (
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
  );
};
