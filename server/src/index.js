import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';
import * as authController from './controllers/authController.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import nodemailer from 'nodemailer';


dotenv.config();

// --- CẤU HÌNH CẢNH BÁO GMAIL ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng của Google
  }
});

const sendEmailAlert = async (message) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  
  try {
    await transporter.sendMail({
      from: `"SmartGarden Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: "⚠️ CẢNH BÁO SMARTGARDEN",
      text: message,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #ff4d4f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ CẢNH BÁO HỆ THỐNG</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 18px; color: #333; margin-top: 0;">Xin chào,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hệ thống SmartGarden vừa phát hiện một thông số môi trường không đạt yêu cầu:
            </p>
            <div style="background-color: #fff2f0; border-left: 4px solid #ff4d4f; padding: 15px; margin: 20px 0; font-weight: bold; color: #cf1322;">
              ${message}
            </div>
            <p style="font-size: 14px; color: #888;">
              Vui lòng kiểm tra lại nhà kính để đảm bảo môi trường tốt nhất cho sự phát triển của cây trồng.
            </p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">Hệ thống SmartGarden IoT - Đại học Công nghệ (UET - VNU)</p>
            <p style="margin: 5px 0 0;">Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `
    });
    console.log('Email alert sent successfully');
  } catch (error) { 
    console.error('Email Error:', error); 
  }
};

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

