import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { Server as IOServer } from 'socket.io';

export interface SocketServer extends HTTPServer {
  io?: IOServer;
}

export interface SocketWithIO extends Socket {
  server: SocketServer;
}

export interface NextApiResponseServerIO extends Response {
  end(): unknown;
  socket: SocketWithIO;
}
