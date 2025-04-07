// script_html.js
//  Handles interaction with the backend for recording, status, and transcription.
//  Listens for . key (period) to toggle recording.
//  Auto-updates node status every 500ms.

const recordingIndicator = document.getElementById("recordingIndicator");
const inputButton = document.getElementById("inputButton");
const nodeStatusIndicator = document.getElementById("nodeStatusIndicator");

let isKeyPressed = false;

const isRecording = () => {
  recordingIndicator.textContent = "Recording...";
  recordingIndicator.style.color = "red";
};

const notRecording = () => {
  recordingIndicator.textContent = "Not Recording";
  recordingIndicator.style.color = "white";
};

window.addEventListener("keydown", (e) => {
  if (e.code === "Period" && !isKeyPressed) {
    isKeyPressed = true;
    fetch("/start-recording", { method: "POST" });
    isRecording();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Period" && isKeyPressed) {
    isKeyPressed = false;
    fetch("/stop-recording", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "transcription_complete") {
          fetchLatestTranscription();
        }
      })
      .catch((error) => console.error("Error stopping recording:", error));
    notRecording();
  }
});

document.getElementById("inputButton").addEventListener("click", () => {
  fetchLatestTranscription();
});

const updateNodeStatus = () => {
  fetch("/status")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      nodeStatusIndicator.textContent = data.status || "idle";
    })
    .catch((error) => {
      console.error("Error fetching node status:", error);
      nodeStatusIndicator.textContent = "error";
    });
};

setInterval(updateNodeStatus, 500);

const fetchLatestTranscription = () => {
  return fetch("/latest-transcription", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched transcription:", data.transcription);
      return data.transcription;
    })
    .catch((error) => {
      console.error("Error fetching transcription:", error);
      return null;
    });
};

inputButton.addEventListener("click", async () => {
  const transcription = await fetchLatestTranscription();
  if (transcription) {
    updateTranscriptionText(transcription);
  } else {
    console.error("No transcription data available.");
  }
});
