import { Server } from "socket.io";
import { createServer } from "http";
import { io as ClientIO, Socket } from "socket.io-client";

const isVercel = process.env.VERCEL === "true";

const globalForSocket = global as unknown as {
  io?: Server;
  httpServer?: ReturnType<typeof createServer>;
  clientSocket?: Socket;
};

/**
 * Start Socket.IO server locally on port 3001.
 * Skipped on Vercel.
 */
export function ensureSocketServer(): Server | null {
  if (isVercel) {
    console.log("♻️ Skipping local Socket.IO server on Vercel");
    return null;
  }

  if (!globalForSocket.io) {
    console.log("🚀 Starting local Socket.IO server...");

    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: { origin: [`${process.env.BASE_URL}`], methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);
    });

    httpServer.listen(3001, () =>
      console.log("✅ Local Socket.IO server running on port 3001")
    );

    globalForSocket.io = io;
    globalForSocket.httpServer = httpServer;
  }

  return globalForSocket.io!;
}

/**
 * For production (Vercel) or remote connections: get a Socket.IO client.
 */
export function getSocketClient(): Socket {
  if (!globalForSocket.clientSocket) {
    globalForSocket.clientSocket = ClientIO(
      process.env.SOCKET_URL!, 
      { transports: ["websocket"] }
    );

    globalForSocket.clientSocket.on("connect", () =>
      console.log("✅ Connected to Railway Socket.IO server")
    );
    globalForSocket.clientSocket.on("disconnect", () =>
      console.log("❌ Disconnected from Railway Socket.IO server")
    );
  }

  return globalForSocket.clientSocket;
}
export async function emitMessage(payload: any) {
  if (process.env.VERCEL === "true") {
    const socket = getSocketClient();

    // Wait until the client connects
    if (!socket.connected) {
      await new Promise<void>((resolve) => {
        socket.once("connect", () => resolve());
      });
    }

    console.log("emit");
    socket.emit("new_message", payload);

    // Wait a tick to ensure the event is sent before the function exits
    await new Promise((resolve) => setTimeout(resolve, 50));
  } else {
    console.log("local io socket");
    const io = ensureSocketServer();
    io?.emit("new_message", payload);
  }
}

// Export the local server io (may be null on Vercel)
export const io = globalForSocket.io ?? null;
