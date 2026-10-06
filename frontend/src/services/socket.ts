import { io, Socket } from 'socket.io-client';

const isBrowser = typeof window !== 'undefined';

const isVercelOrCloud = (): boolean => {
  if (!isBrowser) return false;
  const host = window.location.hostname;
  return host.includes('vercel.app') || (host !== 'localhost' && host !== '127.0.0.1');
};

const getSocketUrl = (): string | null => {
  const envWsUrl = (import.meta as any).env?.VITE_WS_URL;
  if (envWsUrl && typeof envWsUrl === 'string' && envWsUrl.trim()) {
    return envWsUrl.replace(/\/+$/, '');
  }

  // On Vercel / serverless cloud hosting without dedicated standalone WebSocket servers:
  // Return null to avoid flooding the browser console with failed wss:// connection attempts
  if (isVercelOrCloud()) {
    return null;
  }

  return 'http://localhost:5000';
};

// Clean no-op fallback socket for environments without dedicated WebSocket servers (e.g. Vercel Serverless)
class MockSocket {
  connected = false;
  id = 'mock-socket-serverless';

  on(_event: string, _callback: (...args: any[]) => void): this {
    return this;
  }
  off(_event?: string, _callback?: (...args: any[]) => void): this {
    return this;
  }
  emit(_event: string, ..._args: any[]): this {
    return this;
  }
  disconnect(): this {
    return this;
  }
  close(): this {
    return this;
  }
}

let socketInstance: Socket | null = null;
let mockInstance: any = null;

export function getSocket(): Socket {
  const socketUrl = getSocketUrl();

  // If deployed on Vercel without a dedicated standalone WebSocket server, use clean MockSocket
  if (!socketUrl) {
    if (!mockInstance) {
      mockInstance = new MockSocket();
      console.info('[Real-Time] Serverless environment active: Using High-Performance Cloud Heartbeat Polling for Multi-Device Sync.');
    }
    return mockInstance as unknown as Socket;
  }

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 5000,
      transports: ['polling', 'websocket']
    });

    socketInstance.on('connect_error', () => {
      // Gracefully silent in environments where socket falls back
    });
  }
  return socketInstance;
}

export function closeSocket(): void {
  if (socketInstance) {
    if (socketInstance.connected) {
      socketInstance.disconnect();
      socketInstance = null;
    } else {
      // Avoid aborting in-flight handshake in development React StrictMode
      socketInstance.once('connect', () => {
        socketInstance?.disconnect();
        socketInstance = null;
      });
    }
  }
  mockInstance = null;
}


