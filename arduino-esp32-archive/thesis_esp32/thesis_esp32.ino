// ESP32 Code
// base - ESP32 and Arduino connection success 

#define RXD2 16  // ESP32 RX - Orange
#define TXD2 17  // ESP32 TX - Blue

void setup() {
    Serial.begin(115200);
    Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
}

void loop() {
    Serial2.println("Hello from ESP32"); //what arduino will recieve
    Serial.println("sending Hi to Arduino"); //what ESP32 will print in serial
    delay(1000);
}