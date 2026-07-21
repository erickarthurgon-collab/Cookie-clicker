import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Sun, Coins, Flame, UserCheck, Zap, MousePointerClick, 
  Factory, Orbit, HelpCircle, Lock, Info, Star, ArrowUpRight 
} from 'lucide-react';
import { SkillNode, GameState } from '../types';
import { formatCookies } from '../utils/gameData';

interface SkillsViewProps {
  gameState: GameState;
  skills: SkillNode[];
  onUnlockSkill: (id: string) => void;
  onExchangeCookiesForStar: () => void;
}

// Map icon string names to Lucide icon components
const ICON_MAP: { [key: string]: React.ComponentType<any> } = {
  MousePointerClick,
  Factory,
  Sparkles,
  Sun,
  Coins,
  Orbit,
  Flame,
  UserCheck,
  Zap,
};

export default function SkillsView({
  gameState,
  skills,
  onUnlockSkill,
  onExchangeCookiesForStar,
}: SkillsViewProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  // Exchange Cost: 25,000 * (1 + cosmicStarsExchanged)
  const exchangeCost = 25000 * (1 + gameState.cosmicStarsExchanged);
  const canAffordExchange = gameState.cookies >= exchangeCost;

  // Helper to check if a skill is unlocked
  const isSkillUnlocked = (id: string) => gameState.unlockedSkills.includes(id);

  // Helper to check if prerequisite skills are unlocked
  const arePrereqsMet = (skill: SkillNode) => {
    if (!skill.dependsOn || skill.dependsOn.length === 0) return true;
    // Check if at least one of the dependsOn skills is unlocked (or all, depending on design. Let's require ALL dependsOn skills to be unlocked)
    return skill.dependsOn.every(id => isSkillUnlocked(id));
  };

  // Check if player can buy the skill
  const canBuySkill = (skill: SkillNode) => {
    return !isSkillUnlocked(skill.id) && arePrereqsMet(skill) && gameState.cosmicStars >= skill.cost;
  };

  // Define connection lines to draw in SVG
  const connections = [
    // Tier 1 to Tier 2
    { from: 'skill_click_1', to: 'skill_click_2' },
    { from: 'skill_click_1', to: 'skill_golden_1' },
    { from: 'skill_efficiency_1', to: 'skill_cps_1' },
    { from: 'skill_efficiency_1', to: 'skill_efficiency_2' },
    // Tier 2 to Tier 3
    { from: 'skill_click_2', to: 'skill_frenzy_boost' },
    { from: 'skill_golden_1', to: 'skill_frenzy_boost' },
    { from: 'skill_cps_1', to: 'skill_grandma_wisdom' },
    { from: 'skill_efficiency_2', to: 'skill_grandma_wisdom' },
    // Tier 3 to Tier 4
    { from: 'skill_frenzy_boost', to: 'skill_active_surge' },
    { from: 'skill_grandma_wisdom', to: 'skill_active_surge' },
  ];

  return (
    <div id="skills-view-container" className="flex flex-col h-[calc(100vh-140px)] px-5 py-4 select-none overflow-y-auto pb-10 bg-dot-grid">
      
      {/* 1. Currency Display & Exchange Panel */}
      <div id="skills-currency-banner" className="bg-[#16161a] border border-white/10 rounded-lg p-4.5 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shadow-md">
              <Star className="w-5 h-5 fill-orange-500/20 animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Estrelas Cósmicas</span>
              <h3 className="text-xl font-mono font-black text-white flex items-center gap-1 mt-0.5">
                {gameState.cosmicStars}
                <span className="text-xs text-orange-400 font-normal">★</span>
              </h3>
            </div>
          </div>

          {/* Trade Cookies button */}
          <button
            id="exchange-cookies-star-btn"
            disabled={!canAffordExchange}
            onClick={onExchangeCookiesForStar}
            className={`px-3 py-2 rounded text-[9px] uppercase tracking-wider font-black transition-all flex flex-col items-center justify-center gap-0.5 border ${
              canAffordExchange
                ? 'bg-[#1a1a20] border-orange-500/30 text-orange-400 hover:bg-orange-600 hover:text-white cursor-pointer shadow-md'
                : 'bg-black/30 border-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <span>Obter Estrela</span>
            <span className="font-mono text-[8px] font-bold text-white/50">
              {formatCookies(exchangeCost)} 🍪
            </span>
          </button>
        </div>

        {/* Info Tip about obtaining Stars */}
        <div className="mt-3.5 bg-black/30 rounded border border-white/5 px-2.5 py-1.5 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-white/50 leading-relaxed uppercase tracking-wider">
            Colete estrelas completando <strong className="text-white">150 cliques</strong>, tocando em <strong className="text-white">Cookies Dourados (+2★)</strong>, ou negociando cookies de estoque acima.
          </p>
        </div>
      </div>

      {/* 2. Visual Skill Tree Canvas */}
      <div id="skills-tree-canvas" className="relative bg-[#16161a] border border-white/10 rounded-lg p-4 mb-5 shadow-lg min-h-[380px] overflow-hidden">
        <div className="absolute top-2.5 left-3 text-[9px] font-black text-white/40 uppercase tracking-widest">
          Árvore de Constelação
        </div>

        {/* SVG Connection Lines Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="unlocked-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="locked-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {connections.map((conn, idx) => {
            const fromSkill = skills.find(s => s.id === conn.from);
            const toSkill = skills.find(s => s.id === conn.to);
            if (!fromSkill || !toSkill) return null;

            const isPathActive = isSkillUnlocked(fromSkill.id) && isSkillUnlocked(toSkill.id);
            const isPathVisible = isSkillUnlocked(fromSkill.id) || isSkillUnlocked(toSkill.id) || arePrereqsMet(toSkill);

            return (
              <line
                key={idx}
                x1={`${fromSkill.x}%`}
                y1={`${fromSkill.y}%`}
                x2={`${toSkill.x}%`}
                y2={`${toSkill.y}%`}
                stroke={isPathActive ? 'url(#unlocked-grad)' : 'url(#locked-grad)'}
                strokeWidth={isPathActive ? '2' : '1.5'}
                strokeDasharray={isPathActive ? '0' : '4 3'}
                className="transition-all duration-500"
                opacity={isPathVisible ? 1 : 0.25}
              />
            );
          })}
        </svg>

        {/* Nodes plotted absolutely */}
        {skills.map((skill) => {
          const IconComponent = ICON_MAP[skill.icon] || HelpCircle;
          const unlocked = isSkillUnlocked(skill.id);
          const met = arePrereqsMet(skill);
          const isSelected = selectedSkill?.id === skill.id;

          // Compute status class
          let borderClass = 'border-white/10 text-white/30 bg-black/40 bg-opacity-80';
          if (unlocked) {
            borderClass = 'border-orange-500 text-orange-400 bg-[#1a1a20] shadow-[0_0_12px_rgba(249,115,22,0.3)] animate-pulse-slow';
          } else if (met) {
            borderClass = 'border-orange-500/40 text-white/70 bg-[#16161a] hover:border-orange-500 hover:text-white cursor-pointer';
          }

          return (
            <button
              id={`skill-node-${skill.id}`}
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all z-10 -translate-x-1/2 -translate-y-1/2 ${borderClass} ${
                isSelected ? 'scale-115 ring-4 ring-orange-500/20' : ''
              }`}
              style={{
                left: `${skill.x}%`,
                top: `${skill.y}%`,
              }}
              title={skill.name}
            >
              {unlocked ? (
                <IconComponent className="w-5 h-5" />
              ) : met ? (
                <IconComponent className="w-5 h-5 opacity-70" />
              ) : (
                <Lock className="w-4 h-4 text-white/20" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Skill Detail Panel (Conditional or Slide in) */}
      <AnimatePresence mode="wait">
        {selectedSkill ? (
          <motion.div
            id="skill-detail-panel"
            key={selectedSkill.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#1a1a20] border border-orange-500/40 p-4 rounded-lg flex flex-col gap-4 relative shadow-2xl"
          >
            <button
              id="close-skill-detail"
              onClick={() => setSelectedSkill(null)}
              className="absolute top-2 right-3 text-white/40 hover:text-white p-1 text-base cursor-pointer"
            >
              &times;
            </button>

            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${
                isSkillUnlocked(selectedSkill.id)
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                  : 'bg-black/30 border-white/10 text-white/30'
              }`}>
                {React.createElement(ICON_MAP[selectedSkill.icon] || HelpCircle, { className: "w-5 h-5" })}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedSkill.name}</h4>
                  {isSkillUnlocked(selectedSkill.id) && (
                    <span className="text-[7px] bg-orange-500 text-white font-black px-1.5 py-0.2 rounded uppercase tracking-widest">
                      Ativada
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{selectedSkill.description}</p>
              </div>
            </div>

            {/* Prerequisites indicator */}
            {selectedSkill.dependsOn && selectedSkill.dependsOn.length > 0 && (
              <div className="text-[9px] bg-black/20 rounded p-2 border border-white/5">
                <span className="text-white/40 font-black uppercase tracking-widest block mb-1">Requisitos:</span>
                <div className="flex flex-col gap-1">
                  {selectedSkill.dependsOn.map(reqId => {
                    const reqSkill = skills.find(s => s.id === reqId);
                    const isReqUnlocked = isSkillUnlocked(reqId);
                    return (
                      <div key={reqId} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isReqUnlocked ? 'bg-orange-500' : 'bg-white/10'}`} />
                        <span className={isReqUnlocked ? 'text-white/80' : 'text-white/30'}>
                          {reqSkill?.name || 'Habilidade Desconhecida'} {isReqUnlocked ? '✔' : '❌'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Purchase action block */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Custo Estelar</span>
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-0.5 mt-0.5">
                  {selectedSkill.cost} ★
                </span>
              </div>

              {isSkillUnlocked(selectedSkill.id) ? (
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest py-2">
                  ✓ Habilidade Desbloqueada
                </span>
              ) : (
                <button
                  id="unlock-skill-action-btn"
                  disabled={!canBuySkill(selectedSkill)}
                  onClick={() => {
                    onUnlockSkill(selectedSkill.id);
                  }}
                  className={`px-4 py-2 rounded font-bold text-[9px] uppercase tracking-widest shadow transition-all ${
                    canBuySkill(selectedSkill)
                      ? 'bg-orange-600 text-white hover:bg-orange-500 cursor-pointer'
                      : 'bg-[#16161a] text-white/20 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {!arePrereqsMet(selectedSkill)
                    ? 'Bloqueado por Requisito'
                    : gameState.cosmicStars < selectedSkill.cost
                    ? 'Estrelas Insuficientes'
                    : 'Desbloquear'}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div id="no-skill-selected" className="bg-[#16161a] border border-white/5 rounded-lg p-4 text-center text-[10px] text-white/30 uppercase tracking-wider">
            Toque em uma estrela na árvore para ver os bônus e requisitos.
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
