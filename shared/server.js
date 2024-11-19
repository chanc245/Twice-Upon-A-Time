//server.js -> html routers + post requests
//list of funtions:
//startServer,

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getGptResultAsString } from "./openai.js";

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

  app.get("/status", (req, res) => {
    const status = getCurrentStatus();
    res.json({ status: status || "idle" });
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
