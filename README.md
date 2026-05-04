# 🌿 SmartGarden IoT Dashboard

Hệ thống giám sát môi trường thông minh cho mô hình nhà kính cây cà chua, sử dụng ESP32 kết hợp cảm biến và dashboard web thời gian thực.

## 📐 Kiến trúc hệ thống

```
┌─────────────────┐     HTTP POST      ┌──────────────┐     SQL      ┌────────────┐
│   ESP32 + DHT11 │ ──────────────────► │  Express.js  │ ───────────► │ PostgreSQL │
│   + BH1750      │    (API Key)        │  REST API    │              │  Database  │
└─────────────────┘                     └──────┬───────┘              └──────┬─────┘
                                               │                            │
                                               │  JWT Auth                  │  Query
                                               ▼                            ▼
                                        ┌──────────────┐          ┌──────────────┐
                                        │  React SPA   │ ◄────────│  API Server  │
                                        │  Dashboard   │          │  Port 3001   │
                                        │  Port 5173   │          └──────────────┘
                                        └──────────────┘
```

## 🔧 Phần cứng sử dụng

| Thiết bị            | Chức năng            | Giao tiếp              |
| ------------------- | -------------------- | ---------------------- |
| **ESP32 DEVKIT V1** | Vi điều khiển chính  | WiFi 2.4GHz            |
| **DHT11**           | Đo nhiệt độ & độ ẩm  | Digital (GPIO 4)       |
| **BH1750**          | Đo cường độ ánh sáng | I2C (SDA: 21, SCL: 22) |

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

- Node.js >= 18
- PostgreSQL >= 14
- Arduino IDE 2.x (cho ESP32)

### Bước 1: Tạo Database

Mở pgAdmin hoặc psql, tạo database mới:

```sql
CREATE DATABASE iot;
```

Sau đó chạy file schema để tạo các bảng:

```bash
psql -d iot -f server/sql/schema.sql
```

Hoặc mở pgAdmin → chọn database `iot` → Query Tool → dán nội dung file `server/sql/schema.sql` và chạy.

### Bước 2: Cấu hình và chạy Backend

```bash
cd server
npm install
```

Tạo file `server/.env` với nội dung:

```env
PORT=3001
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=iot
DB_HOST=localhost
DB_PORT=5432

DEFAULT_DEVICE_ID=esp32_01
IOT_API_KEY=your-api-key
JWT_SECRET=your-jwt-secret
```

Tạo tài khoản quản trị viên (chỉ cần làm 1 lần):

```bash
node src/scripts/create-admin.js
```

Chạy server:

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3001`.

### Bước 3: Cấu hình và chạy Frontend

Mở terminal mới tại thư mục gốc của dự án:

```bash
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_DEVICE_ID=esp32_01
```

Chạy dashboard:

```bash
npm run dev
```

Dashboard sẽ chạy tại `http://localhost:5173`.

### Bước 4: Nạp firmware cho ESP32

1. Mở `firmware/esp32_greenhouse/esp32_greenhouse.ino` bằng Arduino IDE.
2. Tạo file `config.h` trong cùng thư mục:

```cpp
#pragma once

const char* WIFI_SSID = "TEN_WIFI";
const char* WIFI_PASSWORD = "MAT_KHAU_WIFI";
const char* DEVICE_ID = "esp32_01";
const char* API_BASE_URL = "http://IP_MAY_TINH:3001";
const char* IOT_API_KEY = "your-api-key";
```

> **Lưu ý:** `API_BASE_URL` phải là IPv4 của máy chạy backend (lấy bằng lệnh `ipconfig`), không dùng `localhost`. ESP32 và máy tính phải cùng mạng WiFi.

3. Chọn board `DOIT ESP32 DEVKIT V1` và cổng COM đúng.
4. Nhấn Upload.

## 📡 API Endpoints

### Xác thực (Public)

