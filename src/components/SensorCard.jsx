import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Thermometer, Droplets, Sun } from 'lucide-react';

const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  light: Sun,
};

export const SensorCard = ({ title, value, unit, dataKey, data, color, isWarning, statusText }) => {
  const Icon = sensorIcons[dataKey] || Thermometer;

  return (
    <div className="card sensor-card" style={{ '--sensor-color': color }}>
      <div className="sensor-card-header">
        <div>
          <div className="sensor-title">{title}</div>
          <div className="sensor-value-container">
            <span className="sensor-value">{value}</span>
            <span className="sensor-unit">{unit}</span>
          </div>
          <div className="sensor-status">
            <span className={`status-dot ${isWarning ? 'inactive' : 'active'}`} />
            <span className="sensor-status-text" style={{ color: isWarning ? 'var(--accent)' : 'var(--secondary)' }}>
              {isWarning ? statusText : 'Bình thường'}
            </span>
          </div>
        </div>
        <div className="sensor-icon-circle" style={{ backgroundColor: `${color}18`, color: color }}>
          <Icon size={20} />
        </div>
      </div>

      {isWarning && (
        <div className="sensor-warning">
          <AlertTriangle size={16} />
        </div>
      )}

      <div className="sensor-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
