//elevenlab.js -> for functions that use elevenlab API
//list of funtions:
//convertTextToSpeech, cloneUserVoice, deleteOldVoice

import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

export const convertTextToSpeech = async (text, voiceID) => {
  console.log("Converting text to speech...");
  const fileName = `${Date.now()}.mp3`;
  const filePath = `./audio/${fileName}`;
  const audioStream = await client.textToSpeech.convert(voiceID, { text });
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on("finish", () => {
      console.log("convertTextToSpeech -- complete");
      resolve(fileName);
    });
    audioStream.on("error", reject);
  });
};

export const cloneUserVoice = async (outputFilePath, userNum) => {
  try {
    console.log("Cloning user voice...");
    const response = await client.voices.add({
      files: [fs.createReadStream(outputFilePath)],
      name: `Iteration${userNum}`,
      model_id: "eleven_multilingual_v2",
      remove_background_noise: true,
    });
    console.log(
      "--Voice cloned successfully. NEW VOICE ID:",
      response.voice_id
    );
    return response.voice_id;
  } catch (err) {
    console.error("Error cloning user voice:", err);
    throw err;
  }
};

export const deleteOldVoice = async (voiceID, voiceIDDeleteList) => {
  if (!voiceID) return;
  try {
    console.log(`Deleting old voice ID: ${voiceID}`);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voiceID}`,
      {
        method: "DELETE",
        headers: {
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
        },
      }
    );

    if (response.ok) {
      console.log(`Voice ID ${voiceID} deleted successfully.`);
      voiceIDDeleteList.push(voiceID);
    } else {
      const errorResponse = await response.json();
      console.error(`Failed to delete Voice ID ${voiceID}:`, errorResponse);
    }
  } catch (err) {
    console.error(`Error deleting Voice ID ${voiceID}:`, err);
  }
};
