# ESP32 to Arduino Connection

## Overview

Sends message from ESP32 to Arduino via RX and TX pin.

## Wire set up (without Logic Level Shifter):

Using resistor(22k and 10k) voltage divider to step down the 5V signal from the Arduino to 3.3V for the ESP32.

`TX(arduino)` - `22k resister` - `RX2(ESP32)` - `10k resister` - `GND(esp32)` - `GND(arduino)`
`RX(arduino)` - `TX2(esp32)`
