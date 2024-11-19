//ver15 nov15
//clean up code in different files (based on useage) (cleaned based on 8_oct5)
//create shared folder

import dotenv from "dotenv";
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
  transcribeAudio,
  getOpenAIResponse,
  convertTextToSpeech,
} from "./shared/ai.js";
import { startServer } from "./shared/server.js";

dotenv.config();

const audioFolderPath = "./audio/";
const userAudioFiles = [];
const gptAudioFiles = [];
const otherKeepFiles = ["user_filelist.txt"];
const userAudioFilesCombineNum = 1;
let VOICE_ID = "pMsXgVXv3BLzUgSXRplE";

const handleRecording = async () => {
  try {
    console.log("Processing recording...");
    const audioChunks = getAudioChunks();
    const audioFile = await saveAudio(audioChunks);
    userAudioFiles.push(audioFile);

    const transcription = await transcribeAudio(audioFile);
    console.log("--TRANSCRIPTION:", transcription);

    return transcription;
  } catch (error) {
    console.error("Error during recording handling:", error);
    throw error;
  }
};

const handleAIProcessing = async (transcription) => {
  try {
    const responseText = await getOpenAIResponse(transcription);
    console.log("--RESPONSE:", responseText);

    console.log("Converting response to speech...");
    const responseAudioFile = await convertTextToSpeech(responseText, VOICE_ID);
    gptAudioFiles.push(responseAudioFile);

    if (userAudioFiles.length > userAudioFilesCombineNum) {
      console.log("Combining user audio files...");
      await combineAudioFiles(audioFolderPath, userAudioFiles)
        .then((combinedFilePath) => {
          console.log("User audio combined successfully:", combinedFilePath);
        })
        .catch((err) => console.error("Error combining audio files:", err));
    } else {
      console.log("Not enough audio files to combine. Skipping...");
    }

    await playAudio(audioFolderPath, responseAudioFile);
    console.log("Audio played");
  } catch (error) {
    console.error("Error during AI processing:", error);
    throw error;
  }
};

const handleCleanup = () => {
  cleanupAudioFolder(audioFolderPath, [
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
  console.log("---");
};

startServer(startRecordingProcess, async () => {
  stopRecordingProcess();
  const transcription = await handleRecording();
  await handleAIProcessing(transcription);

  handleCleanup();

  debugFunctions();
});
