//openai.js -> for functions that use openai API
//list of funtions:
//transcribeAudio, getOpenAIResponse,

import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
