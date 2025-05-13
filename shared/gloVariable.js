//gloVariable.js
//  Stores current voice ID and status globally.

let VOICE_ID = "ZF6FPAbjXT4488VcRRnw";
let currentStatus = "---";
let storedTextInputs = [];
let storedAudioFiles = [];

export const getVoiceId = () => VOICE_ID;
export const setVoiceId = (newVoiceId) => {
  VOICE_ID = newVoiceId;
};

export const getCurrentStatus = () => currentStatus;
export const setCurrentStatus = (newStatus) => {
  currentStatus = newStatus;
};

export const getStoredTextInputs = () => storedTextInputs;
export const addStoredTextInput = (text) => {
  storedTextInputs.push(text);
  console.log("📝 Added text input:", text);
  console.log("📚 All stored text inputs:", storedTextInputs);
};

export const getStoredAudioFiles = () => storedAudioFiles;
export const addStoredAudioFile = (file) => {
  storedAudioFiles.push(file);
  console.log("🎵 Added audio file:", file);
  console.log("🎧 All stored audio files:", storedAudioFiles);
};
