import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface Club {
  id: number;
  name: string;
  cover: string;
  members: number;
  genre: string;
  description: string;
  isJoined: boolean;
}

interface ClubCardProps {
  club: Club;
  onClick: (club: Club) => void;
  onJoin: (id: number) => void;
}

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

export const ClubCard: React.FC<ClubCardProps> = ({ club, onClick, onJoin }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-[#262626] rounded-[24px] overflow-hidden border border-white/5 group flex flex-col h-full"
  >
    <div className="relative h-40 overflow-hidden">
      <img src={club.cover} alt={club.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-3 left-3">
        <Badge className="bg-[#EC5939] text-white">{club.genre}</Badge>
      </div>
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
        <Users size={12} className="text-white" />
        <span className="text-white text-xs font-medium">{club.members}</span>
      </div>
    </div>
    
    <div className="p-5 flex-grow flex flex-col">
      <h3 className="text-white font-bold text-lg mb-1 leading-tight">{club.name}</h3>
      <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-grow">{club.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <button 
          onClick={() => onClick(club)}
          className="text-white/70 hover:text-white text-sm font-medium transition-colors"
        >
          Détails
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onJoin(club.id); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            club.isJoined 
            ? 'bg-white/10 text-white' 
            : 'bg-[#EC5939] text-white shadow-lg shadow-[#EC5939]/20 hover:scale-105 active:scale-95'
          }`}
        >
          {club.isJoined ? 'Membre' : 'Rejoindre'}
        </button>
      </div>
    </div>
  </motion.div>
);