INSERT INTO devices (device_code, device_name, location, status, last_seen)
VALUES ('esp32_01', 'ESP32 Nhà kính cà chua', 'Mô hình nhà kính', 'online', CURRENT_TIMESTAMP)
ON CONFLICT (device_code)
DO UPDATE SET
  status = EXCLUDED.status,
  last_seen = EXCLUDED.last_seen;

INSERT INTO sensor_readings (device_id, temperature, humidity, light)
VALUES
  ('esp32_01', 27.5, 68.0, 420.0),
  ('esp32_01', 27.9, 67.5, 440.0),
  ('esp32_01', 28.2, 66.8, 390.0),
  ('esp32_01', 28.4, 66.2, 280.0);
