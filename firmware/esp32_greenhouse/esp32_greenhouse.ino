#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <BH1750.h>
#include "config.h"

#define DHT_PIN 4
#define DHT_TYPE DHT11

const unsigned long SEND_INTERVAL_MS = 5000;

DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

unsigned long lastSendAt = 0;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void sendReading(float temperature, float humidity, float light) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", IOT_API_KEY);

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"temperature\":" + String(temperature, 1) + ",";
  payload += "\"humidity\":" + String(humidity, 1) + ",";
  payload += "\"light\":" + String(light, 0);
  payload += "}";

  int responseCode = http.POST(payload);
  Serial.print("POST /api/readings -> ");
  Serial.println(responseCode);
  Serial.println(payload);

  http.end();
}

void setup() {
  Serial.begin(115200);

  dht.begin();
  Wire.begin(21, 22);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);

  connectWiFi();
}

void loop() {
  if (millis() - lastSendAt < SEND_INTERVAL_MS) {
    return;
  }

  lastSendAt = millis();

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  float light = lightMeter.readLightLevel();

  if (isnan(humidity) || isnan(temperature) || light < 0) {
    Serial.println("Sensor read failed");
    return;
  }

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" C, Humidity: ");
  Serial.print(humidity);
  Serial.print(" %, Light: ");
  Serial.print(light);
  Serial.println(" lux");

  sendReading(temperature, humidity, light);
}
