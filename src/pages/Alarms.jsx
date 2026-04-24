import { AlertCircle, AlertTriangle } from 'lucide-react';

export const Alarms = ({ alerts }) => {
  return (
    <div className="card" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Lịch sử Cảnh báo</h2>

      {alerts.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
          Tuyệt vời! Không có cảnh báo nào trong lịch sử.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Thời gian</th>
              <th style={{ padding: '12px' }}>Ngày</th>
              <th style={{ padding: '12px' }}>Cảm biến</th>
              <th style={{ padding: '12px' }}>Trạng thái</th>
              <th style={{ padding: '12px' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{alert.time}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{alert.date}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f1f5f9',
                    fontSize: '13px'
                  }}>
                    {alert.sensor}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: alert.type === 'danger' ? 'var(--danger-color)' : 'var(--secondary-color)' }}>
                    {alert.type === 'danger' ? <AlertCircle size={16} /> : <AlertTriangle size={16} />}
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {alert.type === 'danger' ? 'Báo động' : 'Cảnh báo'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{alert.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
