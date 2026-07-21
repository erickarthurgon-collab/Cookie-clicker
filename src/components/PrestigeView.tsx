import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Orbit, Award, Zap, ChevronRight, RefreshCw } from 'lucide-react';
import { GameState } from '../types';
import { formatCookies } from '../utils/gameData';
import { playAscensionSound } from '../utils/audio';

interface PrestigeViewProps {
  gameState: GameState;
  onAscend: () => void;
}

export default function PrestigeView({
  gameState,
  onAscend,
}: PrestigeViewProps) {
  // Current prestige level
  const currentPrestige = gameState.prestigeLevel;
  
  // Calculate total target prestige based on all-time baked cookies (including current run)
  const totalAllTimeBaked = gameState.prestigePointsAllTime + gameState.totalCookiesBaked;
  
  // Formula: Prestige Level = floor( sqrt( totalCookiesAllTime / 1,000,000 ) )
  const targetPrestige = Math.floor(Math.sqrt(totalAllTimeBaked / 1000000));
  
  // Chips ready to claim on next ascension
  const chipsToClaim = Math.max(0, targetPrestige - currentPrestige);
  
  // Cookies required for the NEXT chip
  const nextChipLevel = (currentPrestige + chipsToClaim) + 1;
  const cookiesRequiredForNext = Math.pow(nextChipLevel, 2) * 1000000;
  const cookiesNeeded = Math.max(0, cookiesRequiredForNext - totalAllTimeBaked);

  const handleAscensionClick = () => {
    if (chipsToClaim === 0) return;
    
    if (confirm(`Tem certeza de que deseja ASCENDER ao Cosmos? \n\nVocê ganhará +${chipsToClaim} Chips Celestiais (${chipsToClaim}% bônus permanente de CPS). \n\nIsso REINICIARÁ seus cookies em estoque, suas estruturas compradas e suas melhorias atuais, mas você voltará muito mais forte!`)) {
      playAscensionSound();
      onAscend();
    }
  };

  return (
    <div id="prestige-view-container" className="flex flex-col h-[calc(100vh-140px)] px-5 py-4 select-none overflow-y-auto pb-10 bg-dot-grid">
      
      {/* Heavenly Header Banner */}
      <div id="prestige-heavenly-banner" className="bg-[#16161a] border border-white/10 rounded-lg p-5 mb-5 shadow-lg text-center relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />

        <Orbit className="w-10 h-10 text-orange-500 mx-auto mb-3 animate-spin" style={{ animationDuration: '25s' }} />
        
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Legado Cósmico
        </h3>
        
        <p className="text-[10px] text-white/50 mt-2 max-w-[240px] mx-auto leading-relaxed uppercase tracking-wider">
          Transborde os limites do forno físico e converta seus biscoitos assados em energia celestial pura.
        </p>
      </div>

      {/* Prestige Stats Cards */}
      <div id="prestige-stats-grid" className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#16161a] border border-white/10 p-4 rounded-lg flex flex-col items-center text-center">
          <Zap className="w-4 h-4 text-orange-400 mb-2" />
          <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Chips Atuais</span>
          <span className="text-base font-mono font-bold text-white mt-1">{currentPrestige}</span>
          <span className="text-[8px] text-white/30 uppercase tracking-wider mt-1.5 font-bold">+{currentPrestige}% CPS permanente</span>
        </div>

        <div className="bg-[#16161a] border border-white/10 p-4 rounded-lg flex flex-col items-center text-center">
          <Sparkles className="w-4 h-4 text-green-400 mb-2" />
          <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Disponíveis</span>
          <span className="text-base font-mono font-bold text-green-400 mt-1">+{chipsToClaim}</span>
          <span className="text-[8px] text-white/30 uppercase tracking-wider mt-1.5 font-bold">Novos Cristais</span>
        </div>
      </div>

      {/* Ascension Button stage */}
      <div id="ascension-action-card" className="bg-[#16161a] border border-white/10 rounded-lg p-4.5 mb-5 flex flex-col items-center text-center">
        {chipsToClaim > 0 ? (
          <div className="w-full">
            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              Você acumulou cookies suficientes para ascender! Ao ascender agora, você receberá <strong className="text-green-400">{chipsToClaim} Chips Celestiais</strong>, reiniciando o forno com um bônus multiplicador total de <strong className="text-orange-400">+{currentPrestige + chipsToClaim}%</strong> de velocidade.
            </p>

            <motion.button
              id="ascend-now-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAscensionClick}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ASCENDER PARA O COSMOS</span>
            </motion.button>
          </div>
        ) : (
          <div className="w-full">
            <p className="text-[10px] text-white/50 uppercase tracking-wider leading-relaxed mb-1">
              Sua energia celestial está estável. Continue assando cookies para liberar sua próxima ascensão.
            </p>
            <div className="w-full bg-[#1a1a20] border border-white/5 p-3 rounded mt-3 text-left">
              <div className="flex justify-between items-center text-[8px] text-white/40 uppercase font-black tracking-widest">
                <span>Próximo Cristal</span>
                <span className="font-mono text-orange-400">Nível {chipsToClaim + 1}</span>
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-2 uppercase tracking-widest">
                Faltam para o próximo:
              </div>
              <div className="text-sm font-mono font-bold text-white mt-1">
                {formatCookies(cookiesNeeded)} 🍪
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prestige Explanation */}
      <div id="prestige-faq-box" className="bg-[#1a1a20] border border-white/5 rounded-lg p-4 text-left">
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-orange-500" />
          <span>Funcionamento do Legado</span>
        </h4>
        <ul className="text-[10px] text-white/50 space-y-2 leading-relaxed list-disc list-inside">
          <li>Seu primeiro chip celestial é liberado ao assar <strong className="text-white">1 Milhão</strong> de cookies acumulados na carreira.</li>
          <li>Cada chip adicional requer progressivamente mais cookies assados acumulados.</li>
          <li><strong className="text-white">O que é mantido:</strong> Níveis de legado, conquistas conquistadas e suas estatísticas de carreira.</li>
          <li><strong className="text-white">O que é redefinido:</strong> Biscoitos em estoque, vovós contratadas, fábricas e upgrades ativos.</li>
        </ul>
      </div>

    </div>
  );
}
