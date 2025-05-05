import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

// Express setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "./public-archive/public_arduino")));

app.get("/", (req, res) => {
  res.sendFile(
    join(__dirname, "./public-archive/public_arduino/index_arduino.html")
  );
});

app.get("/displaySwitch", (req, res) => {
  sendMsgToArduino("displaySwitch");
  res.send("OK");
});

// ACT SWITCH
app.get("/act1Switch", (req, res) => {
  sendMsgToArduino("act1Switch");
  res.send("OK");
});

app.get("/act2Switch", (req, res) => {
  sendMsgToArduino("act2Switch");
  res.send("OK");
});

app.get("/act3Switch", (req, res) => {
  sendMsgToArduino("act3Switch");
  res.send("OK");
});

app.get("/act4Switch", (req, res) => {
  sendMsgToArduino("act4Switch");
  res.send("OK");
});

// CHAR SWITCH
app.get("/char1Swch", (req, res) => {
  sendMsgToArduino("char1Swch");
  res.send("OK");
});

app.get("/char2Swch", (req, res) => {
  sendMsgToArduino("char2Swch");
  res.send("OK");
});

app.get("/char3Swch", (req, res) => {
  sendMsgToArduino("char3Swch");
  res.send("OK");
});

app.get("/char4Swch", (req, res) => {
  sendMsgToArduino("char4Swch");
  res.send("OK");
});

app.get("/char5Swch", (req, res) => {
  sendMsgToArduino("char5Swch");
  res.send("OK");
});

app.get("/allFalse", (req, res) => {
  sendMsgToArduino("allFalse");
  res.send("OK");
});

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

let messageCount = 0;

wss.on("connection", (ws) => {
  console.log("New client connected!");
  clients.add(ws); // Store the connected client

  ws.on("close", () => {
    console.log("Client disconnected");
    console.log("---------------------");
    clients.delete(ws); // Remove the client when disconnected
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Global function to send messages to all connected Arduino clients
function sendMsgToArduino(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log(`Sent to Arduino: ${message}`);
    }
  });
}

// Start server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`------------------------------`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
