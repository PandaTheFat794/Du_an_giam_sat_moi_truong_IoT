import { AlertCircle, AlertTriangle } from 'lucide-react';

export const AlertSystem = ({ alerts }) => {
  return (
    <div className="card alerts-container">
      <div className="chart-header">
        <h3 className="chart-title">Cảnh báo Thời gian thực</h3>
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
            Hệ thống ổn định, không có cảnh báo.
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'danger' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.message}</div>
                <div className="alert-time">{alert.time} • {alert.sensor}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
