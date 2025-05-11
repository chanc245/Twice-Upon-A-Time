// index_may6.js
//ver20 may6
//conbining index_arduino + index_apr8_mvp

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

import * as mic from "./shared/mic.js";
import * as audio from "./shared/audio.js";
import * as elevenlab from "./shared/elevenlab.js";
import * as glo from "./shared/gloVariable.js";
import * as openai from "./shared/openai.js";
import * as server from "./shared/server.js";

dotenv.config();

// Initialize variables
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

// Express setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "./public_may6")));

// Create HTTP server and WebSocket server
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Set();

// Arduino communication endpoints
app.get("/displaySwitch", (req, res) => {
  sendMsgToArduino("displaySwitch");
  res.send("OK");
});

app.get("/act1Switch", (req, res) => {
  sendMsgToArduino("act1Switch");
  res.send("OK");
});

app.get("/act2Switch", (req, res) => {
  sendMsgToArduino("act2Switch");
  res.send("OK");
});

app.get("/act3Switch", (req, res) => {
  sendMsgToArduino("act3Switch");
  res.send("OK");
});

app.get("/act4Switch", (req, res) => {
  sendMsgToArduino("act4Switch");
  res.send("OK");
});

app.get("/char1Swch", (req, res) => {
  sendMsgToArduino("char1Swch");
  res.send("OK");
});

app.get("/char2Swch", (req, res) => {
  sendMsgToArduino("char2Swch");
  res.send("OK");
});

app.get("/char3Swch", (req, res) => {
  sendMsgToArduino("char3Swch");
  res.send("OK");
});

app.get("/char4Swch", (req, res) => {
  sendMsgToArduino("char4Swch");
  res.send("OK");
});

app.get("/char5Swch", (req, res) => {
  sendMsgToArduino("char5Swch");
  res.send("OK");
});

app.get("/allFalse", (req, res) => {
  sendMsgToArduino("allFalse");
  res.send("OK");
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New client connected!");
  clients.add(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
    console.log("---------------------");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Global function to send messages to all connected Arduino clients
function sendMsgToArduino(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log(`Sent to Arduino: ${message}`);
    }
  });
}

// Voice processing functions
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
