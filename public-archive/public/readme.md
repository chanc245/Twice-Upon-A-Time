# Voice Recording Interface (Tech Prototype ver2)

This is a browser-based prototype that allows users to interact with an AI system through three different input methods for voice recording. The recordings are handled via button presses and spacebar interaction, and then sent to a backend endpoint to be processed.

## Features

- ✅ **Hold to Record**: Press and hold the "Hold to Record" button to record your voice.
- ✅ **Toggle to Record**: Click "Start Recording" to begin, and click again to stop.
- ✅ **Spacebar to Record**: Hold down the spacebar to start recording, release to stop.
- ✅ **Visual Indicator**: Displays the current recording state ("Recording..." in red or "Not Recording" in black).

## Usage Instructions

1. Open `index.html` in a browser (served via a Node.js/Express server).
2. Use any of the three provided input methods to begin interacting with the prototype.
3. After recording, wait for the AI's voice response before starting another action.
4. Voice recordings are sent to `/start-recording` and `/stop-recording` routes.

## Project Structure

```
public/
├── index.html         # Main HTML interface
├── style.css          # Optional styling (not shown here)
└── script.js          # Front-end JavaScript logic
```

## Backend Setup

Ensure your backend is set up to handle the following POST routes:

- `/start-recording`: Begins recording audio from the user's microphone.
- `/stop-recording`: Ends the recording session and processes the audio.

## Notes

- Be patient between actions. The system requires time to transcribe and generate a voice response.
- This prototype is part of a larger AI interaction system using real-time audio input and voice synthesis.
