import { Server as IOServer } from "socket.io";
import { io as ClientIO, Socket } from "socket.io-client";

const isVercel = process.env.VERCEL === "1";

let io: IOServer | null = null;
let clientSocket: Socket | null = null;

/**
 * Initialize or get a local Socket.IO server (only for local dev)
 */
export function getIO(server?: any): IOServer | null {
  if (isVercel) {
    console.log("♻️ Skipping local Socket.IO server on Vercel");
    return null;
  }

  if (io) return io;
  if (!server) throw new Error("❌ No server provided to init Socket.IO");

  io = new IOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
  });

  return io;
}

/**
 * Get existing local server instance (null if not initialized)
 */
export function getExistingIO(): IOServer | null {
  return io;
}

/**
 * Get or initialize a client socket (for production / Vercel / Railway)
 */
export function getSocketClient(): Socket {
  if (!clientSocket) {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      throw new Error("❌ NEXT_PUBLIC_SOCKET_URL not defined");
    }

    clientSocket = ClientIO(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    clientSocket.on("connect", () =>
      console.log("✅ Connected to Railway Socket.IO server")
    );
    clientSocket.on("disconnect", () =>
      console.log("❌ Disconnected from Railway Socket.IO server")
    );
  }

  return clientSocket;
}
