import React from 'react';
import { motion } from 'motion/react';
import { X, Settings, LogOut, RotateCcw, Play } from 'lucide-react';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

export const OptionsModal = ({ isOpen, onClose, onLeave }: OptionsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Options</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button 
            onClick={onClose}
            className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center gap-4 transition-colors text-left group"
          >
            <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg group-hover:bg-emerald-900/50">
              <Play size={20} />
            </div>
            <div>
              <div className="font-bold text-white">Resume Game</div>
              <div className="text-xs text-zinc-500">Return to the action</div>
            </div>
          </button>

          <button className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center gap-4 transition-colors text-left group">
            <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg group-hover:bg-blue-900/50">
              <Settings size={20} />
            </div>
            <div>
              <div className="font-bold text-white">Settings</div>
              <div className="text-xs text-zinc-500">Audio and display preferences</div>
            </div>
          </button>

          <button className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center gap-4 transition-colors text-left group">
            <div className="p-2 bg-yellow-900/30 text-yellow-400 rounded-lg group-hover:bg-yellow-900/50">
              <RotateCcw size={20} />
            </div>
            <div>
              <div className="font-bold text-white">Restart</div>
              <div className="text-xs text-zinc-500">Start a new session</div>
            </div>
          </button>

          <button 
            onClick={onLeave}
            className="w-full p-4 bg-red-950/30 hover:bg-red-900/50 border border-red-900/30 rounded-xl flex items-center gap-4 transition-colors text-left group mt-4"
          >
            <div className="p-2 bg-red-900/30 text-red-400 rounded-lg group-hover:bg-red-900/50">
              <LogOut size={20} />
            </div>
            <div>
              <div className="font-bold text-red-400">Exit Game</div>
              <div className="text-xs text-red-300/50">Leave the current room</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
