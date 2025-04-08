//server.js -> html routers + post requests
//list of funtions:
//startServer,

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getGptResultAsString } from "./openai.js";
import {
  getVoiceId,
  getCurrentStatus,
  setCurrentStatus,
} from "./gloVariable.js";
import { convertTextToSpeech } from "./elevenlab.js";
import { playAudio } from "./audio.js";
import { handleRecording } from "../index_apr8_mvp.js";
import path from "path";

const audioFolderPath = "./audio";

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let transcriptionArchives = [];

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public_apr8_mvp")));
app.use("/assets", express.static(join(__dirname, "../public_apr8_mvp/assets")));
app.use("/audio", express.static(join(__dirname, "../audio")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public_apr8_mvp/index.html"));
});

export const startServer = (
  startRecording,
  stopRecording,
  getCurrentStatus,
  getTranscriptionArchives
) => {
  // Update transcriptionArchives whenever we get new transcriptions
  setInterval(() => {
    transcriptionArchives = getTranscriptionArchives();
  }, 1000); // Check every second for new transcriptions

  app.post("/start-recording", (req, res) => {
    startRecording();
    res.sendStatus(200);
  });

  app.post("/stop-recording", async (req, res) => {
    stopRecording();
    
    const prompt = req.body?.prompt || "You are a helpful guide.";

    try {
      // Wait for a short time to allow transcription to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update transcriptionArchives and get latest transcription
      transcriptionArchives = getTranscriptionArchives();
      const transcription = transcriptionArchives[transcriptionArchives.length - 1];

      if (!transcription) {
        throw new Error("No transcription available");
      }

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
    const voiceId = getVoiceId();
    if (voiceId) {
      res.json({ voiceId });
    } else {
      res.status(404).json({ error: "No voice ID available." });
    }
  });

  app.post("/text-to-speech", async (req, res) => {
    const { text, voiceId = getVoiceId() } = req.body;

    try {
      const audioFileName = await convertTextToSpeech(text, voiceId);
      const audioFilePath = path.join(audioFolderPath, audioFileName);

      res.json({ audioFilePath });
    } catch (error) {
      console.error("Error in /text-to-speech endpoint:", error);
      res.status(500).json({ error: "Text-to-speech conversion failed." });
    }
  });

  app.get("/status", async (req, res) => {
    try {
      const status = await getCurrentStatus();
      res.json({ status: status || "idle" });
    } catch (error) {
      console.error("Error fetching status:", error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  app.get("/latest-transcription", (req, res) => {
    transcriptionArchives = getTranscriptionArchives();

    if (transcriptionArchives.length > 0) {
      const latestTranscription =
        transcriptionArchives[transcriptionArchives.length - 1];
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

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};
