import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useSensorData } from './hooks/useSensorData';
// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Alarms } from './pages/Alarms';
import { Settings } from './pages/Settings';

function AppContent() {
  const {
    currentData,
    history,
    stats,
    alerts,
    alertHistory,
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
        return <Alarms alerts={alertHistory} />;
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header title={getPageTitle()} />
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;

