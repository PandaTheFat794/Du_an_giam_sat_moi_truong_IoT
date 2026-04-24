import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export const SensorCard = ({ title, value, unit, dataKey, data, color, isWarning }) => {
  return (
    <div className="card sensor-card">
      <div className="sensor-card-header">
        <div className="sensor-title">
          <span className={`status-dot ${isWarning ? 'inactive' : 'active'}`}></span>
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

      <div className="sensor-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
