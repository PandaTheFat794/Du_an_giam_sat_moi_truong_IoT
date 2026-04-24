import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useSensorData } from './hooks/useSensorData';

// Import Pages
import { Home } from './pages/Home';
import { Alarms } from './pages/Alarms';
import { Settings } from './pages/Settings';
import { Placeholder } from './pages/Placeholder';

function App() {
  const { currentData, history, alerts, thresholds, setThresholds } = useSensorData();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
      case 'dashboard':
        return <Home currentData={currentData} history={history} alerts={alerts} thresholds={thresholds} />;
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
        return <Home currentData={currentData} history={history} alerts={alerts} thresholds={thresholds} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Home Dashboard';
      case 'alarms': return 'Alarms & Warnings';
      case 'dashboard': return 'Extended Dashboard';
      case 'entities': return 'Entities';
      case 'customers': return 'Customers';
      case 'profiles': return 'Profiles';
      case 'settings': return 'System Settings';
      case 'security': return 'Security';
      default: return 'Home Dashboard';
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
