// lib/sockets.ts
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function getIO(existing?: IOServer) {
  if (existing) io = existing;
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}