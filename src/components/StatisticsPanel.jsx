import { TrendingUp, TrendingDown, Activity, CalendarDays, CalendarRange } from 'lucide-react';
import './StatisticsPanel.css';
import { useState } from 'react';

export const StatisticsPanel = ({ stats }) => {
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'week'
  
  if (!stats) return null;

  const currentStats = stats[viewMode];
  
  if (!currentStats) return null;

  const statItems = [
    { label: 'Nhiệt độ', key: 'temp', unit: '°C', color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Độ ẩm', key: 'hum', unit: '%', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Ánh sáng', key: 'light', unit: ' lux', color: '#10b981', bg: '#ecfdf5' },
  ];

  return (
    <div className="card stats-panel">
      <div className="stats-header">
        <h3 className="card-title">Thống kê tổng hợp</h3>
        <div className="stats-tabs">
          <button 
            className={`stats-tab ${viewMode === 'today' ? 'active' : ''}`}
            onClick={() => setViewMode('today')}
          >
            <CalendarDays size={16} /> Hôm nay
          </button>
          <button 
            className={`stats-tab ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <CalendarRange size={16} /> Tuần này
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.key} className="stat-box" style={{ '--theme-color': item.color, '--theme-bg': item.bg }}>
            <div className="stat-box-header">
              <span className="stat-label">{item.label}</span>
              <Activity size={16} color={item.color} />
            </div>
            
            <div className="stat-main-val">
              <span className="stat-avg">Trung bình:</span>
              <span className="stat-avg-val">{currentStats[`avg_${item.key}`]} {item.unit}</span>
            </div>

            <div className="stat-minmax">
              <div className="stat-min">
                <TrendingDown size={14} color="#ef4444" />
                <span>Min: {currentStats[`min_${item.key}`]}</span>
              </div>
              <div className="stat-max">
                <TrendingUp size={14} color="#22c55e" />
                <span>Max: {currentStats[`max_${item.key}`]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
