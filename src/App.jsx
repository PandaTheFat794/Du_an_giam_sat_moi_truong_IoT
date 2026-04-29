import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useSensorData } from './hooks/useSensorData';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Alarms } from './pages/Alarms';
import { Settings } from './pages/Settings';
import { Placeholder } from './pages/Placeholder';

function App() {
  const {
    currentData,
    history,
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          currentData={currentData} 
          history={history} 
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
      case 'security':
        return <Placeholder title="Security Settings" />;
      default:
        return <Dashboard 
          currentData={currentData} 
          history={history} 
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
      case 'dashboard': return 'Dashboard';
      case 'alarms': return 'Alarms & Warnings';
      case 'settings': return 'System Settings';
      case 'security': return 'Security';
      default: return 'Dashboard';
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

export default App;
