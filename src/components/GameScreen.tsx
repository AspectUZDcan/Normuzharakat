import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RoleCard } from './RoleCard';
import { PlayerGrid } from './PlayerGrid';
import { Chat } from './Chat';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, AlertTriangle, Settings, Menu } from 'lucide-react';
import { OptionsModal } from './OptionsModal';

export const GameScreen = () => {
  const { gameState, performAction, vote, leaveRoom } = useGame();
  const [showOptions, setShowOptions] = useState(false);

  if (!gameState || !gameState.myPlayer) return null;

  const { phase, players, myPlayer, logs, timer, winner, round } = gameState;
  const isNight = phase === 'NIGHT';
  const isVoting = phase === 'VOTING';
  const isDay = phase === 'DAY';
  const isGameOver = phase === 'GAME_OVER';

  const getPhaseTitle = () => {
    if (isNight) return `NIGHT ${round}`;
    if (isDay) return `DAY ${round}`;
    if (isVoting) return `VOTING ${round}`;
    if (isGameOver) return 'GAME OVER';
    return phase;
  };

  const getGodPrompt = () => {
    if (isGameOver) return winner === 'MAFIA' ? 'The Mafia has taken control.' : 'The Town has been saved.';
    if (isNight) {
      if (myPlayer.role === 'MAFIA') return 'Choose a victim to eliminate.';
      if (myPlayer.role === 'DOCTOR') return 'Choose someone to protect.';
      if (myPlayer.role === 'SHERIFF') return 'Choose someone to investigate.';
      return 'The town sleeps. Wait for morning.';
    }
    if (isDay) return 'Discuss the events of the night. Who is suspicious?';
    if (isVoting) return 'Cast your vote to eliminate a suspect.';
    return 'Waiting...';
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isNight ? 'bg-black' : 'bg-zinc-900'} text-white p-4 md:p-6 overflow-hidden relative font-sans`}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {isNight ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#1a1a2e_0%,#000000_100%)] opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#2a2a2a_0%,#000000_100%)] opacity-80" />
        )}
      </div>

      {/* Header Bar */}
      <div className="relative z-20 flex justify-between items-center mb-6 bg-zinc-900/50 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-black text-xl tracking-widest uppercase flex items-center gap-2 ${
            isNight ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30' : 
            isDay || isVoting ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-900/30' : 
            'bg-red-950/50 text-red-500 border border-red-900/30'
          }`}>
            {isNight ? <Moon size={20} /> : <Sun size={20} />}
            {getPhaseTitle()}
          </div>
          
          {!isGameOver && (
            <div className="flex items-center gap-2 text-zinc-400 font-mono">
              <Clock size={16} />
              <span className={`text-xl font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timer}s
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowOptions(true)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
        >
          <Menu size={24} className="text-zinc-400" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Left Column: Role & Prompt */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          {/* God Prompt Area */}
          <motion.div 
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border-l-4 border-red-600 shadow-xl"
          >
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Current Objective</h3>
            <p className="text-lg font-medium text-white leading-relaxed">
              {getGodPrompt()}
            </p>
          </motion.div>

          <div className="flex-1">
            <RoleCard role={myPlayer.role || 'CIVILIAN'} name={myPlayer.name} />
          </div>
        </div>

        {/* Middle Column: Game Grid */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-y-auto custom-scrollbar">
            <PlayerGrid 
              players={players} 
              myPlayer={myPlayer} 
              phase={phase} 
              onAction={performAction}
              onVote={vote}
            />
          </div>
        </div>

        {/* Right Column: Chat/Logs */}
        <div className="lg:col-span-1 h-full">
          <Chat logs={logs} phase={phase} />
        </div>
      </div>

      <OptionsModal 
        isOpen={showOptions} 
        onClose={() => setShowOptions(false)} 
        onLeave={leaveRoom} 
      />

      {/* Game Over Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl shadow-2xl text-center max-w-2xl w-full relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${winner === 'MAFIA' ? 'bg-red-600' : 'bg-emerald-500'}`} />
              
              <h1 className={`text-7xl font-black mb-6 tracking-tighter ${winner === 'MAFIA' ? 'text-red-600' : 'text-emerald-500'}`}>
                {winner} WINS
              </h1>
              
              <p className="text-zinc-400 mb-12 text-xl font-light">
                {winner === 'MAFIA' 
                  ? 'Deception has prevailed. The town has fallen.' 
                  : 'Justice has been served. The town is safe.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={leaveRoom}
                  className="bg-zinc-800 text-white font-bold py-5 px-8 rounded-xl hover:bg-zinc-700 transition-colors uppercase tracking-widest text-sm"
                >
                  Return to Lobby
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className={`font-bold py-5 px-8 rounded-xl transition-colors uppercase tracking-widest text-sm text-white ${
                    winner === 'MAFIA' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
