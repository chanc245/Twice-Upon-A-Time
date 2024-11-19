//ver 12 oct30
//-> web puzzle try out

import mic from "mic";
import sound from "sound-play";
import { exec } from "child_process";

import { Writer } from "wav";
import { Writable } from "stream";

import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ElevenLabsClient, ElevenLabs } from "elevenlabs";

import * as fs from "fs";
import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

// routes to html
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "public_puzzle")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// routes to html - Post requests - start recording
app.post("/start-recording", (req, res) => {
  console.log("Recording started via button...");
  startRecording();
  res.sendStatus(200);
});

// post request - stop recording
app.post("/stop-recording", (req, res) => {
  console.log("Recording stopped via button...");
  micInstance.stop();
  stopRecording();
  res.sendStatus(200);
});

// post request - puzzle gpt interaction
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

// Endpoint to get the latest transcription
app.get("/latest-transcription", (req, res) => {
  const latestTranscription = transcriptionArchives.slice(-1)[0]; // Get the last item in the array
  res.json({
    transcription: latestTranscription || "No transcription available.",
  });
});

// api activation
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});
const openai = new OpenAI();

// DEF - strings for audio archive
let userAudioFiles = [];
let gptAudioFiles = [];

let otherKeepFiles = ["user_filelist.txt"];

// DEF - text archive
let transcriptionArchives = [];
let gptResponseArchives = [];

let voiceID = "pMsXgVXv3BLzUgSXRplE";
let userNum = 0;

// mic setup
let micInstance = mic({
  rate: "16000",
  channels: "1",
  debug: false,
  exitOnSilence: 10,
});
let micInputStream = micInstance.getAudioStream();
let isRecording = false;
let audioChunks = [];

const startRecording = () => {
  console.log("Starting listening process...");
  micInstance.stop();
  micInputStream.unpipe();
  micInstance = mic({
    rate: "16000",
    channels: "1",
    debug: false,
  });
  micInputStream = micInstance.getAudioStream();
  audioChunks = [];
  isRecording = true;

  micInputStream.pipe(
    new Writable({
      write(chunk, _, callback) {
        if (!isRecording) return callback();
        audioChunks.push(chunk);
        callback();
      },
    })
  );

  micInstance.start();
};

// handle cleanup and processing after recording
const stopRecording = async () => {
  console.log("Processing recorded audio...");
  if (!isRecording) return;
  isRecording = false;

  const audioFilename = await saveAudio(audioChunks);
  const message = await transcribeAudio(audioFilename);
  transcriptionArchives.push(message);

  await processMessage(message, audioFilename);
  cleanupAudioFolder();
  await combineUserAudioFiles();
};

// clean up the audio folder
const cleanupAudioFolder = () => {
  const folderPath = "./audio/";
  const filesToKeep = [...userAudioFiles, ...gptAudioFiles, ...otherKeepFiles];

  fs.readdir(folderPath, (err, files) => {
    if (err) return console.error("Error reading the audio folder:", err);

    files
      .filter((file) => !filesToKeep.includes(file))
      .forEach((file) =>
        fs.unlink(
          `${folderPath}${file}`,
          (err) => err && console.error("Error deleting file:", err)
        )
      );
  });
};

const processMessage = async (message, audioFilename) => {
  if (message) {
    console.log("Message detected...");
    userAudioFiles.push(audioFilename);

    const responseText = await getOpenAIResponse(message);
    gptResponseArchives.push(responseText);

    const fileName = await convertResponseToAudio(responseText);

    console.log("Playing audio...");
    await sound.play("./audio/" + fileName);
    console.log("Playback finished...");

    debug_allConsoleLogMessage(); ///ALLL DEBUG MESSAGES
  }
};

// save audio to file
const saveAudio = async (audioChunks) => {
  return new Promise((resolve, reject) => {
    console.log("Saving audio...");
    const audioBuffer = Buffer.concat(audioChunks);
    const wavWriter = new Writer({ sampleRate: 16000, channels: 1 });
    const filename = `${Date.now()}.wav`;
    const filePath = "./audio/" + filename;

    wavWriter.pipe(fs.createWriteStream(filePath));
    wavWriter.on("finish", () => {
      resolve(filename);
    });
    wavWriter.on("error", reject);
    wavWriter.end(audioBuffer);
  });
};

