import React from 'react';
import { Phase } from '../types';
import { Moon, Sun, Vote, Skull } from 'lucide-react';
import { motion } from 'motion/react';

interface StatusHeaderProps {
  phase: Phase;
  round: number;
  timer: number;
}

export const StatusHeader = ({ phase, round, timer }: StatusHeaderProps) => {
  const getPhaseConfig = () => {
    switch (phase) {
      case 'NIGHT':
        return { icon: Moon, label: 'Night Phase', color: 'text-blue-400', bg: 'bg-blue-950/50' };
      case 'DAY':
        return { icon: Sun, label: 'Day Phase', color: 'text-orange-400', bg: 'bg-orange-950/50' };
      case 'VOTING':
        return { icon: Vote, label: 'Voting Phase', color: 'text-red-400', bg: 'bg-red-950/50' };
      case 'GAME_OVER':
        return { icon: Skull, label: 'Game Over', color: 'text-zinc-400', bg: 'bg-zinc-950/50' };
      default:
        return { icon: Sun, label: 'Lobby', color: 'text-white', bg: 'bg-zinc-800' };
    }
  };

  const config = getPhaseConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-xl mb-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Round {round}</div>
          <div className={`text-xl font-bold ${config.color}`}>{config.label}</div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Time Remaining</div>
        <motion.div 
          key={timer}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-3xl font-mono font-bold ${timer < 10 ? 'text-red-500' : 'text-white'}`}
        >
          00:{timer.toString().padStart(2, '0')}
        </motion.div>
      </div>
    </div>
  );
};
