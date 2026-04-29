import { AlertCircle, AlertTriangle, Bell, BellOff, X } from 'lucide-react';

export const AlertSystem = ({ alerts, dismissAlert, alertsEnabled, toggleAlertsEnabled }) => {
  return (
    <div className="card alerts-container">
      <div className="alerts-header">
        <h3 className="chart-title">Cảnh báo chi tiết</h3>
        <button
          className={`alert-toggle ${alertsEnabled ? 'enabled' : 'disabled'}`}
          onClick={toggleAlertsEnabled}
          title={alertsEnabled ? 'Tắt toàn bộ cảnh báo trên dashboard' : 'Bật lại cảnh báo trên dashboard'}
        >
          {alertsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          {alertsEnabled ? 'Đang bật' : 'Đang tắt'}
        </button>
      </div>

      <div className="alerts-list">
        {!alertsEnabled ? (
          <div className="alert-muted-message">
            Cảnh báo đang tắt. Bật lại để dashboard tiếp tục hiển thị cảnh báo vượt ngưỡng.
          </div>
        ) : alerts.length === 0 ? (
          <div className="alert-muted-message">
            Hệ thống ổn định hoặc cảnh báo hiện tại đã được tắt.
          </div>
        ) : (
          alerts.map((alert) => (
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
                className="dismiss-alert-button"
                title="Tắt cảnh báo này cho đến khi thông số trở lại bình thường"
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
