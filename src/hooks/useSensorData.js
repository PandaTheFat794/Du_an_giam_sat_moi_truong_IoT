import { useState, useEffect, useRef } from 'react';

const MAX_HISTORY = 20;

export const useSensorData = () => {
  const [currentData, setCurrentData] = useState({
    temperature: 25,
    humidity: 50,
    light: 400
  });

  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({
    temperature: { min: 10, max: 35 },
    humidity: { min: 30, max: 80 },
    light: { min: 100, max: 800 }
  });

  // Sử dụng ref cho thresholds để setTimeout luôn lấy được giá trị mới nhất
  const thresholdsRef = useRef(thresholds);

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  useEffect(() => {
    // Khởi tạo lịch sử ban đầu
    const initialHistory = Array.from({ length: MAX_HISTORY }).map((_, i) => {
      const time = new Date();
      time.setSeconds(time.getSeconds() - (MAX_HISTORY - i) * 3);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: 25 + Math.random() * 5 - 2.5,
        humidity: 50 + Math.random() * 10 - 5,
        light: 400 + Math.random() * 100 - 50
      };
    });
    setHistory(initialHistory);

    const interval = setInterval(() => {
      setCurrentData(prev => {
        const newTemp = prev.temperature + (Math.random() * 4 - 2);
        const newHum = prev.humidity + (Math.random() * 8 - 4);
        const newLight = prev.light + (Math.random() * 100 - 50);

        const newData = {
          temperature: Math.max(0, Math.min(60, Number(newTemp.toFixed(1)))),
          humidity: Math.max(0, Math.min(100, Number(newHum.toFixed(1)))),
          light: Math.max(0, Math.min(2000, Math.round(newLight)))
        };

        // Kiểm tra và sinh cảnh báo sử dụng current thresholds
        checkThresholds(newData, thresholdsRef.current);

        // Cập nhật lịch sử
        setHistory(prevHistory => {
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newHistoryItem = { time: now, ...newData };
          return [...prevHistory.slice(1), newHistoryItem];
        });

        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const checkThresholds = (data, currentThresholds) => {
    const newAlerts = [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();

    if (data.temperature > currentThresholds.temperature.max) {
      newAlerts.push({ id: Date.now() + 1, type: 'danger', message: `Nhiệt độ báo động: ${data.temperature}°C (Vượt ngưỡng ${currentThresholds.temperature.max})`, time: timeStr, date: dateStr, sensor: 'Temperature' });
    } else if (data.temperature < currentThresholds.temperature.min) {
      newAlerts.push({ id: Date.now() + 1, type: 'warning', message: `Nhiệt độ thấp: ${data.temperature}°C (Dưới ngưỡng ${currentThresholds.temperature.min})`, time: timeStr, date: dateStr, sensor: 'Temperature' });
    }

    if (data.humidity > currentThresholds.humidity.max) {
      newAlerts.push({ id: Date.now() + 2, type: 'danger', message: `Độ ẩm báo động: ${data.humidity}% (Vượt ngưỡng ${currentThresholds.humidity.max})`, time: timeStr, date: dateStr, sensor: 'Humidity' });
    } else if (data.humidity < currentThresholds.humidity.min) {
      newAlerts.push({ id: Date.now() + 2, type: 'warning', message: `Độ ẩm quá thấp: ${data.humidity}% (Dưới ngưỡng ${currentThresholds.humidity.min})`, time: timeStr, date: dateStr, sensor: 'Humidity' });
    }

    if (data.light > currentThresholds.light.max) {
      newAlerts.push({ id: Date.now() + 3, type: 'warning', message: `Ánh sáng quá chói: ${data.light} lux (Vượt ngưỡng ${currentThresholds.light.max})`, time: timeStr, date: dateStr, sensor: 'Light' });
    } else if (data.light < currentThresholds.light.min) {
      newAlerts.push({ id: Date.now() + 3, type: 'warning', message: `Môi trường quá tối: ${data.light} lux (Dưới ngưỡng ${currentThresholds.light.min})`, time: timeStr, date: dateStr, sensor: 'Light' });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Có thể lưu nhiều cảnh báo hơn để xem ở trang Alarms
        const combined = [...newAlerts, ...prev];
        return combined.slice(0, 100); // Lưu 100 cảnh báo gần nhất
      });
    }
  };

  return { currentData, history, alerts, thresholds, setThresholds };
};
