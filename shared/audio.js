//audio.js -> for audio related functions
//list of funtions:
//playAudio, combineAudioFiles, cleanupAudioFolder

import fs from "fs";
import { Writer } from "wav";
import { exec } from "child_process";
import path from "path";
import sound from "sound-play";

export const saveAudio = async (audioChunks) => {
  console.log("Saving audio...");
  const audioBuffer = Buffer.concat(audioChunks);
  const wavWriter = new Writer({ sampleRate: 16000, channels: 1 });
  const filename = `${Date.now()}.wav`;
  const filePath = `./audio/${filename}`;

  return new Promise((resolve, reject) => {
    wavWriter.pipe(fs.createWriteStream(filePath));
    wavWriter.on("finish", () => resolve(filename));
    wavWriter.on("error", reject);
    wavWriter.end(audioBuffer);
  });
};

export const playAudio = async (folderPath, fileName) => {
  try {
    const audioFilePath = path.join(folderPath, fileName);
    console.log(`Playing audio: ${audioFilePath}`);
    await sound.play(audioFilePath);
    console.log("Audio playback finished.");
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};

export const combineAudioFiles = async (folderPath, userAudioFiles) => {
  const fileListPath = "user_filelist.txt";
  const fileListContent = userAudioFiles
    .map((file) => `file '${folderPath}${file}'`)
    .join("\n");

  fs.writeFileSync(fileListPath, fileListContent);

  const outputFilePath = `${folderPath}combined_${Date.now()}.wav`;
  const command = `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputFilePath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve(outputFilePath);
    });
  });
};

export const cleanupAudioFolder = (folderPath, filesToKeep) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading audio folder:", err);
      return;
    }
    files.forEach((file) => {
      if (!filesToKeep.includes(file)) {
        fs.unlinkSync(`${folderPath}/${file}`);
      }
    });
  });
};
