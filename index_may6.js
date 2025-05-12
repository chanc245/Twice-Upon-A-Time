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
import { getGptResultAsString } from "./shared/openai.js";
import { convertTextToSpeech } from "./shared/elevenlab.js";
import path from "path";

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
app.use("/assets", express.static(join(__dirname, "./public_may6/assets")));
app.use("/audio", express.static(join(__dirname, "./audio")));

// Create HTTP server and WebSocket server
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Set();

// Voice processing routes
app.post("/start-recording", (req, res) => {
  try {
    mic.startRecordingProcess();
    console.log("Recording started successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error starting recording:", error);
    res.status(500).json({ error: "Failed to start recording" });
  }
});

app.post("/stop-recording", async (req, res) => {
  try {
    mic.stopRecordingProcess();
    console.log("Recording stopped, processing...");
    
    // Get audio chunks and process them
    const audioChunks = mic.getAudioChunks();
    if (!audioChunks || audioChunks.length === 0) {
      throw new Error("No audio data recorded");
    }

    // Save audio and get transcription
    const audioFile = await audio.saveAudio(audioChunks);
    if (!audioFile) {
      throw new Error("Failed to save audio file");
    }

    const transcription = await openai.transcribeAudio(audioFile);
    if (!transcription) {
      throw new Error("Failed to transcribe audio");
    }

    console.log("Transcription received:", transcription);
    transcriptionArchives.push(transcription);

    const prompt = req.body?.prompt || "You are a helpful guide.";
    console.log("📥 Prompt from frontend:", prompt);
    console.log("🗣️ Latest transcription:", transcription);

    const fullPrompt = `${prompt}\nUser said: ${transcription}`;
    console.log("🔍 fullPrompt:", fullPrompt);
    const responseText = await getGptResultAsString(fullPrompt);

    res.json({ responseText });
  } catch (error) {
    console.error("❌ Error in /stop-recording:", error);
    res.status(500).json({ error: "Failed to process voice interaction." });
  }
});

app.post("/submit", async (req, res) => {
  let input = req.body.input;

  try {
    const aiResponse = await getGptResultAsString(input);
    res.json({ ai: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate output. Please try again.",
    });
  }
});

app.get("/voice-id", (req, res) => {
  const voiceId = glo.getVoiceId();
  if (voiceId) {
    res.json({ voiceId });
  } else {
    res.status(404).json({ error: "No voice ID available." });
  }
});

app.post("/text-to-speech", async (req, res) => {
  try {
    const { text, voiceId = glo.getVoiceId() } = req.body;
    
    if (!text) {
      throw new Error("No text provided for text-to-speech conversion");
    }
    
    if (!voiceId) {
      throw new Error("No voice ID available for text-to-speech conversion");
    }

    console.log("Converting text to speech with voice ID:", voiceId);
    const audioFileName = await convertTextToSpeech(text, voiceId);
    const audioFilePath = path.join(folderPath, audioFileName);

    res.json({ audioFilePath });
  } catch (error) {
    console.error("Error in /text-to-speech endpoint:", error);
    res.status(500).json({ 
      error: "Text-to-speech conversion failed",
      details: error.message 
    });
  }
});

app.get("/status", async (req, res) => {
  try {
    const status = currentStatus;
    res.json({ status: status || "idle" });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

app.get("/latest-transcription", (req, res) => {
  if (transcriptionArchives.length > 0) {
    const latestTranscription = transcriptionArchives[transcriptionArchives.length - 1];
    if (typeof latestTranscription === "string") {
      res.status(200).json({ transcription: latestTranscription });
    } else {
      console.error("Invalid transcription format:", latestTranscription);
      res.status(500).json({ error: "Invalid transcription format" });
    }
  } else {
    res.status(404).json({ error: "No transcription data available." });
  }
});

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

// Function to handle Arduino commands from sequence
function handleArduinoCommand(command) {
  if (command) {
    console.log(`Sending Arduino command: ${command}`);
    sendMsgToArduino(command);
  }
}

// Function to process sequence step
async function processSequenceStep(step) {
  try {
    // Handle audio if present
    if (step.audio) {
      const audioFilePath = path.join(folderPath, step.audio);
      // Play audio logic here
    }

    // Handle text if present
    if (step.text) {
      // Display text logic here
    }

    // Handle Arduino command if present
    if (step.arduino) {
      handleArduinoCommand(step.arduino);
    }

    // Handle interaction if present
    if (step.interaction) {
      // Interaction logic here
    }
  } catch (error) {
    console.error("Error processing sequence step:", error);
  }
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New client connected!");
  clients.add(ws);
  
  // Send ready message to the client
  ws.send("ready");

// Assuming you're receiving the data in a WebSocket connection
ws.on('message', function(data) {
  // Convert the buffer to a string
  const message = data.toString('utf8');
  console.log('Raw message received from Arduino:', message);
  
  try {
    const jsonData = JSON.parse(message);
    console.log('Parsed JSON data:', jsonData);
    
    // Access the displaySwitch value
    if (jsonData.displaySwitch === true) {
      console.log('Display switch is ON, sending to client...');
      // Send a message to the client
      const clientMessage = JSON.stringify({ type: "displaySwitch", status: true });
      console.log('Sending to client:', clientMessage);
      ws.send(clientMessage);
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

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
  try {
    console.log("Processing recording...");
    glo.setCurrentStatus("Processing recording...");
    currentStatus = "Processing recording...";

    const audioChunks = mic.getAudioChunks();
    if (!audioChunks || audioChunks.length === 0) {
      throw new Error("No audio chunks available");
    }

    const audioFile = await audio.saveAudio(audioChunks);
    if (!audioFile) {
      throw new Error("Failed to save audio file");
    }

    userAudioFiles.push(audioFile);

    const transcription = await openai.transcribeAudio(audioFile);
    if (!transcription) {
      throw new Error("Failed to transcribe audio");
    }

    console.log("--TRANSCRIPTION:", transcription);
    transcriptionArchives.push(transcription);

    return transcription;
  } catch (error) {
    console.error("Error in handleRecording:", error);
    throw error;
  }
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

// Start server on port 8080
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`------------------------------`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
