import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export const Settings = ({ thresholds, setThresholds }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [saved, setSaved] = useState(false);

  const handleChange = (sensor, type, value) => {
    setLocalThresholds((prev) => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [type]: Number(value),
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setThresholds(localThresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderInputRow = (label, sensor, unit) => (
    <div className="threshold-row">
      <div className="threshold-label">{label}</div>
      <label className="threshold-field">
        <span>Ngưỡng dưới:</span>
        <input
          type="number"
          value={localThresholds[sensor].min}
          onChange={(e) => handleChange(sensor, 'min', e.target.value)}
        />
        <small>{unit}</small>
      </label>
      <label className="threshold-field">
        <span>Ngưỡng trên:</span>
        <input
          type="number"
          value={localThresholds[sensor].max}
          onChange={(e) => handleChange(sensor, 'max', e.target.value)}
        />
        <small>{unit}</small>
      </label>
    </div>
  );

  return (
    <div className="card settings-card">
      <h2>Cài đặt phần mềm</h2>
      <p>
        Tùy chỉnh ngưỡng để dashboard sinh cảnh báo cho mô hình giám sát môi trường cây cà chua.
      </p>

      <div className="threshold-panel">
        <h3>
          <AlertCircle size={18} color="var(--primary-color)" />
          Cấu hình ngưỡng cảm biến
        </h3>

        {renderInputRow('Nhiệt độ', 'temperature', '°C')}
        {renderInputRow('Độ ẩm', 'humidity', '%')}
        {renderInputRow('Ánh sáng', 'light', 'lux')}

        <div className="settings-actions">
          <button onClick={handleSave} className="save-button">
            <Save size={18} /> Lưu thay đổi
          </button>

          {saved && <span>Đã lưu thành công</span>}
        </div>
      </div>
    </div>
  );
};
