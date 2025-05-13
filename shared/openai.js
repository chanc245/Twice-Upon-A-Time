//openai.js
//  Transcription + GPT logic.
//  export functions: transcribeAudio, getOpenAIResponse,

import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const transcribeAudio = async (filePath) => {
  console.log("Transcribing audio...");
  const audioFile = fs.createReadStream(filePath);
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

export async function getGptResultAsString(input) {
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
