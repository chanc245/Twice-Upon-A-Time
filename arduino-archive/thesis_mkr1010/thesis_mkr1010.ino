// Arduino WiFi 1010 Code (using WiFiNINA)
// Arduino to Node.js (index_arduino.js) connection

#include <WiFiNINA.h>
#include <WebSocketsClient_Generic.h>  

// WiFi and WebSocket details - BFADT-IoT
const char* ssid = "BFADT-IoT";
const char* password = "bfaisthebest";
#define WS_SERVER "192.168.0.230"
#define WS_PORT 8080

WebSocketsClient webSocket;
bool alreadyConnected = false;

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
      Serial.print("[WSc] Received message: ");
      Serial.println((char*)payload);
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200); // Debug Serial

  // Wait for serial port to connect
  while (!Serial);

  // Check for WiFi module
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    while (true); // Don't continue
  }

  // Check firmware version
  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // WiFi setup
  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Attempt to connect to WiFi network
  int status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, password);
    Serial.print(".");
    delay(1000);
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
    // Testing Connection
    webSocket.sendTXT("Arduino MKR WiFi 1010 says hi!");
    Serial.println("[WSc] Sent: Arduino MKR WiFi 1010 says hi!");
    delay(1000);
  }
}
