#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SS 5
#define RST 14
#define DIO0 2

const char* ssid = "Dialog 4G 120";
const char* password = "94De63F1";

// ThingSpeak
String apiKey = "YOUR_THINGSPEAK_WRITE_API_KEY";

void setup() {
  Serial.begin(9600);
  delay(1000);

  Serial.println("Starting LoRa Receiver");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");

  LoRa.setPins(SS, RST, DIO0);

  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  Serial.println("LoRa Receiver Ready");
}

void loop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    String received = "";

    while (LoRa.available()) {
      received += (char)LoRa.read();
    }

    Serial.print("Received packet: ");
    Serial.println(received);

    // Example incoming format:
    // MQ2:42,TEMP:27.50,HUM:65.20,LAT:6.927100,LNG:79.861200

    float mq2 = 0.0;
    float temp = 0.0;
    float hum = 0.0;
    float lat = 0.0;
    float lng = 0.0;

    int mq2Index = received.indexOf("MQ2:");
    int tempIndex = received.indexOf(",TEMP:");
    int humIndex = received.indexOf(",HUM:");
    int latIndex = received.indexOf(",LAT:");
    int lngIndex = received.indexOf(",LNG:");

    if (mq2Index != -1 && tempIndex != -1 && humIndex != -1 && latIndex != -1 && lngIndex != -1) {
      mq2 = received.substring(mq2Index + 4, tempIndex).toFloat();
      temp = received.substring(tempIndex + 6, humIndex).toFloat();
      hum = received.substring(humIndex + 5, latIndex).toFloat();
      lat = received.substring(latIndex + 5, lngIndex).toFloat();
      lng = received.substring(lngIndex + 5).toFloat();

      Serial.println("Parsed values:");
      Serial.print("MQ2: "); Serial.println(mq2);
      Serial.print("TEMP: "); Serial.println(temp);
      Serial.print("HUM: "); Serial.println(hum);
      Serial.print("LAT: "); Serial.println(lat, 6);
      Serial.print("LNG: "); Serial.println(lng, 6);

      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;

        String url = "http://api.thingspeak.com/update?api_key=" + apiKey +
                     "&field1=" + String(mq2, 2) +
                     "&field2=" + String(temp, 2) +
                     "&field3=" + String(hum, 2) +
                     "&field4=" + String(lat, 6) +
                     "&field5=" + String(lng, 6);

        Serial.println("Uploading to ThingSpeak...");
        Serial.println(url);

        http.begin(url);
        int httpCode = http.GET();

        Serial.print("HTTP Response code: ");
        Serial.println(httpCode);

        if (httpCode > 0) {
          String response = http.getString();
          Serial.print("ThingSpeak response: ");
          Serial.println(response);
        } else {
          Serial.println("Upload failed");
        }

        http.end();
      } else {
        Serial.println("WiFi disconnected, upload skipped");
      }

    } else {
      Serial.println("Invalid packet format, could not parse");
    }

    delay(15000);  // ThingSpeak minimum update interval
  }
}