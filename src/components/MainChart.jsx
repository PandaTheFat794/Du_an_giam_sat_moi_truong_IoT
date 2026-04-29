import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MainChart = ({ data }) => {
  return (
    <div className="card main-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Lịch sử Cảm biến</h3>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
              formatter={(value, name) => [
                value + (name === 'temperature' ? ' °C' : name === 'humidity' ? ' %' : ' lux'),
                name === 'temperature' ? 'Temperature' : name === 'humidity' ? 'Humidity' : 'Light'
              ]}
            />
            <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" />
            <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHum)" />
            <Area type="monotone" dataKey="light" stroke="#6366f1" fillOpacity={1} fill="url(#colorLight)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