// API lấy ngưỡng hiện tại
app.get('/api/settings/thresholds', async (_req, res) => {
  try {
    const result = await query('SELECT sensor_type, min_val, max_val FROM threshold_settings');
    const thresholds = {};
    result.rows.forEach(row => {
      thresholds[row.sensor_type] = { min: row.min_val, max: row.max_val };
    });
    res.json({ success: true, data: thresholds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API cập nhật ngưỡng
app.post('/api/settings/thresholds', async (req, res) => {
  const { temperature, humidity, light } = req.body;
  try {
    const updates = [
      query('UPDATE threshold_settings SET min_val = $1, max_val = $2 WHERE sensor_type = \'temperature\'', [temperature.min, temperature.max]),
      query('UPDATE threshold_settings SET min_val = $1, max_val = $2 WHERE sensor_type = \'humidity\'', [humidity.min, humidity.max]),
      query('UPDATE threshold_settings SET min_val = $1, max_val = $2 WHERE sensor_type = \'light\'', [light.min, light.max])
    ];
    await Promise.all(updates);
    res.json({ success: true, message: 'Cập nhật ngưỡng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const buildAlerts = (reading, thresholds) => {
  const { device_id: deviceId, temperature, humidity, light } = reading;
  const alerts = [];

  // Sử dụng ngưỡng từ tham số, nếu thiếu thì dùng ngưỡng mặc định toàn cục
  const t = thresholds.temperature || greenhouseThresholds.temperature;
  const h = thresholds.humidity || greenhouseThresholds.humidity;
  const l = thresholds.light || greenhouseThresholds.light;

  if (temperature > t.max) {
    alerts.push(['temperature_high', `Nhiệt độ quá cao: ${temperature}°C. Gợi ý: Bật quạt thông gió hoặc hệ thống phun sương.`]);
  } else if (temperature < t.min) {
    alerts.push(['temperature_low', `Nhiệt độ quá thấp: ${temperature}°C. Gợi ý: Đóng cửa kính hoặc bật đèn sưởi.`]);
  }

  if (humidity > h.max) {
    alerts.push(['humidity_high', `Độ ẩm quá cao: ${humidity}%. Gợi ý: Bật quạt thông gió để giảm độ ẩm.`]);
  } else if (humidity < h.min) {
    alerts.push(['humidity_low', `Độ ẩm quá thấp: ${humidity}%. Gợi ý: Kích hoạt hệ thống tưới phun sương.`]);
  }

  if (light > l.max) {
    alerts.push(['light_high', `Ánh sáng quá mạnh: ${light} lux. Gợi ý: Đóng rèm che nắng để bảo vệ cây.`]);
  } else if (light < l.min) {
    alerts.push(['light_low', `Ánh sáng quá yếu: ${light} lux. Gợi ý: Bật đèn chiếu sáng bổ sung.`]);
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

    // Lấy ngưỡng từ Database để kiểm tra cảnh báo
    const thresholdsResult = await query('SELECT sensor_type, min_val, max_val FROM threshold_settings');
    const thresholds = {};
    thresholdsResult.rows.forEach(row => {
      thresholds[row.sensor_type] = { 
        min: Number(row.min_val), 
        max: Number(row.max_val) 
      };
    });

    const generatedAlerts = buildAlerts(result.rows[0], thresholds);
    const now = new Date();

    // 0. Kiểm tra Master Switch (Bật/Tắt toàn bộ hệ thống cảnh báo)
    const settingsResult = await query("SELECT setting_value FROM global_settings WHERE setting_key = 'alerts_enabled'");
    const alertsMasterEnabled = settingsResult.rows[0]?.setting_value === true;

    if (!alertsMasterEnabled) {
      return res.status(201).json({ success: true, data: mapReading(result.rows[0]) });
    }

    for (const alert of generatedAlerts) {
      // Tìm cảnh báo gần nhất của loại này cho thiết bị này
      const lastAlert = await query(
        `SELECT id, is_resolved, triggered_at, resolved_at FROM alerts 
         WHERE device_id = $1 AND alert_type = $2
         ORDER BY triggered_at DESC LIMIT 1`,
        [alert.deviceId, alert.alertType]
      );

      let shouldSend = false;

      if (lastAlert.rows.length === 0) {
        // Chưa từng có cảnh báo loại này -> gửi ngay
        shouldSend = true;
      } else {
        const item = lastAlert.rows[0];
        if (item.is_resolved === false) {
          // Trường hợp 1: Chưa được xử lý -> lặp lại sau mỗi 5 phút
          const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
          if (new Date(item.triggered_at) < fiveMinsAgo) {
            shouldSend = true;
          } else {
            console.log(`Skipping repeat alert for ${alert.alertType} - unresolved but still within 5 min cooldown.`);
          }
        } else {
          // Trường hợp 2: Đã xử lý rồi -> lặp lại sau mỗi 10 phút nếu sự cố vẫn còn
          const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
          const resolvedTime = item.resolved_at ? new Date(item.resolved_at) : new Date(item.triggered_at);
          if (resolvedTime < tenMinsAgo) {
            shouldSend = true;
          } else {
            console.log(`Skipping alert for ${alert.alertType} - recently handled by user (mute for 10 min).`);
          }
        }
      }

      if (shouldSend) {
        // Tạo bản ghi cảnh báo mới
        await query(
          `INSERT INTO alerts (device_id, alert_type, message)
           VALUES ($1, $2, $3)`,
          [alert.deviceId, alert.alertType, alert.message],
        );
        
        // Gửi cảnh báo về Email
        await sendEmailAlert(alert.message);
      }
    }

    return res.status(201).json({ success: true, data: mapReading(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/devices', async (_req, res) => {

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

app.get('/api/devices/:deviceId/latest', async (req, res) => {

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

app.get('/api/devices/:deviceId/history', async (req, res) => {

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

app.post('/api/alerts/:id/resolve', async (req, res) => {
  const alertId = req.params.id;
  try {
    await query(
      'UPDATE alerts SET is_resolved = TRUE, resolved_at = CURRENT_TIMESTAMP WHERE id = $1',
      [alertId]
    );
    res.json({ success: true, message: 'Đã đánh dấu cảnh báo là đã xử lý' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/alerts/unresolved', async (req, res) => {
  const deviceId = String(req.query.device_id || defaultDeviceId).trim();
  try {
    const result = await query(
      `SELECT * FROM alerts
       WHERE is_resolved = FALSE AND device_id = $1
       ORDER BY triggered_at DESC
       LIMIT 20`,
      [deviceId],
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/alerts/history', async (req, res) => {
  const deviceId = String(req.query.device_id || defaultDeviceId).trim();
  const limit = parseInt(req.query.limit) || 50;
  try {
    const result = await query(
      `SELECT * FROM alerts
       WHERE device_id = $1
       ORDER BY triggered_at DESC
       LIMIT $2`,
      [deviceId, limit],
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint cho Master Switch - Bật/Tắt toàn bộ hệ thống cảnh báo
app.get('/api/settings/alerts/status', async (req, res) => {
  try {
    const result = await query("SELECT setting_value FROM global_settings WHERE setting_key = 'alerts_enabled'");
    res.json({ success: true, alerts_enabled: result.rows[0]?.setting_value === true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/settings/alerts/toggle', async (req, res) => {
  try {
    const current = await query("SELECT setting_value FROM global_settings WHERE setting_key = 'alerts_enabled'");
    const nextValue = !(current.rows[0]?.setting_value === true);
    await query("UPDATE global_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'alerts_enabled'", [nextValue]);
    res.json({ success: true, alerts_enabled: nextValue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/readings/latest', async (req, res) => {

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

app.get('/api/readings/history', async (req, res) => {

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

app.get('/api/readings/stats', async (req, res) => {
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
