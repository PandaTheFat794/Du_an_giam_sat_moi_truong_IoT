import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';
import * as authController from './controllers/authController.js';
import { authenticateToken } from './middleware/authMiddleware.js';


dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const defaultDeviceId = process.env.DEFAULT_DEVICE_ID || 'esp32_01';
const iotApiKey = process.env.IOT_API_KEY || '';
const greenhouseThresholds = {
  temperature: { min: 18, max: 32 },
  humidity: { min: 50, max: 80 },
  light: { min: 300, max: 1000 },
};
const sensorInputRanges = {
  temperature: { min: -10, max: 80, unit: '°C' },
  humidity: { min: 0, max: 100, unit: '%' },
  light: { min: 0, max: 100000, unit: 'lux' },
};

app.use(cors());
app.use(express.json());

const requireApiKey = (req, res, next) => {
  if (!iotApiKey) {
    return next();
  }

  const requestApiKey = req.get('x-api-key');

  if (requestApiKey !== iotApiKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key.' });
  }

  return next();
};

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const validateSensorRanges = ({ temperature, humidity, light }) => {
  const values = { temperature, humidity, light };

  for (const [field, range] of Object.entries(sensorInputRanges)) {
    const value = values[field];

    if (value < range.min || value > range.max) {
      return `${field} must be between ${range.min} and ${range.max}${range.unit}.`;
    }
  }

  return null;
};

const buildHistoryQuery = ({ deviceId, limit, from, to }) => {
  const conditions = ['device_id = $1'];
  const params = [deviceId];

  if (from) {
    params.push(new Date(String(from)));
    conditions.push(`created_at >= $${params.length}`);
  }

  if (to) {
    params.push(new Date(String(to)));
    conditions.push(`created_at <= $${params.length}`);
  }

  params.push(limit);

  return {
    text: `SELECT * FROM (
      SELECT * FROM sensor_readings
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length}
    ) recent
    ORDER BY created_at ASC, id ASC`,
    params,
  };
};

const mapReading = (row) => ({
  id: row.id,
  device_id: row.device_id,
  temperature: Number(row.temperature),
  humidity: Number(row.humidity),
  light: Number(row.light),
  created_at: row.created_at,
});

const mapDevice = (row) => ({
  id: row.id,
  device_code: row.device_code,
  device_name: row.device_name,
  location: row.location,
  status: row.status,
  last_seen: row.last_seen,
  created_at: row.created_at,
});

const buildAlerts = ({ deviceId, temperature, humidity, light }) => {
  const alerts = [];

  if (temperature > greenhouseThresholds.temperature.max) {
    alerts.push(['temperature_high', `Nhiệt độ cao: ${temperature}°C, vượt ngưỡng ${greenhouseThresholds.temperature.max}°C`]);
  } else if (temperature < greenhouseThresholds.temperature.min) {
    alerts.push(['temperature_low', `Nhiệt độ thấp: ${temperature}°C, dưới ngưỡng ${greenhouseThresholds.temperature.min}°C`]);
  }

  if (humidity > greenhouseThresholds.humidity.max) {
    alerts.push(['humidity_high', `Độ ẩm cao: ${humidity}%, vượt ngưỡng ${greenhouseThresholds.humidity.max}%`]);
  } else if (humidity < greenhouseThresholds.humidity.min) {
    alerts.push(['humidity_low', `Độ ẩm thấp: ${humidity}%, dưới ngưỡng ${greenhouseThresholds.humidity.min}%`]);
  }

  if (light > greenhouseThresholds.light.max) {
    alerts.push(['light_high', `Ánh sáng mạnh: ${light} lux, vượt ngưỡng ${greenhouseThresholds.light.max} lux`]);
  } else if (light < greenhouseThresholds.light.min) {
    alerts.push(['light_low', `Ánh sáng yếu: ${light} lux, dưới ngưỡng ${greenhouseThresholds.light.min} lux`]);
  }

  return alerts.map(([alertType, message]) => ({ deviceId, alertType, message }));
};

const updateDeviceSeen = async (deviceId) => {
  await query(
    `INSERT INTO devices (device_code, device_name, location, status, last_seen)
     VALUES ($1, $2, $3, 'online', CURRENT_TIMESTAMP)
     ON CONFLICT (device_code)
     DO UPDATE SET status = 'online', last_seen = CURRENT_TIMESTAMP`,
    [deviceId, `ESP32 ${deviceId}`, 'Mô hình nhà kính cà chua'],
  );
};

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authenticateToken, authController.getMe);


