import React from 'react';
import { motion } from 'motion/react';
import { Shield, Skull, Search, User } from 'lucide-react';
import { Role } from '../types';

interface RoleCardProps {
  role: Role;
  name: string;
}

const roleConfig = {
  MAFIA: {
    icon: Skull,
    color: 'text-red-500',
    bg: 'bg-red-950/20',
    border: 'border-red-900/50',
    description: 'Eliminate the townspeople at night. Don\'t get caught.',
    gradient: 'from-red-900/40 to-black',
  },
  DOCTOR: {
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-950/20',
    border: 'border-blue-900/50',
    description: 'Save one person each night from the Mafia.',
    gradient: 'from-blue-900/40 to-black',
  },
  SHERIFF: {
    icon: Search,
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/20',
    border: 'border-yellow-900/50',
    description: 'Investigate one person each night to find the Mafia.',
    gradient: 'from-yellow-900/40 to-black',
  },
  CIVILIAN: {
    icon: User,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-900/50',
    description: 'Find the Mafia during the day and vote them out.',
    gradient: 'from-emerald-900/40 to-black',
  },
};

export const RoleCard = ({ role, name }: RoleCardProps) => {
  const config = roleConfig[role] || roleConfig.CIVILIAN;
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${config.bg} border ${config.border} shadow-2xl h-full flex flex-col`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
      
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon size={120} />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${config.color}`}>
            <Icon size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Your Identity</span>
            <span className="text-white font-bold">{name}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <h2 className={`text-4xl font-black ${config.color} mb-3 tracking-tighter uppercase`}>{role}</h2>
          <div className="h-1 w-12 bg-white/20 mb-3 rounded-full" />
          <p className="text-zinc-300 text-sm leading-relaxed font-medium">{config.description}</p>
        </div>
      </div>
    </motion.div>
  );
};
