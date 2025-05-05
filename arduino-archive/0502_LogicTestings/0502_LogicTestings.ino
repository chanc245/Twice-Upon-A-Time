#include <Servo.h>
#include <Adafruit_NeoPixel.h>

// LED STRIP PINS
#define PIN2 4 // LIGHT STRIP - act1
#define PIN 3 // LIGHT STRIP - act4

// PINS
int smolStgPin = 6; //servo puppet
int bigStgPin = 5; //servo stage
int displayPin = 7; // hall effect sensor

// ACTION Switchs 
bool act0Switch = false; 
bool act1Switch = false;
bool act2Switch = false;
bool act3Switch = false;
bool act4Switch = false;

// CHAR Switchs
bool char1Swch = false;
bool char2Swch = false;
bool char3Swch = false;
bool char4Swch = false;
bool char5Swch = false;

// SERVOS
Servo servo_5; //small puppets pulley - 180 deg
Servo servo_6; //puppet stage - 90 deg

#define NUMPIXELS2 10 // number of neopixels on second strip
#define NUMPIXELS 10 // number of neopixels in strip

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

void setup() {
  Serial.begin(9600);
  
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
}

void loop() {
  int displayValue = digitalRead(displayPin); 
  
  // Print button states
  Serial.print("|ZEO: ");
  Serial.print(act0Switch);
  Serial.print("|ONE: ");
  Serial.print(act1Switch);
  Serial.print("|TWO: ");
  Serial.print(act2Switch);
  Serial.print("|THREE: ");
  Serial.print(act3Switch);
  Serial.print("|FOUR: ");
  Serial.print(act4Switch);
  Serial.println("|");
  
  Serial.print("-|ONE: ");
  Serial.print(char1Swch);
  Serial.print("|TWO: ");
  Serial.print(char2Swch);
  Serial.print("|THREE: ");
  Serial.print(char3Swch);
  Serial.print("|FOUR: ");
  Serial.print(char4Swch);
  Serial.print("|FIVE: ");
  Serial.print(char5Swch);
  Serial.println("|");
  Serial.println("");

//  char1Swch = false;
  char2Swch = false;
  char3Swch = false;
  char4Swch = false;
  char5Swch = false;
  
  if (displayValue == LOW) {
    act0Switch = true;
  } else {
    act0Switch = false;
  }
  
  if (act0Switch) {
    act1Switch = true;
    act2Switch = true;
    act3Switch = true;
    act4Switch = true;
    char1Swch = true;
  } else {
    act1Switch = false;
    act2Switch = false;
    act3Switch = false;
    act4Switch = false;
  }
  
  //STRIP LIGHT - NUMPIXELS2 - act1
  if (act1Switch) {
    setColorPx2(255, 255, 100);
  } else {
    pixels2.clear();
    pixels2.show();
  }
  
  //SERVO - act2 + act3
  if (act2Switch) servo_5.write(180); 
  else if (!act2Switch) servo_5.write(0); 

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
