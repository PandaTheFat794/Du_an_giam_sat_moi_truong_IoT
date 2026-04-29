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
  const { currentData, history, alerts, thresholds, setThresholds, curtainOpen, toggleCurtain, dismissAlert } = useSensorData();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          currentData={currentData} 
          history={history} 
          alerts={alerts} 
          thresholds={thresholds} 
          curtainOpen={curtainOpen}
          toggleCurtain={toggleCurtain}
          dismissAlert={dismissAlert}
        />;
      case 'alarms':
        return <Alarms alerts={alerts} />;
      case 'settings':
        return <Settings thresholds={thresholds} setThresholds={setThresholds} />;
      case 'entities':
        return <Placeholder title="Entities Management" />;
      case 'customers':
        return <Placeholder title="Customers" />;
      case 'profiles':
        return <Placeholder title="Profiles" />;
      case 'security':
        return <Placeholder title="Security Settings" />;
      default:
        return <Dashboard 
          currentData={currentData} 
          history={history} 
          alerts={alerts} 
          thresholds={thresholds} 
          curtainOpen={curtainOpen}
          toggleCurtain={toggleCurtain}
          dismissAlert={dismissAlert}
        />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'alarms': return 'Alarms & Warnings';
      case 'entities': return 'Entities';
      case 'customers': return 'Customers';
      case 'profiles': return 'Profiles';
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
