import {
  stg0_sequence,
  stg1_sequence,
  stg2_sequence,
  stgEnd_sequence,
  stgMid_sequence,
  stgMidDone_sequence,
} from "./script_sequence.js";

const displayText = document.getElementById("story-text");
const promptText = document.getElementById("prompt-text");
const statusText = document.getElementById("status-text");

let isKeyPressed = false;
let ws = null;
let serverReady = false;
let displaySwitchReady = false;

// Initialize WebSocket connection
function initWebSocket() {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      statusText.textContent = "Waiting for server...";
    };

    ws.onmessage = async (event) => {
      console.log("WebSocket message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed WebSocket data:", data);
        
        if (data.type === "ready") {
          serverReady = true;
          resolve();
        } else if (data.type === "displaySwitch" && data.status === true) {
          console.log("Display switch is ON!");
          displaySwitchReady = true;
        }
      } catch (error) {
        console.log("Non-JSON message received:", event.data);
        if (event.data === "ready") {
          serverReady = true;
          resolve();
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      serverReady = false;
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        initWebSocket();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };
  });
}

// Function to send sequence step to server
function sendSequenceStep(step) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "sequence_step",
        step: step,
      })
    );
  }
}

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
async function handleInteraction(prompt, text, voiceId) {
  const formattedText = (text || "").replace(/\n/g, "<br>");
  displayText.innerHTML = formattedText;

  promptText.textContent = "";
  statusText.textContent = "Hold [the Golden Key] to speak";

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

        try {
          const res = await fetch("/stop-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            if (errorData.error === "No audio data recorded") {
              statusText.textContent =
                "No audio detected. Please hold [the Golden Key] and try again...";
              return; // Don't resolve, allowing user to try again
            }
            throw new Error(
              errorData.error || "Failed to process voice interaction"
            );
          }

          const data = await res.json();
          const gptText = data.responseText;

          displayText.textContent = gptText;
          statusText.textContent = "Speaking...";

          const audioRes = await fetch("/text-to-speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: gptText,
              voiceId: voiceId, // Pass the voiceId if provided
            }),
          });

          if (!audioRes.ok) {
            throw new Error("Failed to convert text to speech");
          }

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
        } catch (error) {
          console.error("Error in interaction:", error);
          statusText.textContent =
            "A little magic went astray. Please hold [The Golden Key] and try again…";
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  });
}

// Function to process a single step
async function processStep(step, basePath) {
  try {
    // Send step to server first
    sendSequenceStep(step);

    // Handle interaction
    if (step.interaction) {
      await handleInteraction(step.prompt, step.text, step.voiceId);
    } else {
      // Handle regular scene (audio + text)
      await playScene(step, basePath);
    }
  } catch (error) {
    console.error("Error processing step:", error);
  }
}

// Function to run a sequence
async function runSequence({ steps, basePath }) {
  for (const [index, step] of steps.entries()) {
    console.log(`------------------------`);
    console.log(`🌀 Step ${index}:`, step);
    await processStep(step, basePath);
  }
}

// Initialize the experience
async function startStory() {
  try {
    // Wait for WebSocket connection and server ready
    statusText.textContent = "Connecting to server...";
    await initWebSocket();
    statusText.textContent = "Connected! Starting story...";

    // Define sequences with their base paths
    const sequence0 = {
      basePath: "./assets/stg0/",
      steps: stg0_sequence,
    };

    const sequence1 = {
      basePath: "./assets/stg1/",
      steps: stg1_sequence,
    };

    const sequenceMid = {
      basePath: "./assets/stgMid/",
      steps: stgMid_sequence,
    };

    const sequenceMidDone = {
      basePath: "./assets/stgMidDone/",
      steps: stgMidDone_sequence,
    };

    const sequence2 = {
      basePath: "./assets/stg2/",
      steps: stg2_sequence,
    };

    const sequenceEnd = {
      basePath: "./assets/stgEnd/",
      steps: stgEnd_sequence,
    };

    // Run sequences in order
    // await runSequence(sequence0);
    // await runSequence(sequence1);
    await runSequence(sequenceMid);

    // Wait for key press to continue
    console.log("Press [.] to continue...");
    statusText.textContent = "Press [The Golden Key] to continue your journey...";
    
    await new Promise((resolve) => {
      const onKeyDown = (e) => {
        if (e.code === "Period") {
          console.log("Key pressed, continuing with story...");
          document.removeEventListener("keydown", onKeyDown);
          resolve();
        }
      };
      document.addEventListener("keydown", onKeyDown);
    });

    await runSequence(sequenceMidDone);
    await runSequence(sequence2);
    // await runSequence(sequenceEnd);
  } catch (error) {
    console.error("Failed to start story:", error);
    statusText.textContent =
      "Failed to connect to server. Please refresh the page.";
  }
}

// Start when the page loads
window.addEventListener("load", startStory);
