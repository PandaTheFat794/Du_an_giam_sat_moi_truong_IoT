import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_HISTORY = 200;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'esp32_01';
const MUTED_ALERTS_KEY = 'greenhouse_muted_alerts';

const emptyData = {
  temperature: 0,
  humidity: 0,
  light: 0,
};

const formatReading = (reading) => {
  if (!reading) return null;

  const createdAt = reading.created_at ? new Date(reading.created_at) : new Date();

  return {
    id: reading.id,
    time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: createdAt.toLocaleDateString(),
    temperature: Number(reading.temperature),
    humidity: Number(reading.humidity),
    light: Number(reading.light),
    created_at: reading.created_at,
  };
};

const loadMutedAlertKeys = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(MUTED_ALERTS_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveMutedAlertKeys = (keys) => {
  localStorage.setItem(MUTED_ALERTS_KEY, JSON.stringify([...keys]));
};

const buildHistoryUrl = (historyFilter) => {
  const params = new URLSearchParams({
    device_id: DEVICE_ID,
    limit: String(MAX_HISTORY),
  });

  if (historyFilter.from) {
    params.set('from', new Date(historyFilter.from).toISOString());
  }

  if (historyFilter.to) {
    params.set('to', new Date(historyFilter.to).toISOString());
  }

  return `${API_URL}/api/readings/history?${params.toString()}`;
};

export const useSensorData = () => {
  const token = localStorage.getItem('token');

  const [currentData, setCurrentData] = useState(emptyData);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ today: null, week: null });
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState({
    status: 'offline',
    last_seen: null,
  });
  const [historyFilter, setHistoryFilter] = useState({
    from: '',
    to: '',
  });
  const [appliedHistoryFilter, setAppliedHistoryFilter] = useState({
    from: '',
    to: '',
  });
  const [thresholds, setThresholds] = useState({
    temperature: { min: 18, max: 32 },
    humidity: { min: 50, max: 80 },
    light: { min: 300, max: 1000 },
  });

  const thresholdsRef = useRef(thresholds);
  const mutedAlertKeysRef = useRef(loadMutedAlertKeys());
  const activeAlertKeysRef = useRef(new Set());

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  const createAlert = ({ key, type, message, sensor, time, date }) => ({
    id: `${key}-${Date.now()}`,
    key,
    type,
    message,
    time,
    date,
    sensor,
  });

  const checkThresholds = useCallback((data, currentThresholds) => {
    if (!data) return;

    if (!alertsEnabled) {
      setAlerts([]);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();
    const detectedAlerts = [];

    if (data.temperature > currentThresholds.temperature.max) {
      detectedAlerts.push(createAlert({
        key: 'temperature_high',
        type: 'danger',
        message: `Nhiệt độ quá cao: ${data.temperature}°C. Gợi ý: Bật quạt thông gió hoặc hệ thống phun sương.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Temperature',
      }));
    } else if (data.temperature < currentThresholds.temperature.min) {
      detectedAlerts.push(createAlert({
        key: 'temperature_low',
        type: 'warning',
        message: `Nhiệt độ quá thấp: ${data.temperature}°C. Gợi ý: Đóng cửa kính hoặc bật đèn sưởi.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Temperature',
      }));
    }

    if (data.humidity > currentThresholds.humidity.max) {
      detectedAlerts.push(createAlert({
        key: 'humidity_high',
        type: 'danger',
        message: `Độ ẩm quá cao: ${data.humidity}%. Gợi ý: Bật quạt thông gió để giảm độ ẩm.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Humidity',
      }));
    } else if (data.humidity < currentThresholds.humidity.min) {
      detectedAlerts.push(createAlert({
        key: 'humidity_low',
        type: 'warning',
        message: `Độ ẩm quá thấp: ${data.humidity}%. Gợi ý: Kích hoạt hệ thống tưới phun sương.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Humidity',
      }));
    }

    if (data.light > currentThresholds.light.max) {
      detectedAlerts.push(createAlert({
        key: 'light_high',
        type: 'warning',
        message: `Ánh sáng quá mạnh: ${data.light} lux. Gợi ý: Đóng rèm che nắng để bảo vệ cây.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Light',
      }));
    } else if (data.light < currentThresholds.light.min) {
      detectedAlerts.push(createAlert({
        key: 'light_low',
        type: 'warning',
        message: `Ánh sáng quá yếu: ${data.light} lux. Gợi ý: Bật đèn chiếu sáng bổ sung.`,
        time: timeStr,
        date: dateStr,
        sensor: 'Light',
      }));
    }

    const detectedKeys = new Set(detectedAlerts.map((alert) => alert.key));
    const mutedKeys = mutedAlertKeysRef.current;

    for (const mutedKey of [...mutedKeys]) {
      if (!detectedKeys.has(mutedKey)) {
        mutedKeys.delete(mutedKey);
      }
    }
    saveMutedAlertKeys(mutedKeys);

    // We no longer locally manage alertsToShow state directly from here
    // as we will fetch them from the backend.
    // However, we can keep track of detectedKeys for UI highlights if needed.
    activeAlertKeysRef.current = detectedKeys;
  }, [alertsEnabled]);

  // Hàm lưu ngưỡng về Backend
  const saveThresholds = async (newThresholds) => {
    try {
      const response = await fetch(`${API_URL}/api/settings/thresholds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThresholds),
      });
      if (response.ok) {
        setThresholds(newThresholds);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi khi lưu ngưỡng:', error);
      return false;
    }
  };

  const fetchSensorData = useCallback(async () => {
    try {
      const [
        latestResponse, 
        historyResponse, 
        devicesResponse, 
        statsResponse, 
        thresholdsResponse, 
        alertsResponse, 
        alertHistoryResponse,
        alertStatusResponse
      ] = await Promise.all([
        fetch(`${API_URL}/api/readings/latest?device_id=${DEVICE_ID}`),
        fetch(buildHistoryUrl(appliedHistoryFilter)),
        fetch(`${API_URL}/api/devices`),
        fetch(`${API_URL}/api/readings/stats?device_id=${DEVICE_ID}`),
        fetch(`${API_URL}/api/settings/thresholds`),
        fetch(`${API_URL}/api/alerts/unresolved?device_id=${DEVICE_ID}`),
        fetch(`${API_URL}/api/alerts/history?device_id=${DEVICE_ID}&limit=50`),
        fetch(`${API_URL}/api/settings/alerts/status`),
      ]);


      if (!latestResponse.ok || !historyResponse.ok || !devicesResponse.ok) {
        throw new Error('Không thể lấy dữ liệu từ backend');
      }

      const latestJson = await latestResponse.json();
      const historyJson = await historyResponse.json();
      const devicesJson = await devicesResponse.json();
      const statsJson = await statsResponse.ok ? await statsResponse.json() : { data: { today: null, week: null } };
      const thresholdsJson = await thresholdsResponse.ok ? await thresholdsResponse.json() : null;
      
      const latest = formatReading(latestJson.data);
      const formattedHistory = Array.isArray(historyJson.data) ? historyJson.data.map(formatReading) : [];
      const currentDevice = Array.isArray(devicesJson.data)
        ? devicesJson.data.find((device) => device.device_code === DEVICE_ID)
        : null;


      if (latest) {
        setCurrentData(latest);
        checkThresholds(latest, thresholdsRef.current);
      }

      if (currentDevice) {
        setDeviceStatus({
          status: currentDevice.status,
          last_seen: currentDevice.last_seen,
        });
      }

      if (statsJson.data) {
        setStats(statsJson.data);
      }

      if (thresholdsJson && thresholdsJson.success) {
        setThresholds(thresholdsJson.data);
      }

      if (alertsResponse.ok) {
        const alertsJson = await alertsResponse.json();
        const formattedAlerts = alertsJson.data.map(a => ({
          id: a.id,
          key: a.alert_type,
          type: a.alert_type.includes('high') || a.alert_type.includes('danger') ? 'danger' : 'warning',
          message: a.message,
          is_resolved: a.is_resolved,
          time: new Date(a.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(a.triggered_at).toLocaleDateString(),
          sensor: a.alert_type.split('_')[0].charAt(0).toUpperCase() + a.alert_type.split('_')[0].slice(1)
        }));
        setAlerts(formattedAlerts);
      }

      if (alertHistoryResponse.ok) {
        const historyJson = await alertHistoryResponse.json();
        const formatted = historyJson.data.map(a => ({
          id: a.id,
          key: a.alert_type,
          type: a.alert_type.includes('high') || a.alert_type.includes('danger') ? 'danger' : 'warning',
          message: a.message,
          is_resolved: a.is_resolved,
          time: new Date(a.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(a.triggered_at).toLocaleDateString(),
          sensor: a.alert_type.split('_')[0].charAt(0).toUpperCase() + a.alert_type.split('_')[0].slice(1)
        }));
        setAlertHistory(formatted);
      }

      if (alertStatusResponse.ok) {
        const statusJson = await alertStatusResponse.json();
        setAlertsEnabled(statusJson.alerts_enabled);
      }

      setHistory(formattedHistory);
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Backend chưa sẵn sàng');
    } finally {
      setIsLoading(false);
    }
  }, [appliedHistoryFilter, checkThresholds]);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  const dismissAlert = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/alerts/${id}/resolve`, {
        method: 'POST',
      });
      if (response.ok) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }
    } catch (error) {
      console.error('Lỗi khi xử lý cảnh báo:', error);
    }
  };

  const toggleAlertsEnabled = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/alerts/toggle`, {
        method: 'POST',
      });
      if (response.ok) {
        const json = await response.json();
        setAlertsEnabled(json.alerts_enabled);
        if (!json.alerts_enabled) {
          setAlerts([]);
        }
      }
    } catch (error) {
      console.error('Lỗi khi bật/tắt cảnh báo:', error);
    }
  };

  const applyHistoryFilter = () => {
    setAppliedHistoryFilter(historyFilter);
  };

  const clearHistoryFilter = () => {
    const emptyFilter = { from: '', to: '' };
    setHistoryFilter(emptyFilter);
    setAppliedHistoryFilter(emptyFilter);
  };

  return {
    currentData,
    history,
    stats,
    alerts,
    alertHistory,
    thresholds,
    setThresholds: saveThresholds, // Ghi đè setThresholds mặc định bằng hàm saveThresholds
    dismissAlert,
    alertsEnabled,
    toggleAlertsEnabled,
    apiError,
    isLoading,
    deviceStatus,
    historyFilter,
    setHistoryFilter,
    appliedHistoryFilter,
    applyHistoryFilter,
    clearHistoryFilter,
  };
};
