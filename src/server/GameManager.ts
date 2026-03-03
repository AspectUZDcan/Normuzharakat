import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { GameState, Player, Role } from '../types';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class GameManager {
  private io: Server;
  private games: Map<string, GameState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  createRoom(hostName: string, socketId: string, sessionId: string, avatar: string): string {
    const roomId = nanoid(6).toUpperCase();
    const host: Player = {
      id: sessionId,
      name: hostName,
      avatar,
      isAlive: true,
      isReady: false,
      socketId,
    };

    const gameState: GameState = {
      roomId,
      phase: 'LOBBY',
      players: [host],
      hostId: sessionId,
      round: 0,
      timer: 0,
      logs: [`Room created by ${hostName}`],
      winner: null,
      lastEliminated: null,
    };

    this.games.set(roomId, gameState);
    this.broadcastState(roomId);
    return roomId;
  }

  joinRoom(roomId: string, playerName: string, socketId: string, sessionId: string, avatar: string): GameState | null {
    const game = this.games.get(roomId);
    if (!game) return null;

    // Reconnect: same sessionId
    const existingPlayer = game.players.find(p => p.id === sessionId);
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      this.broadcastState(roomId);
      return game;
    }

    if (game.phase !== 'LOBBY') return null;
    if (game.players.length >= 12) return null;

    // BUG FIX: case-insensitive unique name check
    if (game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) return null;

    const player: Player = {
      id: sessionId,
      name: playerName,
      avatar,
      isAlive: true,
      isReady: false,
      socketId,
    };

    game.players.push(player);
    game.logs.push(`${playerName} joined the lobby`);
    this.broadcastState(roomId);
    return game;
  }

  leaveRoom(socketId: string) {
    for (const [roomId, game] of this.games.entries()) {
      const playerIndex = game.players.findIndex(p => p.socketId === socketId);
      if (playerIndex === -1) continue;

      const player = game.players[playerIndex];

      if (game.phase === 'LOBBY') {
        game.players.splice(playerIndex, 1);
        game.logs.push(`${player.name} left the lobby`);

        if (game.players.length === 0) {
          this.clearTimer(roomId);
          this.games.delete(roomId);
        } else {
          if (game.hostId === player.id) {
            game.hostId = game.players[0].id;
            game.logs.push(`${game.players[0].name} is now the host`);
          }
          this.broadcastState(roomId);
        }
      } else {
        // Game in progress — keep player for reconnect, just clear socketId
        player.socketId = '';
        game.logs.push(`${player.name} disconnected`);
        this.broadcastState(roomId);

        // BUG FIX: if disconnected player had a night action pending, auto-skip them
        if (game.phase === 'NIGHT') {
          this.checkNightActions(roomId);
        }
        if (game.phase === 'VOTING') {
          this.checkVotes(roomId);
        }
      }
      return;
    }
  }

  startGame(roomId: string, socketId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    const player = game.players.find(p => p.socketId === socketId);
    if (!player || player.id !== game.hostId) return;
    if (game.players.length < 4) return;

    const playerCount = game.players.length;
    const mafiaCount = Math.max(1, Math.floor(playerCount / 4));
    const civilianCount = playerCount - mafiaCount - 2; // 1 doctor + 1 sheriff

    let roles: Role[] = [
      ...Array(mafiaCount).fill('MAFIA'),
      'DOCTOR',
      'SHERIFF',
      ...Array(Math.max(0, civilianCount)).fill('CIVILIAN'),
    ];

    roles = shuffle(roles);

    game.players.forEach((p, i) => {
      p.role = roles[i];
      p.isAlive = true;
      p.actionTarget = null;
      p.vote = null;
    });

    game.phase = 'NIGHT';
    game.round = 1;
    game.winner = null;
    game.lastEliminated = null;
    game.logs.push('The game has started! Night falls...');

    this.broadcastState(roomId);
    // BUG FIX: small delay so clients receive role before timer starts
    setTimeout(() => this.startTimer(roomId, 30), 500);
  }

  handleAction(roomId: string, socketId: string, targetId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    const player = game.players.find(p => p.socketId === socketId);
    if (!player || !player.isAlive) return;

    // BUG FIX: prevent voting for yourself or a dead player
    const target = game.players.find(p => p.id === targetId);
    if (!target) return;
    if (targetId === player.id) return;

    if (game.phase === 'NIGHT') {
      const hasRole = player.role === 'MAFIA' || player.role === 'DOCTOR' || player.role === 'SHERIFF';
      if (!hasRole) return;
      // BUG FIX: mafia can only target alive players
      if (player.role === 'MAFIA' && !target.isAlive) return;
      // Doctor can save anyone including self
      player.actionTarget = targetId;
      this.broadcastState(roomId);
      this.checkNightActions(roomId);
    } else if (game.phase === 'VOTING') {
      // BUG FIX: can't vote for dead player
      if (!target.isAlive) return;
      // BUG FIX: allow changing vote
      player.vote = targetId;
      this.broadcastState(roomId);
      this.checkVotes(roomId);
    }
  }

  private checkNightActions(roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    // Only count connected active role players
    const activeRolePlayers = game.players.filter(p =>
      p.isAlive &&
      p.socketId !== '' && // BUG FIX: skip disconnected
      (p.role === 'MAFIA' || p.role === 'DOCTOR' || p.role === 'SHERIFF')
    );

    const allActed = activeRolePlayers.every(p => p.actionTarget !== null);
    if (allActed && activeRolePlayers.length > 0) {
      this.resolveNight(roomId);
    }
  }

  private resolveNight(roomId: string) {
    this.clearTimer(roomId);
    const game = this.games.get(roomId);
    if (!game) return;

    const mafia = game.players.filter(p => p.role === 'MAFIA' && p.isAlive);
    const doctor = game.players.find(p => p.role === 'DOCTOR' && p.isAlive);
    const sheriff = game.players.find(p => p.role === 'SHERIFF' && p.isAlive);

    // Mafia kill target (majority or first)
    const killVotes: Record<string, number> = {};
    mafia.forEach(m => {
      if (m.actionTarget) killVotes[m.actionTarget] = (killVotes[m.actionTarget] || 0) + 1;
    });
    const killTargetId = Object.entries(killVotes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const saveTargetId = doctor?.actionTarget ?? null;

    // Sheriff result
    if (sheriff?.actionTarget && sheriff.socketId) {
      const sheriffTarget = game.players.find(p => p.id === sheriff.actionTarget);
      if (sheriffTarget) {
        this.io.to(sheriff.socketId).emit('sheriff_result', {
          targetName: sheriffTarget.name,
          isMafia: sheriffTarget.role === 'MAFIA',
        });
      }
    }

    // Resolve kill
    if (killTargetId && killTargetId !== saveTargetId) {
      const victim = game.players.find(p => p.id === killTargetId);
      if (victim && victim.isAlive) {
        victim.isAlive = false;
        game.logs.push(`${victim.name} was eliminated during the night.`);
        game.lastEliminated = { name: victim.name, role: victim.role! };
      }
    } else if (killTargetId && killTargetId === saveTargetId) {
      game.logs.push(`The doctor saved someone tonight!`);
      game.lastEliminated = null;
    } else {
      game.logs.push('No one was eliminated last night.');
      game.lastEliminated = null;
    }

    // Reset actions
    game.players.forEach(p => { p.actionTarget = null; });

    if (this.checkWinCondition(roomId)) return;

    game.phase = 'DAY';
    this.broadcastState(roomId);
    setTimeout(() => this.startTimer(roomId, 60), 300);
  }

  private checkVotes(roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    const alivePlayers = game.players.filter(p => p.isAlive);
    // BUG FIX: only count connected players as required voters
    const connectedAlive = alivePlayers.filter(p => p.socketId !== '');
    const votesCast = connectedAlive.filter(p => p.vote !== null).length;

    if (votesCast >= connectedAlive.length && connectedAlive.length > 0) {
      this.resolveVoting(roomId);
    }
  }

  private resolveVoting(roomId: string) {
    this.clearTimer(roomId);
    const game = this.games.get(roomId);
    if (!game) return;

    const votes: Record<string, number> = {};
    game.players.filter(p => p.isAlive).forEach(p => {
      if (p.vote) votes[p.vote] = (votes[p.vote] || 0) + 1;
    });

    let maxVotes = 0;
    let candidateId: string | null = null;
    let tie = false;

    for (const [targetId, count] of Object.entries(votes)) {
      if (count > maxVotes) { maxVotes = count; candidateId = targetId; tie = false; }
      else if (count === maxVotes) { tie = true; }
    }

    if (candidateId && !tie) {
      const target = game.players.find(p => p.id === candidateId);
      if (target) {
        target.isAlive = false;
        game.logs.push(`${target.name} (${target.role}) was voted out by the town.`);
        game.lastEliminated = { name: target.name, role: target.role! };
      }
    } else {
      game.logs.push('The town could not agree. No one was eliminated.');
      game.lastEliminated = null;
    }

    game.players.forEach(p => { p.vote = null; });

    if (this.checkWinCondition(roomId)) return;

    game.phase = 'NIGHT';
    game.round++;
    game.logs.push(`Night ${game.round} begins...`);
    this.broadcastState(roomId);
    setTimeout(() => this.startTimer(roomId, 30), 300);
  }

  private checkWinCondition(roomId: string): boolean {
    const game = this.games.get(roomId);
    if (!game) return false;

    const mafiaAlive = game.players.filter(p => p.role === 'MAFIA' && p.isAlive).length;
    const townAlive = game.players.filter(p => p.role !== 'MAFIA' && p.isAlive).length;

    if (mafiaAlive === 0) {
      game.winner = 'TOWN';
      game.phase = 'GAME_OVER';
      game.logs.push('🏆 Town wins! All Mafia have been eliminated.');
      this.clearTimer(roomId);
      this.broadcastState(roomId);
      // Clean up after 10 min
      setTimeout(() => this.games.delete(roomId), 10 * 60 * 1000);
      return true;
    }

    if (mafiaAlive >= townAlive) {
      game.winner = 'MAFIA';
      game.phase = 'GAME_OVER';
      game.logs.push('💀 Mafia wins! They have overtaken the town.');
      this.clearTimer(roomId);
      this.broadcastState(roomId);
      setTimeout(() => this.games.delete(roomId), 10 * 60 * 1000);
      return true;
    }

    return false;
  }

  private startTimer(roomId: string, seconds: number) {
    this.clearTimer(roomId);
    const game = this.games.get(roomId);
    if (!game) return;

    game.timer = seconds;

    const interval = setInterval(() => {
      const g = this.games.get(roomId);
      if (!g) { clearInterval(interval); return; }

      g.timer--;
      this.io.to(roomId).emit('timer_update', g.timer);

      if (g.timer <= 0) {
        this.clearTimer(roomId);
        this.handlePhaseEnd(roomId);
      }
    }, 1000);

    this.timers.set(roomId, interval);
  }

  private clearTimer(roomId: string) {
    const t = this.timers.get(roomId);
    if (t) { clearInterval(t); this.timers.delete(roomId); }
  }

  private handlePhaseEnd(roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    if (game.phase === 'NIGHT') {
      // Auto-act for anyone who didn't choose
      game.players.filter(p =>
        p.isAlive && p.actionTarget === null &&
        (p.role === 'MAFIA' || p.role === 'DOCTOR' || p.role === 'SHERIFF')
      ).forEach(p => {
        // Pick random alive target that isn't themselves
        const targets = game.players.filter(t => t.isAlive && t.id !== p.id);
        if (targets.length > 0) {
          p.actionTarget = targets[Math.floor(Math.random() * targets.length)].id;
        } else {
          p.actionTarget = '__skip__';
        }
      });
      this.resolveNight(roomId);
    } else if (game.phase === 'DAY') {
      game.phase = 'VOTING';
      game.logs.push('Discussion over. Time to vote!');
      this.broadcastState(roomId);
      setTimeout(() => this.startTimer(roomId, 30), 300);
    } else if (game.phase === 'VOTING') {
      // Auto-skip non-voters
      game.players.filter(p => p.isAlive && p.vote === null).forEach(p => {
        p.vote = '__skip__';
      });
      this.resolveVoting(roomId);
    }
  }

  private broadcastState(roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    game.players.forEach(player => {
      if (!player.socketId) return;
      const state = this.sanitizeState(game, player.socketId);
      this.io.to(player.socketId).emit('game_state', state);
    });
  }

  private sanitizeState(game: GameState, socketId: string): any {
    const me = game.players.find(p => p.socketId === socketId);
    if (!me) return null;

    const sanitizedPlayers = game.players.map(p => {
      let role: Role | undefined = undefined;
      if (game.phase === 'GAME_OVER') role = p.role;
      else if (p.socketId === socketId) role = p.role;            // your own role
      else if (me.role === 'MAFIA' && p.role === 'MAFIA') role = p.role; // mafia sees team
      else if (!p.isAlive) role = p.role;                         // dead roles revealed

      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isAlive: p.isAlive,
        isReady: p.isReady,
        role,
        vote: (game.phase === 'VOTING' || game.phase === 'GAME_OVER') ? p.vote : undefined,
        hasActed: game.phase === 'NIGHT' ? (p.actionTarget !== null) : undefined,
        isConnected: p.socketId !== '',
      };
    });

    return {
      roomId: game.roomId,
      phase: game.phase,
      players: sanitizedPlayers,
      hostId: game.hostId,
      round: game.round,
      winner: game.winner,
      timer: game.timer,
      logs: game.logs.slice(-50), // last 50 logs
      lastEliminated: game.lastEliminated,
      myPlayer: { ...me, hasActed: me.actionTarget !== null },
    };
  }
}
