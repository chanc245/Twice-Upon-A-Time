#include <Servo.h>
#include <Adafruit_NeoPixel.h>
#include <WiFiNINA.h>
#include <WebSocketsClient_Generic.h>

// BFADT-IoT
//const char* ssid = "BFADT-IoT";
//const char* password = "bfaisthebest";
//#define WS_SERVER "192.168.0.229"
// HOME
const char* ssid = "Homebody";
const char* password = "youngdumbandbroke";
#define WS_SERVER "192.168.1.144"

#define WS_PORT 8080

WebSocketsClient webSocket;
bool alreadyConnected = false;

// LED STRIP PINS
#define PIN2 4 // LIGHT STRIP - act1
#define PIN 3 // LIGHT STRIP - act4

// PINS
int smolStgPin = 2; //servo puppet
int bigStgPin = 5; //servo stage
int displayPin = 7; // hall effect sensor

// ACTION Switchs
bool displaySwitch = false; //Hall Effect Sensor Switch
bool act1Switch = false; //LIGHT STRIP act1
bool act2Switch = false; //SERVO_5 sml stg
bool act3Switch = false; //SERVO_6 big stg
bool act4Switch = false; //LIGHT STRIP act4

// CHAR Switchs
bool char1Swch = false; //RED
bool char2Swch = false; //YELLOW
bool char3Swch = false; //LIGHT BLUE
bool char4Swch = false; //PURPLE
bool char5Swch = false; //MAGENTA

// SERVOS
Servo servo_5; //small puppets pulley - 180 deg
Servo servo_6; //puppet stage - 90 deg

#define NUMPIXELS2 25 // number of neopixels on second strip
#define NUMPIXELS 29 // number of neopixels in strip

Adafruit_NeoPixel pixels2 = Adafruit_NeoPixel(NUMPIXELS2, PIN2, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

int pixelsBrightness = 10;
int pixels2Brightness = 10;

// stg2 - Character Lights
const int char1[3] = {255, 0, 0};  //red
const int char2[3] = {255, 255, 0}; //yellow
const int char3[3] = {173, 216, 230}; //light blue
const int char4[3] = {128, 0, 128}; //purple
const int char5[3] = {255, 0, 255}; //magenta

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
      for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
      }
      Serial.println();

      if (strcmp((char*)payload, "displaySwitch") == 0) {
        Serial.println("displaySwitch on");
        displaySwitch = true;
      }
      else if (strcmp((char*)payload, "allFalse") == 0) {
        Serial.println("allFalse");
        displaySwitch = false;
        act1Switch = false;
        act2Switch = false;
        act3Switch = false;
        act4Switch = false;
        char1Swch = false;
        char2Swch = false;
        char3Swch = false;
        char4Swch = false;
        char5Swch = false;
      }
      else if (strcmp((char*)payload, "act1Switch") == 0) {
        Serial.println("act1Switch");
        act1Switch = true;
      }
      else if (strcmp((char*)payload, "act1Switch") == 0) {
        Serial.println("act1Switch");
        act1Switch = true;
      }
      else if (strcmp((char*)payload, "act1Switch") == 0) {
        Serial.println("act1Switch");
        act1Switch = true;
      }
      else if (strcmp((char*)payload, "act2Switch") == 0) {
        Serial.println("act2Switch");
        act2Switch = true;
      }
      else if (strcmp((char*)payload, "act3Switch") == 0) {
        Serial.println("act3Switch");
        act3Switch = true;
      }
      else if (strcmp((char*)payload, "act4Switch") == 0) {
        Serial.println("act4Switch");
        act4Switch = true;
      }
      else if (strcmp((char*)payload, "char1Swch") == 0) {
        Serial.println("char1Swch");
        char1Swch = true;
        //  char1Swch = false;
        char2Swch = false;
        char3Swch = false;
        char4Swch = false;
        char5Swch = false;
      }
      else if (strcmp((char*)payload, "char2Swch") == 0) {
        Serial.println("char2Swch");
        char2Swch = true;
          char1Swch = false;
        //  char2Swch = false;
          char3Swch = false;
          char4Swch = false;
          char5Swch = false;
      }
      else if (strcmp((char*)payload, "char3Swch") == 0) {
        Serial.println("char3Swch");
        char3Swch = true;
          char1Swch = false;
          char2Swch = false;
        //  char3Swch = false;
          char4Swch = false;
          char5Swch = false;
      }
      else if (strcmp((char*)payload, "char4Swch") == 0) {
        Serial.println("char4Swch");
        char4Swch = true;
          char1Swch = false;
          char2Swch = false;
          char3Swch = false;
        //  char4Swch = false;
          char5Swch = false;
      }
      else if (strcmp((char*)payload, "char5Swch") == 0) {
        Serial.println("char5Swch");
        char5Swch = true;
          char1Swch = false;
          char2Swch = false;
          char3Swch = false;
          char4Swch = false;
        //  char5Swch = false;
      }
      else{
        displaySwitch = false;
        act1Switch = false;
        act2Switch = false;
        act3Switch = false;
        act4Switch = false;
        char1Swch = false;
        char2Swch = false;
        char3Swch = false;
        char4Swch = false;
        char5Swch = false;
      }
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);

  //SERVO
  servo_5.attach(smolStgPin);
  servo_6.attach(bigStgPin);

  pinMode(displayPin, INPUT); //Hall effect sensor input

  //STRIP LIGHT
  pixels.begin();
  pixels.setBrightness(pixelsBrightness);
  pixels.clear();
  pixels.show();

  pixels2.begin();
  pixels2.setBrightness(pixels2Brightness);
  pixels2.clear();
  pixels2.show();

  // WIFI
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
  // WIFI set loop
  webSocket.loop();

  int displayValue = digitalRead(displayPin);

  // Print button states
