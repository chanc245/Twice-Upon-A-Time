//mic.js
//  Handles mic input and chunk streaming.
//  export functions: startRecordingProcess, stopRecordingProcess, getAudioChunks

import mic from "mic";
import { Writable } from "stream";

let micInstance;
let micInputStream;
let isRecording = false;
let audioChunks = [];

export const startRecordingProcess = () => {
  console.log("Starting recording process...");
  micInstance?.stop();
  micInstance = mic({ rate: "16000", channels: "1", debug: false });
  micInputStream = micInstance.getAudioStream();
  audioChunks = [];
  isRecording = true;

  micInputStream.pipe(
    new Writable({
      write(chunk, _, callback) {
        if (!isRecording) return callback();
        audioChunks.push(chunk);
        callback();
      },
    })
  );

  micInstance.start();
};

export const stopRecordingProcess = () => {
  console.log("Stopping recording...");
  isRecording = false;
  micInstance?.stop();
};

export const getAudioChunks = () => audioChunks;
