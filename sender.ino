#include <SPI.h>
#include <LoRa.h>
#include <DHT.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

// ----- DHT22 -----
#define DHTPIN 3
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ----- MQ-2 -----
#define MQ2PIN A0

// ----- GPS -----
#define RXPin 4
#define TXPin 5
SoftwareSerial gpsSerial(RXPin, TXPin);
TinyGPSPlus gps;

// ----- LoRa -----
#define SS 10
#define RST 9
#define DIO0 2

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // Init Sensors
  dht.begin();
  gpsSerial.begin(9600);

  // Init LoRa
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed!");
    while (1);
  }

  Serial.println("LoRa Sender with Sensors Ready!");
}

void loop() {
  // ----- Read MQ-2 -----
  int mq2Value = analogRead(MQ2PIN);

  // ----- Read DHT22 -----
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // ----- Read GPS -----
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  double latitude = gps.location.isValid() ? gps.location.lat() : 0.0;
  double longitude = gps.location.isValid() ? gps.location.lng() : 0.0;

  // ----- Prepare LoRa message -----
  String payload = String("MQ2:") + mq2Value +
                   ",TEMP:" + temp +
                   ",HUM:" + hum +
                   ",LAT:" + latitude +
                   ",LNG:" + longitude;

  // ----- Send via LoRa -----
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();

  Serial.println("Sent: " + payload);

  delay(2000); // send every 2 seconds
}