//  Serial.print("|ZEO: ");
//  Serial.print(displaySwitch);
//  Serial.print("|ONE: ");
//  Serial.print(act1Switch);
//  Serial.print("|TWO: ");
//  Serial.println(act2Switch);
//  Serial.print("|THREE: ");
//  Serial.print(act3Switch);
//  Serial.print("|FOUR: ");
//  Serial.print(act4Switch);
//  Serial.println("|");
//
//  Serial.print("-|ONE: ");
//  Serial.print(char1Swch);
//  Serial.print("|TWO: ");
//  Serial.print(char2Swch);
//  Serial.print("|THREE: ");
//  Serial.print(char3Swch);
//  Serial.print("|FOUR: ");
//  Serial.print(char4Swch);
//  Serial.print("|FIVE: ");
//  Serial.print(char5Swch);
//  Serial.println("|");
//  Serial.println("");

  //STRIP LIGHT - NUMPIXELS2 - act1
  if (act1Switch) {
    setColorPx2(255, 255, 100);
  } else {
    pixels2.clear();
    pixels2.show();
  }

  //SERVO - act2(small stg) + act3(big stg)
  if (act2Switch) servo_5.write(170);
  else if (!act2Switch) servo_5.write(10);

  if (act3Switch) servo_6.write(0);
  else if (!act3Switch) servo_6.write(90);

  //STRIP LIGHT - NUMPIXELS - act4
  if (act4Switch) {
    if (char1Swch) {
      setColorPx1(char1[0], char1[1], char1[2]);  // Red
    } else if (char2Swch) {
      setColorPx1(char2[0], char2[1], char2[2]);  // Yellow
    } else if (char3Swch) {
      setColorPx1(char3[0], char3[1], char3[2]);  // Light Blue
    } else if (char4Swch) {
      setColorPx1(char4[0], char4[1], char4[2]);  // Purple
    } else if (char5Swch) {
      setColorPx1(char5[0], char5[1], char5[2]);  // Magenta
    }
  } else {
    // Turn off LEDs if act4 is not active
    pixels.clear();
    pixels.show();
  }

  delay(100); // tiny delay to stabilize readings
}

void setColorPx1(int red, int green, int blue) {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(red, green, blue));
  }
  pixels.show();
}

void setColorPx2(int red2, int green2, int blue2) {
  for (int n = 0; n < NUMPIXELS2; n++) {
    pixels2.setPixelColor(n, pixels2.Color(red2, green2, blue2));
  }
  pixels2.show();
}
