// script_html.js
// HTML Communication
// post request + direct link to html functions

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
    .then((response) => response.json())
    .then((data) => {
      nodeStatusIndicator.textContent = data.status || "idle";
    })
    .catch((error) => {
      console.error("Error fetching node status:", error);
      nodeStatusIndicator.textContent = "---";
    });
};

setInterval(updateNodeStatus, 500);
