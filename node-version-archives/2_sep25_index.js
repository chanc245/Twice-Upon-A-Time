import mic from 'mic';
import sound  from 'sound-play'
import { Writer } from 'wav';
import { Writable } from 'stream';
import fs, { createWriteStream } from 'fs';
import { OpenAI } from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import voice from 'elevenlabs-node';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI();
const keyword = "gpt";
// mic setup.
let micInstance = mic({ rate: '16000', channels: '1', debug: false, exitOnSilence: 6 });
let micInputStream = micInstance.getAudioStream();
let isRecording = false;
let audioChunks = [];
// recording.
const startRecordingProcess = () => {
    console.log("Starting listening process...");
    micInstance.stop();
    micInputStream.unpipe();
    micInstance = mic({ rate: '16000', channels: '1', debug: false, exitOnSilence: 10 });
    micInputStream = micInstance.getAudioStream();
    audioChunks = [];
    isRecording = true;
    micInputStream.pipe(new Writable({
        write(chunk, _, callback) {
            if (!isRecording) return callback();
            audioChunks.push(chunk);
            callback();
        }
    }));
    micInputStream.on('silence', handleSilence);
    micInstance.start();
};
// silence and detection.
const handleSilence = async () => {
    console.log("Detected silence...");
    if (!isRecording) return;
    isRecording = false;
    micInstance.stop();
    const audioFilename = await saveAudio(audioChunks);
    const message = await transcribeAudio(audioFilename);
    if (message && message.toLowerCase().includes(keyword)) {
        console.log("Keyword detected...");
        const responseText = await getOpenAIResponse(message);
        const fileName = await convertResponseToAudio(responseText);
        console.log("Playing audio...");
        await sound.play('./audio/' + fileName);
        console.log("Playback finished...");
    }
    startRecordingProcess();
};
// save audio
const saveAudio = async audioChunks => {
    return new Promise((resolve, reject) => {
        console.log("Saving audio...");
        const audioBuffer = Buffer.concat(audioChunks);
        const wavWriter = new Writer({ sampleRate: 16000, channels: 1 });
        const filename = `${Date.now()}.wav`;
        const filePath = './audio/' + filename;
        wavWriter.pipe(createWriteStream(filePath));
        wavWriter.on('finish', () => {
            resolve(filename);
        });
        wavWriter.on('error', err => {
            reject(err);
        });
        wavWriter.end(audioBuffer);
    });
};
// transcribe audio 
const transcribeAudio = async filename => {
    console.log("Transcribing audio...");
    const audioFile = fs.createReadStream('./audio/' + filename);
    const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
    });
    return transcriptionResponse.text;
};
// openAI.
const getOpenAIResponse = async message => {
    console.log("Communicating with OpenAI...");
    const chat = new ChatOpenAI();
    const response = await chat.call([
        new SystemMessage("You are a helpful voice assistant"),
        new HumanMessage(message),
    ]);
    return response.text;
};
// Eleven Labs.
const convertResponseToAudio = async text => {
    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    const voiceID = "pNInz6obpgDQGcFmaJgB";
    const fileName = `${Date.now()}.mp3`;

    console.log("Converting response to audio...");

    const audioStream = await voice.textToSpeechStream(apiKey, voiceID, text);
    const fileWriteStream = fs.createWriteStream('./audio/' + fileName);

    audioStream.pipe(fileWriteStream);
    return new Promise((resolve, reject) => {
        fileWriteStream.on('finish', () => {
            console.log("Audio conversion done...");
            console.log("---");
            console.log("")
            resolve(fileName);
        });
        audioStream.on('error', reject);
    });
};

startRecordingProcess();
process.stdin.resume();