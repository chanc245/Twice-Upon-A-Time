// ESP32 Code
// ESP32 to Node.js (index_arduino.js) connection work

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WebSocketsClient_Generic.h>

WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

// WiFi and WebSocket details - chrisc
//const char* ssid = "chrisc";
//const char* password = "12345678";
//#define WS_SERVER "192.0.0.2"      
#define WS_PORT 8080

// WiFi and WebSocket details - BFADT-IoT
const char* ssid = "BFADT-IoT";
const char* password = "BFADT-IoT-password";
#define WS_SERVER "192.168.0.131"    
#define WS_PORT 8080

bool alreadyConnected = false;

// ESP Pins
//#define RXD2 16  // ESP32 RX - Orange
//#define TXD2 17  // ESP32 TX - Blue

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected!");
      alreadyConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.print("[WSc] Connected to server: ");
      Serial.println((char*)payload);
      alreadyConnected = true;
      break;

    case WStype_TEXT:
      Serial.printf("[WSc] Received message: %s\n", payload);
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200); // Debug Serial
  //  Serial2.begin(115200, SERIAL_8N1, RX2, TX2); // Setup Serial2 for Arduino communication
  //  Serial.println("Serial2 initialized for Arduino communication.");

  // WiFi setup
  WiFiMulti.addAP(ssid, password);
  while (WiFiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // WebSocket setup
  webSocket.begin(WS_SERVER, WS_PORT, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();

  if (alreadyConnected) {
    //Testing Connection
    webSocket.sendTXT("ESP32 says hi!");
    Serial.println("[WSc] Sent: ESP32 says hi!");
    delay(1000);
  }

}