const displayText = document.getElementById("displayText");
const promptText = document.getElementById("promptText");
const statusText = document.getElementById("statusText");

let isKeyPressed = false;

// Play audio and display text
async function playScene({ audio, text }) {
  const formattedText = (text || "").replace(/\n/g, "<br>");
  displayText.innerHTML = formattedText;
  promptText.textContent = "";
  statusText.textContent = "Playing audio...";

  const AUDIO_BASE_PATH = "./assets/stg0/";
  const audioPath = `${AUDIO_BASE_PATH}${audio}`;
  console.log(audioPath);
  const audioElement = new Audio(audioPath);

  return new Promise((resolve) => {
    audioElement.onended = () => {
      statusText.textContent = "";
      resolve();
    };
    audioElement.onerror = () => {
      console.error(`Failed to load audio: ${audioPath}`);
      statusText.textContent = "(Audio failed)";
      resolve();
    };
    audioElement.play();
  });
}

// Voice interaction step
async function handleInteraction(prompt, text) {
  // Show the scene's visible text (not the prompt)
  const formattedText = (text || "").replace(/\n/g, "<br>");
  displayText.innerHTML = formattedText;

  // Don't show the AI prompt to the user
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

// Run through entire sequence
async function runSequence() {
  for (const [index, step] of stg0_sequence.entries()) {
    console.log(`🌀 Step ${index}:`, step);

    if (step.interaction) {
      console.log("👉 Interaction step");
      await handleInteraction(step.prompt, step.text);
    } else {
      console.log("🎧 Playing scene:", step.audio);
      await playScene(step);
    }
  }

  displayText.textContent = "Using the key beside, now open the chest!";
  promptText.textContent = "";
  statusText.textContent = "";
}

runSequence();
