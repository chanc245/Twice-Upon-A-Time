//past version for all ai files -- working with ver15 nov15
//new version seperate openai.js and elevenlab.js

import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ElevenLabsClient } from "elevenlabs";

import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

export const transcribeAudio = async (filename) => {
  console.log("Transcribing audio...");
  const audioFile = fs.createReadStream(`./audio/${filename}`);
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  return response.text;
};

export const getOpenAIResponse = async (message) => {
  console.log("Getting response from OpenAI...");
  const chat = new ChatOpenAI();
  const response = await chat.call([
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage(message),
  ]);
  return response.text;
};

export const convertTextToSpeech = async (text, voiceID) => {
  console.log("Converting text to speech...");
  const fileName = `${Date.now()}.mp3`;
  const audioStream = await client.textToSpeech.convert(voiceID, { text });
  const filePath = `./audio/${fileName}`;
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on("finish", () => resolve(fileName));
    audioStream.on("error", reject);
    console.log("convertTextToSpeech -- complete");
  });
};
