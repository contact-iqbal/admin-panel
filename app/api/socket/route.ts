import { NextRequest } from "next/server";
import { Server } from "socket.io";
import { createServer } from "http";

const globalForSocket = global as unknown as {
  io?: Server;
  httpServer?: ReturnType<typeof createServer>;
};

/**
 * Ensure a Socket.IO server is running.
 * Can be called from anywhere (like webhook route).
 */
export function ensureSocketServer() {
  if (!globalForSocket.io) {
    console.log("🚀 Starting new Socket.IO server...");

    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      socket.onAny((event, ...args) => {
        console.log("📡 Received event from client:", event, args);
      });

      socket.on("disconnect", () =>
        console.log("❌ Client disconnected:", socket.id)
      );
    });

    httpServer.listen(3001, () => {
      console.log("✅ Socket.IO server running on port 3001");
    });

    globalForSocket.io = io;
    globalForSocket.httpServer = httpServer;
  } else {
    console.log("♻️ Reusing existing Socket.IO server");
  }

  return globalForSocket.io;
}

export async function GET(req: NextRequest) {
  ensureSocketServer();
  return new Response("Socket.IO server active", { status: 200 });
}

// export io instance (may be null before ensureSocketServer is called)
export const io = globalForSocket.io ?? null;
