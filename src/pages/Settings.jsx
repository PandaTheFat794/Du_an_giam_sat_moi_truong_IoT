import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export const Settings = ({ thresholds, setThresholds }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [saved, setSaved] = useState(false);

  const handleChange = (sensor, type, value) => {
    setLocalThresholds(prev => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [type]: Number(value)
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setThresholds(localThresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderInputRow = (label, sensor) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
      <div style={{ width: '150px', fontWeight: '500' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ngưỡng dưới:</span>
        <input 
          type="number" 
          value={localThresholds[sensor].min}
          onChange={(e) => handleChange(sensor, 'min', e.target.value)}
          style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ngưỡng trên:</span>
        <input 
          type="number" 
          value={localThresholds[sensor].max}
          onChange={(e) => handleChange(sensor, 'max', e.target.value)}
          style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
        />
      </div>
    </div>
  );

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '20px' }}>Cài đặt phần mềm</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Tùy chỉnh thông số để tùy biến quy tắc cảnh báo cho hệ thống Dashboard.
      </p>

      <div style={{ marginBottom: '32px', border: '1px solid #f0f0f0', padding: '24px', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="var(--primary-color)" /> Cấu hình Cảm biến ngưỡng (Thresholds)
        </h3>
        
        {renderInputRow('Nhiệt độ (°C)', 'temperature')}
        {renderInputRow('Độ ẩm (%)', 'humidity')}
        {renderInputRow('Ánh sáng (lux)', 'light')}

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleSave}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--primary-color)', color: 'white',
              padding: '10px 20px', borderRadius: '8px', fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            <Save size={18} /> Lưu thay đổi
          </button>
          
          {saved && <span style={{ color: '#10b981', fontWeight: '500', fontSize: '14px' }}>✓ Đã lưu thành công!</span>}
        </div>
      </div>
    </div>
  );
};
