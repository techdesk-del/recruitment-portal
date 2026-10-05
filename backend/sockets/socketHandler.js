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
    console.log(`[WebSocket] Live Client Connected from remote (${socket.id})`);
    
    // Heartbeat ping
    socket.on('PING', () => {
      socket.emit('PONG', { timestamp: Date.now() });
    });
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

export function broadcastCandidateUpdated(candidate) {
  if (ioInstance) {
    ioInstance.emit('CANDIDATE_UPDATED', candidate);
  }
}

export function broadcastCandidateDeleted(id) {
  if (ioInstance) {
    ioInstance.emit('CANDIDATE_DELETED', { id });
  }
}

export function broadcastInterviewCreated(interview) {
  if (ioInstance) {
    ioInstance.emit('INTERVIEW_CREATED', interview);
  }
}

export function broadcastInterviewUpdated(interview) {
  if (ioInstance) {
    ioInstance.emit('INTERVIEW_UPDATED', interview);
  }
}

export function broadcastInterviewDeleted(id) {
  if (ioInstance) {
    ioInstance.emit('INTERVIEW_DELETED', { id });
  }
}

export function broadcastCallRecordCreated(callRecord) {
  if (ioInstance) {
    ioInstance.emit('CALL_RECORD_CREATED', callRecord);
  }
}

export function broadcastCallRecordDeleted(id) {
  if (ioInstance) {
    ioInstance.emit('CALL_RECORD_DELETED', { id });
  }
}

export function broadcastQueueProgress(payload) {
  if (ioInstance) {
    ioInstance.emit('QUEUE_PROGRESS', payload);
  }
}

export function broadcastQueueBatchCompleted(payload) {
  if (ioInstance) {
    ioInstance.emit('QUEUE_BATCH_COMPLETED', payload);
  }
}
