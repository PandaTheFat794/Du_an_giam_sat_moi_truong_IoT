import { SensorCard } from '../components/SensorCard';
import { MainChart } from '../components/MainChart';
import { AlertSystem } from '../components/AlertSystem';

export const Dashboard = ({ currentData, history, alerts, thresholds, curtainOpen, toggleCurtain, dismissAlert }) => {
  // Logic Cảnh báo cho màu sắc Card
  const tempWarning = currentData.temperature > thresholds.temperature.max || currentData.temperature < thresholds.temperature.min;
  const humWarning = currentData.humidity > thresholds.humidity.max || currentData.humidity < thresholds.humidity.min;
  const lightWarning = currentData.light > thresholds.light.max || currentData.light < thresholds.light.min;

  return (
    <div className="dashboard-grid">
      <div className="sensor-card-container">
        <SensorCard
          title="Temperature"
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
          title="Humidity"
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
          title="Light"
          value={currentData.light}
          unit="lux"
          dataKey="light"
          data={history}
          color="#6366f1"
          isWarning={lightWarning}
        />
      </div>

      <div className="sensor-card-container">
        <div className="card sensor-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', cursor: 'pointer' }} onClick={toggleCurtain}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-secondary)' }}>Trạng thái Rèm</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: curtainOpen ? '#3b82f6' : '#64748b' }}>
            {curtainOpen ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', opacity: 0.7 }}>
            (Nhấn để đổi trạng thái)
          </div>
        </div>
      </div>

      <MainChart data={history} />

      <AlertSystem alerts={alerts.slice(0, 5)} dismissAlert={dismissAlert} />
    </div>
  );
};
