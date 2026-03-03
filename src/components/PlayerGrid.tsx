import React from 'react';
import { motion } from 'motion/react';
import { Player, Phase, Role } from '../types';
import { Skull, Vote, User, Wifi, WifiOff } from 'lucide-react';

interface ExtendedPlayer extends Omit<Player, 'role' | 'actionTarget'> {
  role?: Role;
  hasActed?: boolean;
  isConnected?: boolean;
}

interface PlayerGridProps {
  players: ExtendedPlayer[];
  myPlayer?: Player & { hasActed?: boolean };
  phase: Phase;
  onAction: (targetId: string) => void;
  onVote: (targetId: string) => void;
}

export const PlayerGrid = ({ players, myPlayer, phase, onAction, onVote }: PlayerGridProps) => {
  const isAlive = myPlayer?.isAlive;
  const myRole = myPlayer?.role;
  const myHasActed = myPlayer?.hasActed;

  const canAct = (target: ExtendedPlayer) => {
    if (!isAlive || myHasActed) return false;
    if (target.id === myPlayer?.id) return false;
    if (!target.isAlive) return false;
    if (phase !== 'NIGHT') return false;
    return myRole === 'MAFIA' || myRole === 'DOCTOR' || myRole === 'SHERIFF';
  };

  const canVote = (target: ExtendedPlayer) => {
    if (!isAlive) return false;
    if (phase !== 'VOTING') return false;
    if (target.id === myPlayer?.id) return false;
    if (!target.isAlive) return false;
    return true;
  };

  const getActionLabel = () => {
    if (myRole === 'MAFIA') return 'ELIMINATE';
    if (myRole === 'DOCTOR') return 'PROTECT';
    if (myRole === 'SHERIFF') return 'INVESTIGATE';
    return '';
  };

  const getActionColor = () => {
    if (myRole === 'MAFIA') return 'bg-red-600 hover:bg-red-500 text-white';
    if (myRole === 'DOCTOR') return 'bg-blue-600 hover:bg-blue-500 text-white';
    if (myRole === 'SHERIFF') return 'bg-yellow-500 hover:bg-yellow-400 text-black';
    return '';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {players.map((player) => {
        const isMe = player.id === myPlayer?.id;
        const isDead = !player.isAlive;
        const isDisconnected = player.isConnected === false;
        const showAction = canAct(player);
        const showVote = canVote(player);
        const alreadyVoted = myPlayer?.vote === player.id;
        const myVoteTarget = myPlayer?.vote;

        return (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isDead ? 0.5 : 1, scale: 1 }}
            className={`
              relative p-4 rounded-xl border transition-all overflow-hidden flex flex-col gap-3
              ${isDead ? 'bg-zinc-900 border-zinc-800 grayscale' : 'bg-zinc-800/50 border-zinc-700'}
              ${isMe ? 'ring-2 ring-white/30' : ''}
              ${alreadyVoted ? 'ring-2 ring-yellow-500/70' : ''}
            `}
          >
            {/* Connection indicator */}
            {isDisconnected && !isDead && (
              <div className="absolute top-2 right-2">
                <WifiOff size={12} className="text-red-400" />
              </div>
            )}

            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0
                ${isDead ? 'bg-zinc-800' : isMe ? 'bg-red-900/50 border border-red-500/30' : 'bg-zinc-700'}`}
              >
                {isDead ? <Skull size={18} className="text-zinc-600" /> : (player.avatar || <User size={18} />)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate uppercase tracking-wide">{player.name}</div>
                <div className="flex gap-1 flex-wrap">
                  {isMe && <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">YOU</span>}
                  {isDead && <span className="text-[10px] text-red-500 font-bold uppercase">DEAD</span>}
                  {isDisconnected && !isDead && <span className="text-[10px] text-orange-500 font-bold uppercase">DC</span>}
                </div>
              </div>
            </div>

            {/* Night action done indicator */}
            {phase === 'NIGHT' && player.hasActed && !isMe && (
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">✓ Acted</div>
            )}

            {/* Role reveal */}
            {player.role && (
              <div className={`text-xs font-black uppercase px-2 py-1 rounded w-fit
                ${player.role === 'MAFIA' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                  player.role === 'DOCTOR' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                  player.role === 'SHERIFF' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                  'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50'}`}
              >
                {player.role}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto space-y-2">
              {showAction && (
                <button
                  onClick={() => onAction(player.id)}
                  disabled={!!myHasActed}
                  className={`w-full py-2.5 rounded-lg text-xs font-black tracking-widest transition-all uppercase shadow-lg
                    ${myHasActed ? 'opacity-40 cursor-not-allowed bg-zinc-700 text-zinc-500' : getActionColor()}`}
                >
                  {myHasActed ? 'DONE ✓' : getActionLabel()}
                </button>
              )}
              {showVote && (
                <button
                  onClick={() => onVote(player.id)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black tracking-widest transition-all uppercase shadow-lg flex items-center justify-center gap-2
                    ${alreadyVoted ? 'bg-yellow-500 text-black' : 'bg-zinc-200 hover:bg-white text-black hover:scale-[1.02]'}`}
                >
                  <Vote size={13} />
                  {alreadyVoted ? 'VOTED ✓' : 'VOTE'}
                </button>
              )}
            </div>

            {/* Who voted for this player */}
            {phase === 'VOTING' && (
              <div className="flex flex-wrap gap-1 mt-1">
                {players.filter(p => p.vote === player.id).map(voter => (
                  <motion.span
                    key={voter.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full"
                  >
                    {voter.name}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
