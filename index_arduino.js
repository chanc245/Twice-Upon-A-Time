import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { WebSocketServer } from "ws";

// Express setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "./public_arduino")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "./public_arduino/index_arduino.html"));
});

app.get("/light/on", (req, res) => {
  sendMsgToArduino("1");
});

app.get("/light/off", (req, res) => {
  sendMsgToArduino("2");
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
    if (client.readyState === client.OPEN) {
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