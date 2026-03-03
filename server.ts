import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameManager } from './src/server/GameManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  const gameManager = new GameManager(io);

  io.on('connection', (socket) => {
    const playerId = socket.handshake.query.playerId as string;
    console.log('User connected:', socket.id, 'PlayerID:', playerId);

    if (!playerId) {
      socket.disconnect();
      return;
    }

    socket.on('create_room', ({ playerName, avatar }, callback) => {
      const roomId = gameManager.createRoom(playerName, socket.id, playerId, avatar);
      socket.join(roomId);
      callback({ roomId });
    });

    socket.on('join_room', ({ roomId, playerName, avatar }, callback) => {
      const game = gameManager.joinRoom(roomId, playerName, socket.id, playerId, avatar);
      if (game) {
        socket.join(roomId);
        callback({ success: true, game });
      } else {
        callback({ success: false, message: 'Room not found or full' });
      }
    });

    socket.on('start_game', ({ roomId }) => {
      gameManager.startGame(roomId, socket.id);
    });

    socket.on('action', ({ roomId, targetId }) => {
      gameManager.handleAction(roomId, socket.id, targetId);
    });

    socket.on('vote', ({ roomId, targetId }) => {
      gameManager.handleAction(roomId, socket.id, targetId);
    });

    socket.on('leave_room', () => {
      gameManager.leaveRoom(socket.id);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      gameManager.leaveRoom(socket.id);
    });
  });

  // Serve built frontend (production)
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Railway uses PORT env variable
  const PORT = parseInt(process.env.PORT || '3000', 10);
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
