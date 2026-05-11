import { AlertCircle, AlertTriangle } from 'lucide-react';

export const Alarms = ({ alerts }) => {
  return (
    <div className="card" style={{ overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Lịch sử cảnh báo
      </h2>

      {alerts.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>
          Không có cảnh báo nào trong lịch sử.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Ngày</th>
              <th>Cảm biến</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id} style={{ opacity: alert.is_resolved ? 0.7 : 1 }}>
                <td style={{ fontWeight: 600 }}>{alert.time}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{alert.date}</td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}>
                    {alert.sensor}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: alert.type === 'danger' ? 'var(--danger)' : 'var(--accent)' }}>
                      {alert.type === 'danger' ? <AlertCircle size={15} /> : <AlertTriangle size={15} />}
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {alert.type === 'danger' ? 'Báo động' : 'Cảnh báo'}
                      </span>
                    </div>
                    {alert.is_resolved ? (
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>✓ Đã xử lý</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>• Đang xảy ra</span>
                    )}
                  </div>
                </td>
                <td style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{alert.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
