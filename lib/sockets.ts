// lib/sockets.ts
import { Server as IOServer } from "socket.io";

/**
 * Holds the local server instance (only used in dev)
 */
let io: IOServer | null = null;

/**
 * Initialize or get the existing Socket.IO server instance.
 * Only use in local dev with ensureSocketServer()
 */
export function getIO(existing?: IOServer): IOServer {
  if (existing) io = existing;

  if (!io) {
    throw new Error(
      "Socket.IO server not initialized. Use ensureSocketServer() in dev or getSocketClient() for production."
    );
  }

  return io;
}

/**
 * Check if io exists (for conditional usage)
 */
export function hasIO(): boolean {
  return io !== null;
}
