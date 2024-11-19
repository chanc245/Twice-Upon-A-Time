//server.js -> html routers + post requests
//list of funtions:
//startServer,

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

export const startServer = (startRecording, stopRecording) => {
  app.post("/start-recording", (req, res) => {
    startRecording();
    res.sendStatus(200);
  });

  app.post("/stop-recording", (req, res) => {
    stopRecording();
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};
