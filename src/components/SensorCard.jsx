import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Thermometer, Droplets, Sun } from 'lucide-react';

const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  light: Sun,
};

export const SensorCard = ({ title, value, unit, dataKey, data, color, isWarning }) => {
  const Icon = sensorIcons[dataKey] || Thermometer;

  return (
    <div className="card sensor-card" style={{ '--sensor-color': color }}>
      <div className="sensor-card-header">
        <div className="sensor-title">
          <div className="sensor-icon-circle" style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon size={18} />
          </div>
          {title}
        </div>
        {isWarning && (
          <div className="sensor-warning">
            <AlertTriangle size={20} />
          </div>
        )}
      </div>

      <div className="sensor-value-container">
        <span className="sensor-value">{value}</span>
        <span className="sensor-unit">{unit}</span>
      </div>

      <div className="sensor-status">
        <span className={`status-dot ${isWarning ? 'inactive' : 'active'}`}></span>
        <span className="sensor-status-text">
          {isWarning ? 'Vượt ngưỡng' : 'Bình thường'}
        </span>
      </div>

      <div className="sensor-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
