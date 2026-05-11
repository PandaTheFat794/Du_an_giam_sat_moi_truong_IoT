import { Clock, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Header = ({ title }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="header">
      <div>
        <div className="header-title">{title || 'Tổng quan'}</div>
      </div>
      <div className="header-right">
        <div className="header-clock">
          <Clock size={16} />
          <div className="header-time-info">
            <span className="header-time">{timeStr}</span>
            <span className="header-date">{dateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
