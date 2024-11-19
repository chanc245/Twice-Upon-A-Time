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
import path from "path";

const audioFolderPath = "./audio";

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let transcriptionArchives = [];

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public_proto_nov19")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public_proto_nov19/index.html"));
});

export const startServer = (
  startRecording,
  stopRecording,
  getCurrentStatus,
  getTranscriptionArchives
) => {
  app.post("/start-recording", (req, res) => {
    startRecording();
    res.sendStatus(200);
  });

  app.post("/stop-recording", (req, res) => {
    stopRecording();
    res.sendStatus(200);
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

      await playAudio(audioFolderPath, audioFileName);

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
