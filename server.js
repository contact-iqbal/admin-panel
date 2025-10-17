const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected to log stream");
  socket.emit("log", "Connected to backend log stream!");
});

const oldLog = console.log;
console.log = (...args) => {
  const msg = args.join(" ");
  io.emit("log", msg);
  oldLog(...args);
};

// Test periodic log
// setInterval(() => console.log("💬 Heartbeat from backend"), 5000);

httpServer.listen(3030, () => {
  console.log("🚀 Socket.IO server running on port 3000");
});
