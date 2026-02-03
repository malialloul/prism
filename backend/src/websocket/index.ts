import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface UserPayload {
  userId: string;
  email: string;
  fullName?: string;
  isSharedAccess?: boolean;
  shareId?: number;
}

// Store connected users: userId -> Set of socket IDs
const connectedUsers = new Map<string, Set<string>>();

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    const decoded = socket.handshake.auth.token ? 
      jwt.verify(socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', ''), config.jwt.secret) as UserPayload :
      null;
    
    console.log(`[WebSocket] User ${userId} connected (socket: ${socket.id})`);

    // Add socket to user's set
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // If this is a shared session, also join the share-specific room
    if (decoded?.isSharedAccess && decoded?.shareId) {
      console.log(`[WebSocket] User ${userId} joined share room share:${decoded.shareId}`);
      socket.join(`share:${decoded.shareId}`);
    }

    socket.on('disconnect', () => {
      console.log(`[WebSocket] User ${userId} disconnected (socket: ${socket.id})`);
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('[WebSocket] Server initialized');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function isUserConnected(userId: string): boolean {
  return connectedUsers.has(userId) && connectedUsers.get(userId)!.size > 0;
}

export function getConnectedUserCount(): number {
  return connectedUsers.size;
}