app.post('/api/readings', requireApiKey, async (req, res) => {
  const deviceId = String(req.body.device_id || '').trim();
  const temperature = toNumber(req.body.temperature);
  const humidity = toNumber(req.body.humidity);
  const light = toNumber(req.body.light);

  if (!deviceId || temperature === null || humidity === null || light === null) {
    return res.status(400).json({
      success: false,
      message: 'device_id, temperature, humidity, and light are required. Sensor values must be numbers.',
    });
  }

  const rangeError = validateSensorRanges({ temperature, humidity, light });

  if (rangeError) {
    return res.status(400).json({ success: false, message: rangeError });
  }

  try {
    await updateDeviceSeen(deviceId);

    const result = await query(
      `INSERT INTO sensor_readings (device_id, temperature, humidity, light)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [deviceId, temperature, humidity, light],
    );

    const generatedAlerts = buildAlerts({ deviceId, temperature, humidity, light });

    for (const alert of generatedAlerts) {
      await query(
        `INSERT INTO alerts (device_id, alert_type, message)
         VALUES ($1, $2, $3)`,
        [alert.deviceId, alert.alertType, alert.message],
      );
    }

    return res.status(201).json({ success: true, data: mapReading(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/devices', authenticateToken, async (_req, res) => {

  try {
    const result = await query(
      `SELECT
        id,
        device_code,
        device_name,
        location,
        CASE
          WHEN last_seen IS NOT NULL AND last_seen > NOW() - INTERVAL '2 minutes' THEN 'online'
          ELSE 'offline'
        END AS status,
        last_seen,
        created_at
       FROM devices
       ORDER BY device_code ASC`,
    );

    return res.json({ success: true, data: result.rows.map(mapDevice) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/devices/:deviceId/latest', authenticateToken, async (req, res) => {

  const deviceId = String(req.params.deviceId).trim();

  try {
    const result = await query(
      `SELECT * FROM sensor_readings
       WHERE device_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [deviceId],
    );

    return res.json({ success: true, data: result.rows[0] ? mapReading(result.rows[0]) : null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/devices/:deviceId/history', authenticateToken, async (req, res) => {

  const deviceId = String(req.params.deviceId).trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);
  const { from, to } = req.query;

  try {
    const historyQuery = buildHistoryQuery({ deviceId, limit, from, to });
    const result = await query(historyQuery.text, historyQuery.params);

    return res.json({ success: true, data: result.rows.map(mapReading) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/alerts/unresolved', authenticateToken, async (req, res) => {

  const deviceId = String(req.query.device_id || defaultDeviceId).trim();

  try {
    const result = await query(
      `SELECT * FROM alerts
       WHERE is_resolved = FALSE AND device_id = $1
       ORDER BY triggered_at DESC
       LIMIT 20`,
      [deviceId],
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/readings/latest', authenticateToken, async (req, res) => {

  const deviceId = String(req.query.device_id || defaultDeviceId).trim();

  try {
    const result = await query(
      `SELECT * FROM sensor_readings
       WHERE device_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [deviceId],
    );

    return res.json({ success: true, data: result.rows[0] ? mapReading(result.rows[0]) : null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/readings/history', authenticateToken, async (req, res) => {

  const deviceId = String(req.query.device_id || defaultDeviceId).trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);
  const { from, to } = req.query;

  try {
    const historyQuery = buildHistoryQuery({ deviceId, limit, from, to });
    const result = await query(historyQuery.text, historyQuery.params);

    return res.json({ success: true, data: result.rows.map(mapReading) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/readings/stats', authenticateToken, async (req, res) => {
  const deviceId = String(req.query.device_id || defaultDeviceId).trim();

  try {
    const statsQuery = (timeCondition) => `
      SELECT
        COALESCE(ROUND(AVG(temperature)::numeric, 1), 0) as avg_temp,
        COALESCE(MIN(temperature), 0) as min_temp,
        COALESCE(MAX(temperature), 0) as max_temp,
        COALESCE(ROUND(AVG(humidity)::numeric, 1), 0) as avg_hum,
        COALESCE(MIN(humidity), 0) as min_hum,
        COALESCE(MAX(humidity), 0) as max_hum,
        COALESCE(ROUND(AVG(light)::numeric, 1), 0) as avg_light,
        COALESCE(MIN(light), 0) as min_light,
        COALESCE(MAX(light), 0) as max_light
      FROM sensor_readings
      WHERE device_id = $1 AND ${timeCondition}
    `;

    const [todayResult, weekResult] = await Promise.all([
      query(statsQuery("created_at >= CURRENT_DATE"), [deviceId]),
      query(statsQuery("created_at >= CURRENT_DATE - INTERVAL '7 days'"), [deviceId])
    ]);

    return res.json({
      success: true,
      data: {
        today: todayResult.rows[0],
        week: weekResult.rows[0]
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Greenhouse IoT API is running on http://0.0.0.0:${port}`);
});
