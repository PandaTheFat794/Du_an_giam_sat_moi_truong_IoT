import { SensorCard } from '../components/SensorCard';
import { MainChart } from '../components/MainChart';
import { AlertSystem } from '../components/AlertSystem';
import { HistoryTable } from '../components/HistoryTable';
import { StatisticsPanel } from '../components/StatisticsPanel';

export const Dashboard = ({
  currentData,
  history,
  stats,
  alerts,
  thresholds,
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
}) => {
  const getWarningType = (value, sensor) => {
    if (value > thresholds[sensor].max) return 'Quá cao';
    if (value < thresholds[sensor].min) return 'Quá thấp';
    return null;
  };

  const tempWarning = getWarningType(currentData.temperature, 'temperature');
  const humWarning = getWarningType(currentData.humidity, 'humidity');
  const lightWarning = getWarningType(currentData.light, 'light');

  const isDeviceOnline = deviceStatus?.status === 'online';
  const lastSeenText = deviceStatus?.last_seen
    ? new Date(deviceStatus.last_seen).toLocaleString()
    : 'Chưa có dữ liệu';

  return (
    <div className="dashboard-grid">
      {apiError && (
        <div className="api-status warning">
          {apiError}. Kiểm tra backend tại cổng 3001 và kết nối PostgreSQL.
        </div>
      )}

      {isLoading && (
        <div className="api-status">
          Đang tải dữ liệu từ hệ thống IoT...
        </div>
      )}

      <div className="device-status-panel card">
        <div className="device-status-main">
          <span className={`status-dot ${isDeviceOnline ? 'active' : 'inactive'}`} />
          <div>
            <div className="device-status-title">ESP32 nhà kính</div>
            <div className="device-status-meta">Device ID: esp32_01</div>
          </div>
        </div>
        <span className={`device-status-badge ${isDeviceOnline ? 'online' : 'offline'}`}>
          {isDeviceOnline ? 'Online' : 'Offline'}
        </span>
        <div className="device-status-meta">Lần gửi dữ liệu gần nhất: {lastSeenText}</div>
      </div>

      <StatisticsPanel stats={stats} />

      <div className="sensor-card-container">
        <SensorCard
          title="Nhiệt độ"
          value={currentData.temperature}
          unit="°C"
          dataKey="temperature"
          data={history}
          color="#f59e0b"
          isWarning={Boolean(tempWarning)}
          statusText={tempWarning}
        />
      </div>

      <div className="sensor-card-container">
        <SensorCard
          title="Độ ẩm"
          value={currentData.humidity}
          unit="%"
          dataKey="humidity"
          data={history}
          color="#3b82f6"
          isWarning={Boolean(humWarning)}
          statusText={humWarning}
        />
      </div>

      <div className="sensor-card-container">
        <SensorCard
          title="Ánh sáng"
          value={currentData.light}
          unit="lux"
          dataKey="light"
          data={history}
          color="#6366f1"
          isWarning={Boolean(lightWarning)}
          statusText={lightWarning}
        />
      </div>

      <MainChart data={history} />

      <AlertSystem
        alerts={alerts.slice(0, 5)}
        dismissAlert={dismissAlert}
        alertsEnabled={alertsEnabled}
        toggleAlertsEnabled={toggleAlertsEnabled}
      />

      <HistoryTable
        data={history}
        historyFilter={historyFilter}
        setHistoryFilter={setHistoryFilter}
        appliedHistoryFilter={appliedHistoryFilter}
        applyHistoryFilter={applyHistoryFilter}
        clearHistoryFilter={clearHistoryFilter}
      />
    </div>
  );
};
