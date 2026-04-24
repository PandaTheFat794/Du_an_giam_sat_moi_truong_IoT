import { SensorCard } from '../components/SensorCard';
import { MainChart } from '../components/MainChart';
import { AlertSystem } from '../components/AlertSystem';

export const Home = ({ currentData, history, alerts, thresholds }) => {
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

      <MainChart data={history} />

      <AlertSystem alerts={alerts.slice(0, 5)} />
    </div>
  );
};
