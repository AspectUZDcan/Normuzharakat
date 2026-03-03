export type Role = 'MAFIA' | 'DOCTOR' | 'SHERIFF' | 'CIVILIAN';
export type Phase = 'LOBBY' | 'NIGHT' | 'DAY' | 'VOTING' | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role?: Role;
  isAlive: boolean;
  isReady: boolean;
  socketId: string;
  vote?: string | null;
  actionTarget?: string | null;
}

export interface GameState {
  roomId: string;
  phase: Phase;
  players: Player[];
  hostId: string;
  round: number;
  winner?: 'MAFIA' | 'TOWN' | null;
  timer: number;
  logs: string[];
  lastEliminated?: { name: string; role: Role } | null;
}

export interface ClientGameState extends Omit<GameState, 'players'> {
  players: (Omit<Player, 'role' | 'actionTarget'> & {
    role?: Role;
    hasActed?: boolean;
    isConnected?: boolean;
  })[];
  myPlayer?: Player & { hasActed?: boolean };
}

export interface CreateRoomPayload {
  playerName: string;
  sessionId: string;
  avatar: string;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
  sessionId: string;
  avatar: string;
}
