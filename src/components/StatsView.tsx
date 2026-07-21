import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, Sparkles, Flame, Cookie, ShoppingBag, TrendingUp, Globe, 
  UserCheck, Users, Cpu, Sun, Clock, MousePointer, Medal, Lock 
} from 'lucide-react';
import { Achievement, GameState } from '../types';
import { formatCookies, formatTime } from '../utils/gameData';

interface StatsViewProps {
  gameState: GameState;
  achievements: Achievement[];
  cps: number;
  clickPower: number;
}

// Map strings to Lucide components for dynamic badge rendering
const BADGE_MAP: { [key: string]: React.ComponentType<any> } = {
  Award,
  Sparkles,
  Flame,
  Cookie,
  ShoppingBag,
  TrendingUp,
  Globe,
  UserCheck,
  Users,
  Cpu,
  Sun,
};

export default function StatsView({
  gameState,
  achievements,
  cps,
  clickPower,
}: StatsViewProps) {
  // Unlocked vs total
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div id="stats-view-container" className="flex flex-col h-[calc(100vh-140px)] px-5 py-4 select-none overflow-y-auto pb-10 bg-dot-grid">
      
      {/* 1. Statistics Section */}
      <div id="stats-block" className="bg-[#16161a] border border-white/10 rounded-lg p-4 mb-5 shadow-lg">
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2.5">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          <span>Estatísticas Globais</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Tempo de Forno</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5">{formatTime(gameState.playTime)}</span>
          </div>

          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Cliques Totais</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5">{gameState.clicks.toLocaleString()}</span>
          </div>

          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Total Assado</span>
            <span className="text-xs font-mono font-bold text-orange-400 mt-1.5">{formatCookies(gameState.totalCookiesBaked)} 🍪</span>
          </div>

          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Investimentos</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5">{formatCookies(gameState.cookiesSpent)} 🍪</span>
          </div>

          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Cookies de Ouro</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5">{gameState.goldenCookieClicks}</span>
          </div>

          <div className="bg-[#1a1a20] border border-white/5 p-3 rounded flex flex-col">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Poder de Clique</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5">+{formatCookies(clickPower)}</span>
          </div>

          {gameState.prestigeLevel > 0 && (
            <div className="col-span-2 bg-[#1a1a20] border border-orange-500/20 p-3.5 rounded flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Nível de Legado</span>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider mt-1">LVL {gameState.prestigeLevel}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Bônus Adicional</span>
                <span className="text-xs font-mono font-bold text-green-400 mt-1">+{gameState.prestigeLevel}% CPS</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Achievements Cabinet */}
      <div id="achievements-cabinet" className="bg-[#16161a] border border-white/10 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Medal className="w-3.5 h-3.5 text-orange-500" />
            <span>Conquistas</span>
          </h3>
          <span id="achievement-unlocked-ratio" className="text-[9px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded">
            {unlockedCount} / {totalCount} ({unlockPercentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/40 h-1.5 rounded overflow-hidden mb-5 border border-white/5">
          <div 
            className="h-full bg-orange-500" 
            style={{ width: `${unlockPercentage}%` }} 
          />
        </div>

        {/* Achievement Grid */}
        <div id="achievements-grid" className="flex flex-col gap-3">
          {achievements.map((ach) => {
            const BadgeIcon = BADGE_MAP[ach.icon] || Award;
            return (
              <div
                id={`achievement-row-${ach.id}`}
                key={ach.id}
                className={`flex items-center gap-3.5 p-3 rounded border transition-all ${
                  ach.unlocked
                    ? 'bg-[#1a1a20] border-orange-500/20 text-white shadow-[0_2px_10px_rgba(249,115,22,0.05)]'
                    : 'bg-[#1a1a20]/30 border-white/5 opacity-50'
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`w-10 h-10 rounded flex items-center justify-center border shrink-0 ${
                  ach.unlocked
                    ? 'bg-orange-600/10 border-orange-500/30 text-orange-400'
                    : 'bg-black/30 border-white/5 text-white/20'
                }`}>
                  {ach.unlocked ? (
                    <BadgeIcon className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold leading-tight uppercase tracking-wider ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>
                    {ach.unlocked ? ach.name : "Conquista Secreta"}
                  </span>
                  <span className="text-[9px] text-white/40 mt-1 leading-relaxed">
                    {ach.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