// transcribe audio
const transcribeAudio = async (filename) => {
  console.log("Transcribing audio:", filename);
  const audioFile = fs.createReadStream("./audio/" + filename);
  const transcriptionResponse = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  return transcriptionResponse.text;
};

// openAI response
const getOpenAIResponse = async (message) => {
  console.log("Communicating with OpenAI...");
  const chat = new ChatOpenAI();
  const response = await chat.call([
    new SystemMessage("You are a helpful voice assistant"),
    new HumanMessage(message),
  ]);
  return response.text;
};

// Eleven Labs audio conversion
const convertResponseToAudio = async (text) => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  const fileName = `${Date.now()}.mp3`;

  console.log("Converting response to audio...");

  // const audioStream = await voice.textToSpeechStream(
  //     apiKey,
  //     voiceID,
  //     text
  // );

  const audioStream = await client.textToSpeech.convert(voiceID, {
    optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
    // output_format: ElevenLabs.OutputFormat.Mp32205032,
    text: text,
    voice_settings: {
      stability: 0.1,
      similarity_boost: 0.3,
      style: 0.2,
    },
  });

  const fileWriteStream = fs.createWriteStream("./audio/" + fileName);

  audioStream.pipe(fileWriteStream);
  return new Promise((resolve, reject) => {
    fileWriteStream.on("finish", () => {
      console.log("Audio conversion done...");
      gptAudioFiles.push(fileName);
      resolve(fileName);
    });
    audioStream.on("error", reject);
  });
};

// combine audio files + train
const combineUserAudioFiles = async () => {
  const folderPath = "./audio/";

  const fileListPath = "user_filelist.txt";
  const fileListContent = userAudioFiles
    .map((file) => `file '${folderPath}${file}'`)
    .join("\n");

  fs.writeFileSync(fileListPath, fileListContent);

  let numAudioFiles = 2;
  if (userAudioFiles.length < numAudioFiles) {
    console.log(
      `Not enough user audio files to combine. At least ${numAudioFiles} are required.`
    );
    return;
  }

  const outputFilePath = `${folderPath}combined_user_${Date.now()}.wav`;
  const command = `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputFilePath}`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error combining user audio files: ${error.message}`);
      return;
    }
    console.log("User audio files combined successfully into:", outputFilePath);

    try {
      const newVoiceID = await cloneUserVoice(outputFilePath, userNum);
      userNum += 1; // Increment the user number
      voiceID = newVoiceID; // Update the global voiceID
      console.log("--All action ended, continue to speak--");
    } catch (err) {
      console.error("Failed to clone voice:", err);
    }
  });
};

// clonning use voice
const cloneUserVoice = async (outputFilePath, userNum) => {
  try {
    console.log("Cloning user voice...");
    const ElevenLabsResponse = await client.voices.add({
      files: [fs.createReadStream(outputFilePath)],
      name: "User" + userNum,
      model_id: "eleven_multilingual_v2",
      remove_background_noise: true,
    });
    console.log("Voice added successfully with ID:", ElevenLabsResponse);
    return ElevenLabsResponse.voice_id; // Return the new voice ID
  } catch (err) {
    console.error("Error adding voice to ElevenLabs:", err);
    throw err; // Throw the error to handle it where the function is called
  }
};

// puzzle gpt
async function getGptResultAsString(input) {
  console.log("--Run GPT");

  const openai = new OpenAI({
    apiKey: process.env.GPTAPIKEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      model: "gpt-4o-2024-05-13",
      temperature: 0.1,
    });

    return (
      completion.choices[0]?.message?.content ||
      "No response received from GPT-3."
    );
  } catch (error) {
    console.error("GPT-3 Error:", error);
    throw error;
  }
}

function debug_allConsoleLogMessage() {
  console.log("-");
  console.log("--userAudioFiles:", userAudioFiles);
  console.log("--gptAudioFiles:", gptAudioFiles);
  console.log("-");
  console.log("--transcriptionArchives:", transcriptionArchives);
  console.log("--gptResponseArchives:", gptResponseArchives);
  console.log("---");
  //   console.log("--audioChunks:", audioChunks)
  console.log("");
}

process.stdin.resume();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
