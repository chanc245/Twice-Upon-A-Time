// index_apr8_mvp.js
//ver19 apr7
//minimal viable product

import dotenv from "dotenv";
import * as mic from "./shared/mic.js";
import * as audio from "./shared/audio.js";
import * as elevenlab from "./shared/elevenlab.js";
import * as glo from "./shared/gloVariable.js";
import * as openai from "./shared/openai.js";
import * as server from "./shared/server.js";

dotenv.config();

const folderPath = "./audio/";
let userAudioFiles = [];
let gptAudioFiles = [];
let otherKeepFiles = ["user_filelist.txt"];

let transcriptionArchives = [];
let gptResponseArchives = [];

const userAudioFilesCombineNum = 10;
let VOICE_ID = "ZF6FPAbjXT4488VcRRnw";
let voiceIDList = [];
let voiceIDDeleteList = [];
let userCloneNum = 0;

let currentStatus = "";

export const handleRecording = async () => {
  console.log("Processing recording...");
  glo.setCurrentStatus("Processing recording...");
  currentStatus = "Processing recording...";

  const audioChunks = mic.getAudioChunks();
  const audioFile = await audio.saveAudio(audioChunks);
  userAudioFiles.push(audioFile);

  const transcription = await openai.transcribeAudio(audioFile);
  console.log("--TRANSCRIPTION:", transcription);
  transcriptionArchives.push(transcription);

  return transcription;
};

const handleVoiceCloning = async (transcription) => {
  if (userAudioFiles.length >= userAudioFilesCombineNum) {
    console.log("Combining user audio files...");
    glo.setCurrentStatus("Combining user audio files...");
    currentStatus = "Combining user audio files...";

    audio
      .combineAudioFiles(folderPath, userAudioFiles)
      .then(async (combinedFilePath) => {
        console.log("User audio combined successfully:", combinedFilePath);

        glo.setCurrentStatus("Start voice cloning process...");
        currentStatus = "Start voice cloning process...";

        const cloneVoicePromise = elevenlab
          .cloneUserVoice(combinedFilePath, userCloneNum)
          .then(async (newVoiceID) => {
            const previousVoiceId = glo.getVoiceId();

            if (voiceIDList.includes(previousVoiceId)) {
              await elevenlab.deleteOldVoice(
                previousVoiceId,
                voiceIDDeleteList
              );
            }

            glo.setVoiceId(newVoiceID);
            userCloneNum += 1;
            voiceIDList.push(newVoiceID);
          });

        await cloneVoicePromise;

        console.log("--Cloning completed.");
        glo.setCurrentStatus("Cloning completed...");
        currentStatus = "Cloning completed...";
      })
      .catch((err) => console.error("Error combining audio files:", err));
  } else {
    glo.setCurrentStatus(
      "Interact with system one more time to start voice cloning..."
    );
    currentStatus =
      "Interact with system one more time to start voice cloning...";
    console.log(
      `Not enough audio files to combine. At least ${userAudioFilesCombineNum} required.`
    );
  }
};

const handleCleanup = () => {
  audio.cleanupAudioFolder(folderPath, [
    ...userAudioFiles,
    ...gptAudioFiles,
    ...otherKeepFiles,
  ]);
  console.log("Cleanup completed.");
};

const debugFunctions = () => {
  console.log("-");
  console.log("--userAudioFiles:", userAudioFiles);
  console.log("--gptAudioFiles:", gptAudioFiles);
  console.log("--transcriptionArchives:", transcriptionArchives);
  console.log("--gptResponseArchives:", gptResponseArchives);
  console.log("--voiceIDList:", voiceIDList);
  console.log("--voiceIDDeleteList:", voiceIDDeleteList);
  console.log("---");
};

server.startServer(
  mic.startRecordingProcess,
  async () => {
    mic.stopRecordingProcess();
    const transcription = await handleRecording();
    await handleVoiceCloning(transcription);
    handleCleanup();
    debugFunctions();
    console.log("ALL ACTION COMPLETE--");
    glo.setCurrentStatus("All Action Complete... Please continue");
    currentStatus = "All Action Complete... Please continue";
  },
  () => currentStatus,
  () => transcriptionArchives
);
