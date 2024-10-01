import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';
import speech from '@google-cloud/speech';
import fs from 'fs';

// const app = express();

// app.use(cors());
// app.use(express.json());

// const port = process.env.PORT || 3001;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// app.use(express.static(join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });

async function main() {
  const client = new speech.SpeechClient();
  const filename = './resources/voice_sample_ch1.wav';

  const file = fs.readFileSync(filename);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 8000,
    languageCode: 'en-US'
  };

  const request = {
    audio: audio,
    config: config
  };

  const [response] = await client.recognize(request);
  const transcription = response.results.map(result => 
    result.alternatives[0].transcript).join('\n');
    console.log(`Transcription: ${transcription}`);
}

main().catch(console.error);


// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });