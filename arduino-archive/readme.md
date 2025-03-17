# Arduino to Node.js Connection

## Overview
- Connecting from `Arduino MKR 1010` to `node.js`
 - arduino MKR 1010 file: `/thesis_mkr1010/thesis_mkr1010.ino`
 - html file: `/public_arduino/index_arduino.html`
 - node.js: `index_arduino.js`

## Note
- Arduino MRK 1010 is WAY FASTER than esp32
- when switch from ESP32's `<WiFi101.h>` library into MKR 1010's `<WiFiNINA.h>`, in the `WebSockets_Generic` library, will need to change from `#include <WiFi101.h>` to `#include <WiFiNINA.h>`.

---

# ESP32 to Arduino Connection

## Overview

- Code and setup to send a message from `ESP32` to `Arduino Uno` via the RX and TX pins.
- Connect ESP32 to node server
  - esp32 file: `/thesis_esp32/thesis_esp32.ino`
  - arduino file: `/thesis_arduino/thesis_arduino.ino`
  - html file: `/public_arduino/index_arduino.html`
  - node.js: `index_arduino.js`

## Wire set up (without Logic Level Shifter)

Use a resistor voltage divider (22kΩ and 10kΩ) to step down the 5V signal from the Arduino to 3.3V for the ESP32.

`TX(arduino)` - `22k resister` - `RX2(ESP32)` - `10k resister` - `GND(esp32)` - `GND(arduino)`
`RX(arduino)` - `TX2(esp32)`

## Note

- `Arduino` - When uploading code to the Arduino, make sure the TX and RX wires are disconnected (otherwise the upload will fail).
- `ESP32` - When uploading code to the ESP32, when it show `Connecting...`, press the `BOOT` button on ESP32.
- `ESP32` - When uploading code to the ESP32, if it shows: `A fatal error occurred: The chip stopped responding`. Upload code again hold the `BOOT` on ESP32 until see `Connecting...` then release.
- Using two computers (one connected to the ESP32 and one to the Arduino) will be easier since you can check both serial monitors simultaneously.
