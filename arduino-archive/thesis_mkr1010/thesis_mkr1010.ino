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

// Physical Computation
const int ledPin = 7; // Light connected to pin 7

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected!");
      Serial.println("--------------------");
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
      
      // Physical Computation
      // Control the LED based on the message
      if (strcmp((char*)payload, "1") == 0) {
        digitalWrite(ledPin, HIGH); // Turn light ON
        Serial.println("LED turned ON");
      } 
      else if (strcmp((char*)payload, "2") == 0) {
        digitalWrite(ledPin, LOW); // Turn light OFF
        Serial.println("LED turned OFF");
      }
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200); // Debug Serial

  // Physical Computation
  pinMode(ledPin, OUTPUT); // Set pin 7 as OUTPUT

  // Wait for serial port to connect
  while (!Serial);
  Serial.println("--------------------");

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
}