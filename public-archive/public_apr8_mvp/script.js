import {
  stg0_sequence,
  stg1_sequence,
  stg2_sequence,
} from "./script_sequence.js";

const sequence0 = {
  basePath: "./assets/stg0/",
  steps: stg0_sequence,
};

const sequence1 = {
  basePath: "./assets/stg1/",
  steps: stg1_sequence,
};

const sequence2 = {
  basePath: "./assets/stg2/",
  steps: stg2_sequence,
};

const displayText = document.getElementById("displayText");
const promptText = document.getElementById("promptText");
const statusText = document.getElementById("statusText");

let isKeyPressed = false;

// Play audio and display text
async function playScene({ audio, text }, basePath) {
  const formattedText = (text || "").replace(/\n/g, "<br>");
  displayText.innerHTML = formattedText;
  promptText.textContent = "";
  statusText.textContent = "Playing audio...";

  const audioPath = `${basePath}${audio}`;
  console.log("▶️ Playing:", audioPath);
  const audioElement = new Audio(audioPath);

  return new Promise((resolve) => {
    audioElement.onended = () => {
      statusText.textContent = "";
      resolve();
    };
    audioElement.onerror = () => {
      console.error(`❌ Failed to load audio: ${audioPath}`);
      statusText.textContent = "(Audio failed)";
      resolve();
    };
    audioElement.play();
  });
}

// Voice interaction step
async function handleInteraction(prompt, text) {
  const formattedText = (text || "").replace(/\n/g, "<br>");
  displayText.innerHTML = formattedText;

  promptText.textContent = "";
  statusText.textContent = "Hold [.] to speak";

  return new Promise((resolve) => {
    const onKeyDown = (e) => {
      if (e.code === "Period" && !isKeyPressed) {
        isKeyPressed = true;
        fetch("/start-recording", { method: "POST" });
        statusText.textContent = "Recording...";
      }
    };

    const onKeyUp = async (e) => {
      if (e.code === "Period" && isKeyPressed) {
        isKeyPressed = false;
        statusText.textContent = "Processing...";

        const res = await fetch("/stop-recording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        const gptText = data.responseText;

        displayText.textContent = gptText;
        statusText.textContent = "Speaking...";

        const audioRes = await fetch("/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: gptText }),
        });
        const { audioFilePath } = await audioRes.json();

        const audio = new Audio(audioFilePath);
        audio.onended = () => {
          statusText.textContent = "";
          document.removeEventListener("keydown", onKeyDown);
          document.removeEventListener("keyup", onKeyUp);
          resolve();
        };
        audio.onerror = () => {
          statusText.textContent = "(Failed to play AI response)";
          resolve();
        };
        audio.play();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  });
}

async function runSequence({ steps, basePath }) {
  for (const [index, step] of steps.entries()) {
    console.log(`🌀 Step ${index}:`, step);

    if (step.interaction) {
      console.log("👉 Interaction step");
      await handleInteraction(step.prompt, step.text);
    } else {
      console.log("🎧 Playing scene:", step.audio);
      await playScene(step, basePath);
    }
  }

  displayText.textContent = "THE END (for now)";
  promptText.textContent = "";
  statusText.textContent = "";
}

async function startStory() {
  await runSequence(sequence0);
  await runSequence(sequence1);
  await runSequence(sequence2);
}

startStory();
