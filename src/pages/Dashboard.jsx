import { SensorCard } from '../components/SensorCard';
import { MainChart } from '../components/MainChart';
import { AlertSystem } from '../components/AlertSystem';
import { HistoryTable } from '../components/HistoryTable';

export const Dashboard = ({
  currentData,
  history,
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
  const tempWarning = currentData.temperature > thresholds.temperature.max || currentData.temperature < thresholds.temperature.min;
  const humWarning = currentData.humidity > thresholds.humidity.max || currentData.humidity < thresholds.humidity.min;
  const lightWarning = currentData.light > thresholds.light.max || currentData.light < thresholds.light.min;
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

      <div className="sensor-card-container">
        <SensorCard
          title="Nhiệt độ"
          value={currentData.temperature}
          unit="°C"
          dataKey="temperature"
          data={history}
          color="#f59e0b"
          isWarning={tempWarning}
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
          isWarning={humWarning}
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
          isWarning={lightWarning}
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
