import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_WS_URL || (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 6000,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect_error', (err) => {
      // Graceful warning for environments without dedicated WebSocket servers
      console.debug('[Real-Time] WebSocket fallback to Cloud Heartbeat Polling:', err.message);
    });
  }
  return socketInstance;
}

export function closeSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
