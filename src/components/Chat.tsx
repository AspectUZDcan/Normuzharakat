import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Phase } from '../types';
import { MessageSquare } from 'lucide-react';

interface ChatProps {
  logs: string[];
  phase: Phase;
}

export const Chat = ({ logs, phase }: ChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-zinc-800 bg-black/20 flex items-center gap-2">
        <MessageSquare size={16} className="text-zinc-500" />
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Game Log</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {logs.map((log, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm border-l-2 border-zinc-700 pl-3 py-1"
          >
            <p className="text-zinc-300 font-medium leading-relaxed">{log}</p>
          </motion.div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-zinc-600 text-xs uppercase tracking-widest mt-10">
            No events yet...
          </div>
        )}
      </div>
    </div>
  );
};
