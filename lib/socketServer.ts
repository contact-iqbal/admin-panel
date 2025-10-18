import { Server } from "socket.io";

let io: Server | null = null;

export function getIO(server?: any) {
  if (io) return io;
  if (!server) throw new Error("❌ No server provided to init Socket.IO");

  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
  });

  return io;
}

export function getExistingIO() {
  return io;
}