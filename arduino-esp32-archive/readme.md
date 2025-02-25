# ESP32 to Arduino Connection

## Overview

- Code and setup to send a message from an ESP32 to an Arduino via the RX and TX pins.
- Connect ESP32 to node server
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
