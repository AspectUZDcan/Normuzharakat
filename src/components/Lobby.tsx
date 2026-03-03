import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'motion/react';
import { Users, Play, LogOut, Copy, User, Info } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

const AVATARS = ['🕵️', '👮', '👨‍⚕️', '🧟', '🧛', '🧙', '🦹', '🦸', '🤡', '🤖', '👽', '👻'];

export const Lobby = () => {
  const { gameState, createRoom, joinRoom, startGame, leaveRoom, error, playerId, isConnected } = useGame();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isJoining, setIsJoining] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (gameState) {
    // Waiting Room (Game Lobby)
    const isHost = gameState.hostId === playerId;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#2a0a0a_0%,#000000_100%)] opacity-80 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
        >
          {/* Left Column: Room Info & Players */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-red-900/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold font-sans tracking-tighter text-white">GAME LOBBY</h2>
                  <p className="text-zinc-500 text-sm uppercase tracking-widest">Prepare for deception</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
                  >
                    <User size={20} className="text-zinc-400" />
                  </button>
                  <button 
                    onClick={leaveRoom} 
                    className="p-2 bg-red-950/30 hover:bg-red-900/50 rounded-lg transition-colors border border-red-900/30"
                  >
                    <LogOut size={20} className="text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-xl mb-6 flex justify-between items-center border border-zinc-800">
                <div>
                  <span className="text-zinc-500 text-xs uppercase tracking-wider font-mono">Room Code</span>
                  <div className="text-4xl font-mono font-bold text-red-500 tracking-widest">{gameState.roomId}</div>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(gameState.roomId)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold text-zinc-300"
                >
                  <Copy size={16} />
                  COPY
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm uppercase tracking-wider font-bold">
                    <Users size={16} />
                    <span>Players ({gameState.players.length}/12)</span>
                  </div>
                  {gameState.players.length < 4 && (
                    <span className="text-red-500 text-xs font-bold uppercase animate-pulse">Waiting for players...</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {gameState.players.map((player) => (
                    <div 
                      key={player.id} 
                      className={`p-3 rounded-xl flex items-center gap-3 border transition-all ${
                        player.id === playerId
                          ? 'bg-red-950/20 border-red-900/50 shadow-lg shadow-red-900/10' 
                          : 'bg-zinc-800/50 border-zinc-700/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-inner bg-zinc-900/50 border border-white/5`}>
                        {player.avatar || player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-zinc-200">{player.name}</div>
                        {player.id === gameState.hostId && (
                          <div className="text-[10px] text-yellow-500 font-mono uppercase tracking-wider">HOST</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty Slots */}
                  {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-3 rounded-xl border border-zinc-800/50 bg-black/20 flex items-center justify-center opacity-50">
                      <span className="text-zinc-600 text-xs uppercase tracking-widest">Empty Slot</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            {isHost ? (
              <button
                onClick={startGame}
                disabled={gameState.players.length < 4}
                className={`w-full py-6 rounded-2xl font-black text-xl tracking-widest flex items-center justify-center gap-3 transition-all uppercase shadow-2xl ${
                  gameState.players.length >= 4
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20 hover:scale-[1.02]'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                }`}
              >
                <Play size={24} fill="currentColor" />
                Start The Game
              </button>
            ) : (
              <div className="w-full py-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-ping" />
                Waiting for host to start
              </div>
            )}
          </div>

          {/* Right Column: Role Info */}
          <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Info size={20} className="text-red-500" />
              <span>ROLES</span>
            </h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30">
                <h4 className="font-black text-red-500 text-lg mb-1">MAFIA</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">Eliminate the townspeople at night. Deceive others during the day. Don't get caught.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30">
                <h4 className="font-black text-blue-400 text-lg mb-1">DOCTOR</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">Choose one person to save each night. If the Mafia targets them, they survive.</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-900/30">
                <h4 className="font-black text-yellow-400 text-lg mb-1">SHERIFF</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">Investigate one person each night to reveal their true alignment.</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <h4 className="font-black text-emerald-400 text-lg mb-1">CIVILIAN</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">Your only weapon is your vote. Find the Mafia and eliminate them during the day.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} playerName={name || 'Player'} />
      </div>
    );
  }

  // Home Screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3a0000_0%,#000000_80%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-6xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-2xl"
          >
            MAFIA
          </motion.h1>
          <p className="text-red-500 font-mono text-sm uppercase tracking-[0.3em] font-bold">Trust No One</p>
        </div>

        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-red-950/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 text-sm text-center font-bold shadow-lg shadow-red-900/20"
          >
            {error}
          </motion.div>
        )}

        <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Identity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER YOUR NAME"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 transition-all font-bold text-lg uppercase tracking-wide mb-4"
            />
            
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Select Avatar</label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === avatar 
                      ? 'bg-red-900/50 border-red-500 border ring-2 ring-red-500/20 scale-110' 
                      : 'bg-black border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {!isJoining ? (
            <div className="space-y-4 pt-2">
              <button
                onClick={() => {
                  if (name) createRoom(name, selectedAvatar);
                }}
                disabled={!name || !isConnected}
                className="w-full bg-red-600 text-white font-black py-5 rounded-xl hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                {isConnected ? 'Start New Game' : 'Connecting...'}
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-bold uppercase">OR</span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <button
                onClick={() => setIsJoining(true)}
                disabled={!isConnected}
                className="w-full bg-zinc-800 text-zinc-300 font-bold py-5 rounded-xl hover:bg-zinc-700 border border-zinc-700 transition-all hover:text-white uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isConnected ? 'Join Existing Game' : 'Connecting...'}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Access Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="X7K9P2"
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 transition-all font-mono font-bold text-xl uppercase tracking-[0.2em] text-center"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setIsJoining(false)}
                  className="bg-zinc-800 text-zinc-400 font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors uppercase tracking-wider text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (name && roomCode) joinRoom(roomCode, name, selectedAvatar);
                  }}
                  disabled={!name || !roomCode}
                  className="bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wider text-xs"
                >
                  Enter
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">v1.0.0 • Secure Connection</p>
        </div>
      </motion.div>
    </div>
  );
};
