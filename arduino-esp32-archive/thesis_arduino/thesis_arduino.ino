// Arduino 
// base - ESP32 and Arduino connection success

void setup() {
  Serial.begin(9600); 
}

void loop() {
  if (Serial.available()) {
      String message = Serial.readString();
      Serial.println("Received: " + message);
  }
}