import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { ClientGameState } from '../types';

interface GameContextType {
  socket: Socket | null;
  gameState: ClientGameState | null;
  isConnected: boolean;
  createRoom: (playerName: string, avatar: string) => void;
  joinRoom: (roomId: string, playerName: string, avatar: string) => void;
  startGame: () => void;
  performAction: (targetId: string) => void;
  vote: (targetId: string) => void;
  leaveRoom: () => void;
  error: string | null;
  playerId: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [playerId] = useState(() => {
    try {
      const stored = localStorage.getItem('mafia_player_id');
      if (stored) return stored;
      const newId = nanoid();
      localStorage.setItem('mafia_player_id', newId);
      return newId;
    } catch {
      return nanoid();
    }
  });

  useEffect(() => {
    // Works on Railway, Render, local - always connects to same host
    const newSocket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: { playerId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError('Connection failed. Retrying...');
    });

    newSocket.on('game_state', (state: ClientGameState) => {
      setGameState(state);
      setError(null);
    });

    newSocket.on('sheriff_result', (result: { targetName: string; isMafia: boolean }) => {
      alert(`🔍 Investigation: ${result.targetName} is ${result.isMafia ? '🔴 MAFIA' : '✅ NOT MAFIA'}`);
    });

    newSocket.on('timer_update', (timer: number) => {
      setGameState(prev => (prev ? { ...prev, timer } : null));
    });

    newSocket.on('error', (msg: string) => {
      setError(msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [playerId]);

  const createRoom = (playerName: string, avatar: string) => {
    if (!socket) return;
    socket.emit('create_room', { playerName, avatar }, (response: { roomId: string }) => {
      console.log('Room created:', response.roomId);
    });
  };

  const joinRoom = (roomId: string, playerName: string, avatar: string) => {
    if (!socket) return;
    socket.emit('join_room', { roomId, playerName, avatar }, (response: { success: boolean; message?: string }) => {
      if (!response.success) {
        setError(response.message || 'Failed to join room');
      }
    });
  };

  const startGame = () => {
    if (!socket || !gameState) return;
    socket.emit('start_game', { roomId: gameState.roomId });
  };

  const performAction = (targetId: string) => {
    if (!socket || !gameState) return;
    socket.emit('action', { roomId: gameState.roomId, targetId });
  };

  const vote = (targetId: string) => {
    if (!socket || !gameState) return;
    socket.emit('vote', { roomId: gameState.roomId, targetId });
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit('leave_room');
    setGameState(null);
  };

  return (
    <GameContext.Provider
      value={{ socket, gameState, isConnected, createRoom, joinRoom, startGame, performAction, vote, leaveRoom, error, playerId }}
    >
      {children}
    </GameContext.Provider>
  );
};
