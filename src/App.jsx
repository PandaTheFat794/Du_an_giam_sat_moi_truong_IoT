import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useSensorData } from './hooks/useSensorData';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Alarms } from './pages/Alarms';
import { Settings } from './pages/Settings';
import { Placeholder } from './pages/Placeholder';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const {
    currentData,
    history,
    stats,
    alerts,
    thresholds,
    setThresholds,
    dismissAlert,
    alertsEnabled,
    toggleAlertsEnabled,
    apiError,
    isLoading,
    deviceStatus,
    historyFilter,
    setHistoryFilter,
    appliedHistoryFilter,
    applyHistoryFilter,
    clearHistoryFilter,
  } = useSensorData();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Đang tải hệ thống...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          currentData={currentData} 
          history={history} 
          stats={stats}
          alerts={alerts} 
          thresholds={thresholds} 
          dismissAlert={dismissAlert}
          alertsEnabled={alertsEnabled}
          toggleAlertsEnabled={toggleAlertsEnabled}
          apiError={apiError}
          isLoading={isLoading}
          deviceStatus={deviceStatus}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          appliedHistoryFilter={appliedHistoryFilter}
          applyHistoryFilter={applyHistoryFilter}
          clearHistoryFilter={clearHistoryFilter}
        />;
      case 'alarms':
        return <Alarms alerts={alerts} />;
      case 'settings':
        return <Settings thresholds={thresholds} setThresholds={setThresholds} />;
      default:
        return <Dashboard 
          currentData={currentData} 
          history={history} 
          stats={stats}
          alerts={alerts} 
          thresholds={thresholds} 
          dismissAlert={dismissAlert}
          alertsEnabled={alertsEnabled}
          toggleAlertsEnabled={toggleAlertsEnabled}
          apiError={apiError}
          isLoading={isLoading}
          deviceStatus={deviceStatus}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          appliedHistoryFilter={appliedHistoryFilter}
          applyHistoryFilter={applyHistoryFilter}
          clearHistoryFilter={clearHistoryFilter}
        />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Bảng điều khiển';
      case 'alarms': return 'Trung tâm Cảnh báo';
      case 'settings': return 'Cấu hình hệ thống';
      default: return 'Bảng điều khiển';
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} user={user} />
      <div className="main-content">
        <Header title={getPageTitle()} user={user} />
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

