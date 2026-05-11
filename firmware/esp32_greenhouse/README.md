# ESP32 Greenhouse Firmware

Firmware dùng cho mô hình giám sát nhà kính cà chua với ESP32, DHT11 và BH1750. 
Ở chế độ **Demo**, thiết bị được cấu hình để gửi dữ liệu mỗi **5 giây** để người xem thấy được sự thay đổi tức thì.

## Thư viện cần cài trong Arduino IDE

- `DHT sensor library`
- `Adafruit Unified Sensor`
- `BH1750`

## Chân kết nối gợi ý

- DHT11 data: GPIO 4
- BH1750 SDA: GPIO 21
- BH1750 SCL: GPIO 22
- GND của tất cả module nối chung GND

## Cấu hình trước khi upload

File `esp32_greenhouse.ino` không chứa trực tiếp mật khẩu WiFi hoặc API key. Trước khi upload, tạo file `config.h` cùng thư mục với file `.ino`.

Cách làm nhanh:

1. Copy `config.example.h`.
2. Đổi tên bản copy thành `config.h`.
3. Sửa các giá trị trong `config.h`:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* DEVICE_ID = "esp32_01";
const char* API_BASE_URL = "http://192.168.1.10:3001";
const char* IOT_API_KEY = "YOUR_API_KEY";
```

`API_BASE_URL` phải là IPv4 của máy đang chạy backend, không dùng `localhost` vì `localhost` trên ESP32 là chính ESP32.

