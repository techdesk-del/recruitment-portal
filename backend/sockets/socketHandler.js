import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[WebSocket] Dashboard Client Connected (${socket.id})`);
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function broadcastNewCandidate(candidate) {
  if (ioInstance) {
    ioInstance.emit('NEW_CANDIDATE_INGESTED', candidate);
  }
}

export function broadcastStatusUpdate(payload) {
  if (ioInstance) {
    ioInstance.emit('CANDIDATE_STATUS_UPDATED', payload);
  }
}
