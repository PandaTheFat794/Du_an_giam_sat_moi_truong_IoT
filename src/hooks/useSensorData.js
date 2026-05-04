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
        message: `Nhiệt độ báo động: ${data.temperature}°C (vượt ngưỡng ${currentThresholds.temperature.max}°C)`,
        time: timeStr,
        date: dateStr,
        sensor: 'Temperature',
      }));
    } else if (data.temperature < currentThresholds.temperature.min) {
      detectedAlerts.push(createAlert({
        key: 'temperature_low',
        type: 'warning',
        message: `Nhiệt độ thấp: ${data.temperature}°C (dưới ngưỡng ${currentThresholds.temperature.min}°C)`,
        time: timeStr,
        date: dateStr,
        sensor: 'Temperature',
      }));
    }

    if (data.humidity > currentThresholds.humidity.max) {
      detectedAlerts.push(createAlert({
        key: 'humidity_high',
        type: 'danger',
        message: `Độ ẩm báo động: ${data.humidity}% (vượt ngưỡng ${currentThresholds.humidity.max}%)`,
        time: timeStr,
        date: dateStr,
        sensor: 'Humidity',
      }));
    } else if (data.humidity < currentThresholds.humidity.min) {
      detectedAlerts.push(createAlert({
        key: 'humidity_low',
        type: 'warning',
        message: `Độ ẩm quá thấp: ${data.humidity}% (dưới ngưỡng ${currentThresholds.humidity.min}%)`,
        time: timeStr,
        date: dateStr,
        sensor: 'Humidity',
      }));
    }

    if (data.light > currentThresholds.light.max) {
      detectedAlerts.push(createAlert({
        key: 'light_high',
        type: 'warning',
        message: `Ánh sáng quá mạnh: ${data.light} lux (vượt ngưỡng ${currentThresholds.light.max} lux)`,
        time: timeStr,
        date: dateStr,
        sensor: 'Light',
      }));
    } else if (data.light < currentThresholds.light.min) {
      detectedAlerts.push(createAlert({
        key: 'light_low',
        type: 'warning',
        message: `Môi trường quá tối: ${data.light} lux (dưới ngưỡng ${currentThresholds.light.min} lux)`,
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

    const alertsToShow = detectedAlerts.filter((alert) => (
      !mutedKeys.has(alert.key) && !activeAlertKeysRef.current.has(alert.key)
    ));

    activeAlertKeysRef.current = detectedKeys;

    setAlerts((prev) => {
      const stillActiveAlerts = prev.filter((alert) => detectedKeys.has(alert.key));
      return [...alertsToShow, ...stillActiveAlerts].slice(0, 100);
    });
  }, [alertsEnabled]);

  const fetchSensorData = useCallback(async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [latestResponse, historyResponse, devicesResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/readings/latest?device_id=${DEVICE_ID}`, { headers }),
        fetch(buildHistoryUrl(appliedHistoryFilter), { headers }),
        fetch(`${API_URL}/api/devices`, { headers }),
        fetch(`${API_URL}/api/readings/stats?device_id=${DEVICE_ID}`, { headers }),
      ]);


      if (!latestResponse.ok || !historyResponse.ok || !devicesResponse.ok) {
        throw new Error('Không thể lấy dữ liệu từ backend');
      }

      const latestJson = await latestResponse.json();
      const historyJson = await historyResponse.json();
      const devicesJson = await devicesResponse.json();
      const statsJson = await statsResponse.ok ? await statsResponse.json() : { data: { today: null, week: null } };
      
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

  const dismissAlert = (id) => {
    setAlerts((prev) => {
      const dismissedAlert = prev.find((alert) => alert.id === id);

      if (dismissedAlert?.key) {
        const nextMutedKeys = new Set(mutedAlertKeysRef.current);
        nextMutedKeys.add(dismissedAlert.key);
        mutedAlertKeysRef.current = nextMutedKeys;
        saveMutedAlertKeys(nextMutedKeys);
      }

      return prev.filter((alert) => alert.id !== id);
    });
  };

  const toggleAlertsEnabled = () => {
    setAlertsEnabled((enabled) => {
      const nextEnabled = !enabled;

      if (!nextEnabled) {
        setAlerts([]);
      }

      return nextEnabled;
    });
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
    thresholds,
    setThresholds,
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
