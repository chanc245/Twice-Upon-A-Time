// gloVariable.js

let VOICE_ID = "pMsXgVXv3BLzUgSXRplE";
let currentStatus = "---";

export const getVoiceId = () => VOICE_ID;
export const setVoiceId = (newVoiceId) => {
  VOICE_ID = newVoiceId;
};

export const getCurrentStatus = () => currentStatus;
export const setCurrentStatus = (newStatus) => {
  currentStatus = newStatus;
};
