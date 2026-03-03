import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Medal, Coins } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export const ProfileModal = ({ isOpen, onClose, playerName }: ProfileModalProps) => {
  if (!isOpen) return null;

  // Mock stats
  const stats = {
    wins: 12,
    streak: 3,
    coins: 1500,
    gamesPlayed: 24,
    winRate: '50%'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-red-900/50 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-red-950/30 p-6 border-b border-red-900/30 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white tracking-wider uppercase">Player Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-red-900/50">
              <span className="text-3xl font-bold text-white">{playerName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{playerName}</h3>
              <p className="text-zinc-400 text-sm">Level 5 Civilian</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Trophy size={16} />
                <span className="text-xs uppercase tracking-wider">Total Wins</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.wins}</div>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Medal size={16} />
                <span className="text-xs uppercase tracking-wider">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.winRate}</div>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Coins size={16} />
                <span className="text-xs uppercase tracking-wider">Coins</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{stats.coins}</div>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <span className="text-xs uppercase tracking-wider">Streak</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.streak} Days</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Recent Badges</h4>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded bg-red-900/20 border border-red-500/30 flex items-center justify-center" title="First Blood">🩸</div>
              <div className="w-10 h-10 rounded bg-blue-900/20 border border-blue-500/30 flex items-center justify-center" title="Savior">🛡️</div>
              <div className="w-10 h-10 rounded bg-yellow-900/20 border border-yellow-500/30 flex items-center justify-center" title="Detective">🔍</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
