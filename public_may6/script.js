import {
  stg0_sequence,
  stg1_sequence,
  stg2_sequence,
  stg2End_sequence,
  stgEnd_sequence,
  stgMid_sequence,
  stgMidDone_sequence,
  stgStart_sequence,
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
    console.log("Sending sequence step to server:", step);
    // Send the full step data
    ws.send(
      JSON.stringify({
        type: "sequence_step",
        step: step,
      })
    );

    // If there's an Arduino command, send it separately
    if (step.arduino) {
      console.log("Sending Arduino command:", step.arduino);
      ws.send(
        JSON.stringify({
          type: "arduino_command",
          command: step.arduino,
        })
      );
    }
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
      console.log("✅ Audio finished playing:", audioPath);
      statusText.textContent = "";
      resolve();
    };
    audioElement.onerror = (error) => {
      console.error(`❌ Failed to load audio: ${audioPath}`, error);
      statusText.textContent = "(Audio failed)";
      resolve();
    };
    audioElement.oncanplaythrough = () => {
      console.log("🎵 Audio can play through:", audioPath);
    };
    audioElement.onloadstart = () => {
      console.log("📥 Starting to load audio:", audioPath);
    };
    audioElement.play().catch((error) => {
      console.error("❌ Error playing audio:", error);
      statusText.textContent = "(Audio failed to play)";
      resolve();
    });
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

// New function to handle summary generation and playback
async function generateAndPlaySummary() {
  try {
    console.log("🎭 Starting summary generation process...");
    statusText.textContent = "Weaving your words into the story's thread…";

    // Step 1: Force audio combination and voice cloning
    console.log("🔄 Combining stored audio files...");
    const audioResponse = await fetch("/combine-and-clone", {
      method: "POST",
    });

    if (!audioResponse.ok) {
      throw new Error("Failed to combine audio and clone voice");
    }

    const { newVoiceId } = await audioResponse.json();
    console.log("✅ Voice cloned successfully. New Voice ID:", newVoiceId);

    // Step 2: Get stored text inputs
    const response = await fetch("/get-stored-inputs");
    if (!response.ok) {
      throw new Error("Failed to get stored inputs");
    }
    const { storedTexts } = await response.json();

    if (storedTexts && storedTexts.length > 0) {
      // Step 3: Generate summary using GPT
      const summaryPrompt =
        "In ONE warm, positive SENTENCE, please summarize all the feedback from a first-person perspective.";
      const fullPrompt = `${summaryPrompt}\n\nUser responses:\n${storedTexts.join(
        "\n"
      )}`;

      console.log("🤖 Sending to GPT for summary...");
      const summaryResponse = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: fullPrompt }),
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate summary");
      }

      const { ai: summary } = await summaryResponse.json();
      console.log("✅ Summary generated:", summary);

      // Display the summary text
      displayText.innerHTML = summary.replace(/\n/g, "<br>");
      statusText.textContent = "Letting your tale come to life…";

      // Step 4: Convert summary to speech using the newly cloned voice
      const audioResponse = await fetch("/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summary,
          voiceId: newVoiceId,
        }),
      });

      if (!audioResponse.ok) {
        throw new Error("Failed to convert text to speech");
      }

      const { audioFilePath } = await audioResponse.json();

      // Step 5: Play the summary audio
      const audio = new Audio(audioFilePath);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          console.log("✅ Summary playback complete");
          statusText.textContent = "";
          resolve();
        };
        audio.onerror = (error) => {
          console.error("❌ Error playing summary:", error);
          statusText.textContent = "Please try again.";
          displayText.innerHTML = "The story missed a beat. Please try again.";
          reject(error);
        };
        audio.play();
      });
    } else {
      console.log("⚠️ No stored text inputs to summarize");
      statusText.textContent = "";
      displayText.innerHTML = "No responses to summarize";
    }
  } catch (error) {
    console.error("❌ Error in summary generation:", error);
    statusText.textContent = "Failed to generate summary";
    displayText.innerHTML = "Failed to generate summary";
    throw error;
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
    const sequenceStart = {
      basePath: "./assets/stgStart/",
      steps: stgStart_sequence,
    };

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
      basePath: "./assets/stgMid/",
      steps: stgMidDone_sequence,
    };

    const sequence2 = {
      basePath: "./assets/stg2/",
      steps: stg2_sequence,
    };

    const sequence2End = {
      basePath: "./assets/stg2/",
      steps: stg2End_sequence,
    };

    const sequenceEnd = {
      basePath: "./assets/stgEnd/",
      steps: stgEnd_sequence,
    };

    // Run sequences in order

    // Starting sequence - Intro music and text
    await runSequence(sequenceStart);
    statusText.textContent =
      "Please press [The Golden Key] on the small keyboard to start your journey...";
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

    // Stage 0 - Welcome and introduction
    await runSequence(sequence0);
    await runSequence(sequence1);
    await runSequence(sequenceMid);

    // Wait for key press to continue
    console.log("Press [.] to continue...");
    statusText.textContent = "Press [The Golden Key] on the small keyboard to continue your journey...";

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

    // Continue sequence
    await runSequence(sequenceMidDone);
    await runSequence(sequence2);

    // After all interactions are complete, generate and play summary
    await generateAndPlaySummary();

    // End sequences
    await runSequence(sequence2End);
    await runSequence(sequenceEnd);

    displayText.textContent = "THE END!";
    statusText.textContent = "Thank you for joining the story, traveler!";
  } catch (error) {
    console.error("Failed to start story:", error);
    statusText.textContent =
      "Failed to connect to server. Please refresh the page.";
  }
}

// Start when the page loads
window.addEventListener("load", startStory);