| Method | Endpoint             | Mô tả                        |
| ------ | -------------------- | ---------------------------- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản            |
| `POST` | `/api/auth/login`    | Đăng nhập, nhận JWT token    |
| `GET`  | `/api/auth/me`       | Lấy thông tin user (cần JWT) |

### Dữ liệu cảm biến (Cần JWT)

| Method | Endpoint                 | Mô tả                                           |
| ------ | ------------------------ | ----------------------------------------------- |
| `GET`  | `/api/health`            | Kiểm tra trạng thái backend                     |
| `POST` | `/api/readings`          | ESP32 gửi dữ liệu (cần API Key)                 |
| `GET`  | `/api/readings/latest`   | Bản ghi cảm biến mới nhất                       |
| `GET`  | `/api/readings/history`  | Lịch sử cảm biến (hỗ trợ `from`, `to`, `limit`) |
| `GET`  | `/api/devices`           | Danh sách thiết bị và trạng thái                |
| `GET`  | `/api/alerts/unresolved` | Cảnh báo chưa xử lý                             |

### Payload ESP32

```json
{
  "device_id": "esp32_01",
  "temperature": 28.5,
  "humidity": 72,
  "light": 430
}
```

Header bắt buộc: `x-api-key: your-api-key`

## ✅ Chức năng chính

- 🔐 **Đăng nhập bảo mật** bằng JWT token cho dashboard
- 📊 **Dashboard real-time** hiển thị nhiệt độ, độ ẩm, ánh sáng
- 📈 **Biểu đồ lịch sử** với bộ lọc theo khoảng thời gian
- ⚠️ **Hệ thống cảnh báo** khi thông số vượt ngưỡng
- 🟢 **Trạng thái thiết bị** online/offline tự động
- ⚙️ **Tùy chỉnh ngưỡng** cảnh báo cho từng cảm biến
- 🔑 **API Key** bảo vệ endpoint ghi dữ liệu từ thiết bị

## 🛠 Công nghệ sử dụng

| Thành phần   | Công nghệ                    |
| ------------ | ---------------------------- |
| **Firmware** | Arduino C++ (ESP32)          |
| **Backend**  | Node.js, Express.js          |
| **Database** | PostgreSQL                   |
| **Frontend** | React 19, Vite, Recharts     |
| **Xác thực** | JWT (jsonwebtoken), bcryptjs |
| **UI Icons** | Lucide React                 |

## 📁 Cấu trúc dự án

```
Du_an_giam_sat_moi_truong_IoT/
├── firmware/                    # Mã nguồn ESP32
│   └── esp32_greenhouse/
│       ├── esp32_greenhouse.ino # Code chính
│       └── config.h             # Cấu hình WiFi, API
├── server/                      # Backend API
│   ├── src/
│   │   ├── index.js             # Entry point, routes
│   │   ├── db.js                # Kết nối PostgreSQL
│   │   ├── controllers/         # Xử lý logic auth
│   │   ├── middleware/          # JWT middleware
│   │   └── scripts/             # Script tạo admin
│   └── sql/
│       ├── schema.sql           # Database schema
│       └── seed.sql             # Dữ liệu mẫu
├── src/                         # Frontend React
│   ├── components/              # UI Components
│   ├── context/                 # Auth Context
│   ├── hooks/                   # Custom hooks
│   └── pages/                   # Các trang
└── README.md
```

## 🧪 Kiểm tra nhanh

```bash
# Kiểm tra backend
curl http://localhost:3001/api/health

# Giả lập ESP32 gửi dữ liệu
curl -X POST http://localhost:3001/api/readings ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: your-api-key" ^
  -d "{\"device_id\":\"esp32_01\",\"temperature\":28.5,\"humidity\":72,\"light\":430}"
```

## 👤 Nhóm

- **Tạ Minh Quân**
- **Nguyễn Thị Kim Cúc**
- **Trần Thị Phương**
