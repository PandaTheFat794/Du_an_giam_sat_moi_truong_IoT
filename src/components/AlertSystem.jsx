import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export const AlertSystem = ({ alerts, dismissAlert }) => {
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
              <div className="alert-content" style={{ flex: 1 }}>
                <div className="alert-title">{alert.message}</div>
                <div className="alert-time">{alert.time} • {alert.sensor}</div>
              </div>
              <button 
                onClick={() => dismissAlert(alert.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                title="Tắt cảnh báo"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
