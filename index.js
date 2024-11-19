//node.js
//ver16 nov19
//final tech prototype

import {
  startRecordingProcess,
  stopRecordingProcess,
  getAudioChunks,
} from "./shared/mic.js";
import {
  saveAudio,
  combineAudioFiles,
  cleanupAudioFolder,
  playAudio,
} from "./shared/audio.js";
import {
  convertTextToSpeech,
  cloneUserVoice,
  deleteOldVoice,
} from "./shared/elevenlab.js";
import { transcribeAudio, getOpenAIResponse } from "./shared/openai.js";
import { startServer } from "./shared/server.js";
import dotenv from "dotenv";

dotenv.config();

const folderPath = "./audio/";
let userAudioFiles = [];
let gptAudioFiles = [];
let otherKeepFiles = ["user_filelist.txt"];

let transcriptionArchives = [];
let gptResponseArchives = [];

const userAudioFilesCombineNum = 1;
let VOICE_ID = "pMsXgVXv3BLzUgSXRplE";
let voiceIDList = [];
let voiceIDDeleteList = [];
let userCloneNum = 0;

let currentStatus = "";

const handleRecording = async () => {
  console.log("Processing recording...");
  currentStatus = "Processing recording...";
  const audioChunks = getAudioChunks();
  const audioFile = await saveAudio(audioChunks);
  userAudioFiles.push(audioFile);

  const transcription = await transcribeAudio(audioFile);
  console.log("--TRANSCRIPTION:", transcription);
  transcriptionArchives.push(transcription);

  return transcription;
};

const handleAIProcessing = async (transcription) => {
  //for voice interaction
  const responseText = await getOpenAIResponse(transcription);
  console.log("--RESPONSE:", responseText);
  gptResponseArchives.push(responseText);

  console.log("Converting response to speech...");
  currentStatus = "Converting response to speech...";
  const responseAudioFile = await convertTextToSpeech(responseText, VOICE_ID);
  gptAudioFiles.push(responseAudioFile);

  let combinePromise = Promise.resolve();

  if (userAudioFiles.length >= userAudioFilesCombineNum) {
    console.log("Combining user audio files...");
    combinePromise = combineAudioFiles(folderPath, userAudioFiles)
      .then(async (combinedFilePath) => {
        console.log("User audio combined successfully:", combinedFilePath);

        currentStatus = "Start voice cloning process...";
        const cloneVoicePromise = cloneUserVoice(
          combinedFilePath,
          userCloneNum
        ).then(async (newVoiceID) => {
          await deleteOldVoice(VOICE_ID, voiceIDDeleteList);

          userCloneNum += 1;
          VOICE_ID = newVoiceID;
          voiceIDList.push(newVoiceID);
        });

        const playAudioPromise = playAudio(folderPath, responseAudioFile);

        await Promise.all([cloneVoicePromise, playAudioPromise]);

        console.log("--Cloning and playback completed.");
        currentStatus = "Cloning and playback completed...";
      })
      .catch((err) => console.error("Error combining audio files:", err));
  } else {
    currentStatus =
      "Interact with system one more time to start voice cloning...";
    console.log(
      `Not enough audio files to combine. At least ${userAudioFilesCombineNum} required.`
    );

    await playAudio(folderPath, responseAudioFile);
  }

  await combinePromise;
};

const handleVoiceCloning = async (transcription) => {
  //for voice interaction
  // const responseText = await getOpenAIResponse(transcription);
  // console.log("--RESPONSE:", responseText);
  // gptResponseArchives.push(responseText);

  // console.log("Converting response to speech...");
  // currentStatus = "Converting response to speech...";
  // const responseAudioFile = await convertTextToSpeech(responseText, VOICE_ID);
  // gptAudioFiles.push(responseAudioFile);

  let combinePromise = Promise.resolve();

  if (userAudioFiles.length >= userAudioFilesCombineNum) {
    console.log("Combining user audio files...");
    combinePromise = combineAudioFiles(folderPath, userAudioFiles)
      .then(async (combinedFilePath) => {
        console.log("User audio combined successfully:", combinedFilePath);

        currentStatus = "Start voice cloning process...";
        const cloneVoicePromise = cloneUserVoice(
          combinedFilePath,
          userCloneNum
        ).then(async (newVoiceID) => {
          await deleteOldVoice(VOICE_ID, voiceIDDeleteList);

          userCloneNum += 1;
          VOICE_ID = newVoiceID;
          voiceIDList.push(newVoiceID);
        });

        // const playAudioPromise = playAudio(folderPath, responseAudioFile);

        // await Promise.all([cloneVoicePromise, playAudioPromise]);
        await Promise.all([cloneVoicePromise]);

        console.log("--Cloning and playback completed.");
        currentStatus = "Cloning and playback completed...";
      })
      .catch((err) => console.error("Error combining audio files:", err));
  } else {
    currentStatus =
      "Interact with system one more time to start voice cloning...";
    console.log(
      `Not enough audio files to combine. At least ${userAudioFilesCombineNum} required.`
    );

    // await playAudio(folderPath, responseAudioFile);
  }

  await combinePromise;
};

const handleCleanup = () => {
  cleanupAudioFolder(folderPath, [
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

startServer(
  startRecordingProcess,
  async () => {
    stopRecordingProcess();
    const transcription = await handleRecording();
    // await handleAIProcessing(transcription); //for /public
    await handleVoiceCloning(transcription); //for /public_nov19

    handleCleanup();

    debugFunctions();

    console.log("ALL ACTION COMPLETE--");
    currentStatus = "All Action Complete... Please continue";
  },
  () => currentStatus,
  () => transcriptionArchives
);
