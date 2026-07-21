import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, Sprout, Sparkles, Clock, Lock, Flame, Coins, 
  Database, Info, Trash2, Shield, Heart, Zap, Play 
} from 'lucide-react';
import { GameState, GardenPlot, GardenPlant } from '../types';
import { formatCookies } from '../utils/gameData';
import { playClickSound, playCrunchSound, playUpgradeSound, playGoldenCookieSound } from '../utils/audio';

interface MinigamesViewProps {
  gameState: GameState;
  onCastSpell: (spellId: string) => void;
  onPlantSeed: (plotId: number, plantType: 'chocoflour' | 'starseed' | 'sugarspike') => void;
  onHarvestPlant: (plotId: number) => void;
  onUnlockPlot: (plotId: number) => void;
  onRemovePlant: (plotId: number) => void;
}

const SEED_TYPES = [
  {
    type: 'chocoflour' as const,
    name: 'Trigo de Biscoito',
    desc: 'Fácil de cultivar. Rende +10.000 cookies prontos ao colher.',
    cost: 2000,
    time: 60, // 1 minute
    rewardDesc: '10k 🍪 instantâneos',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10 border-amber-400/20',
  },
  {
    type: 'sugarspike' as const,
    name: 'Espinho de Açúcar',
    desc: 'Casca rígida que concentra minerais estelares. Rende +5 Estrelas Cósmicas ao colher.',
    cost: 5000,
    time: 180, // 3 minutes
    rewardDesc: '+5 ★ Estrelas',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10 border-orange-400/20',
  },
  {
    type: 'starseed' as const,
    name: 'Semente Estelar',
    desc: 'Planta celestial. Enquanto estiver plantada, aumenta o CPS global em +15%. Rende 50.000 cookies e +2 Estrelas Cósmicas ao colher.',
    cost: 15000,
    time: 300, // 5 minutes
    rewardDesc: '+15% CPS (ativo) & 50k 🍪 + 2★ (colheita)',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10 border-blue-400/20',
  },
];

const SPELLS = [
  {
    id: 'conjure_cookie',
    name: 'Invocação Dourada',
    desc: 'Usa magnetismo astral para manifestar um Cookie Dourado na tela de jogo imediatamente.',
    cost: 30,
    icon: Sparkles,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/25',
    glowColor: 'shadow-yellow-500/20',
  },
  {
    id: 'feverish_spark',
    name: 'Sopro Incandescente',
    desc: 'Aquece os fornos mágicos, ativando imediatamente a fúria do Cookie (Frenzy x7 CPS por 30 segundos).',
    cost: 50,
    icon: Flame,
    color: 'text-orange-400',
    borderColor: 'border-orange-500/25',
    glowColor: 'shadow-orange-500/20',
  },
  {
    id: 'oven_alchemy',
    name: 'Alquimia de Forno',
    desc: 'Transmuta energia espectral em matéria física. Ganhe 30% dos cookies já assados até agora (máximo de 5 minutos de CPS).',
    cost: 70,
    icon: Coins,
    color: 'text-green-400',
    borderColor: 'border-green-500/25',
    glowColor: 'shadow-green-500/20',
  },
];

export default function MinigamesView({
  gameState,
  onCastSpell,
  onPlantSeed,
  onHarvestPlant,
  onUnlockPlot,
  onRemovePlant,
}: MinigamesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'wizard' | 'garden'>('wizard');
  const [selectedPlotForPlanting, setSelectedPlotForPlanting] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Real-time ticking for plant progress calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to compute plant growth progress percentage (0 - 100)
  const getPlantProgress = (plant: GardenPlant | null): number => {
    if (!plant) return 0;
    const elapsedSeconds = (currentTime - plant.plantedAt) / 1000;
    return Math.min(100, Math.floor((elapsedSeconds / plant.growTime) * 1000) / 10);
  };

  const getRemainingTime = (plant: GardenPlant | null): string => {
    if (!plant) return '';
    const elapsedSeconds = (currentTime - plant.plantedAt) / 1000;
    const remaining = Math.max(0, plant.growTime - elapsedSeconds);
    if (remaining === 0) return 'Madora!';
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${mins}m ${secs}s`;
  };

  const handleCastSpellClick = (spellId: string, cost: number) => {
    if (gameState.wizardMana < cost) return;
    onCastSpell(spellId);
  };

  const handlePlotClick = (plot: GardenPlot) => {
    if (!plot.unlocked) {
      // Cost to unlock: plot 2=10k, 5=25k, 6=50k, 7=100k, 8=250k
      const unlockCosts: { [key: number]: number } = {
        2: 10000, 5: 25000, 6: 50000, 7: 100000, 8: 250000
      };
      const cost = unlockCosts[plot.id] || 0;
      if (gameState.cookies >= cost) {
        if (confirm(`Deseja desbloquear este lote de cultivo por ${formatCookies(cost)} cookies?`)) {
          onUnlockPlot(plot.id);
        }
      }
      return;
    }

    if (plot.plant) {
      const progress = getPlantProgress(plot.plant);
      if (progress >= 100) {
        onHarvestPlant(plot.id);
      } else {
        // Option to uproot early
        if (confirm(`Esta planta ainda está crescendo (${progress}%). Deseja arrancá-la? Você perderá a semente e não receberá prêmio.`)) {
          onRemovePlant(plot.id);
        }
      }
    } else {
      // Open seed plant selection
      setSelectedPlotForPlanting(plot.id);
    }
  };

  const handlePlantSeedAction = (seedType: 'chocoflour' | 'starseed' | 'sugarspike', cost: number) => {
    if (selectedPlotForPlanting === null) return;
    if (gameState.cookies < cost) return;
    onPlantSeed(selectedPlotForPlanting, seedType);
    setSelectedPlotForPlanting(null);
  };

  // Plot Unlock Costs helper
  const getUnlockCost = (id: number): number => {
    const unlockCosts: { [key: number]: number } = {
      2: 10000, 5: 25000, 6: 50000, 7: 100000, 8: 250000
    };
    return unlockCosts[id] || 0;
  };

  return (
    <div id="minigames-view-container" className="flex flex-col h-[calc(100vh-140px)] px-5 py-4 select-none overflow-y-auto pb-10 bg-dot-grid">
      
      {/* Selector SubTabs */}
      <div id="minigames-selector-row" className="flex bg-[#16161a] border border-white/10 p-1 rounded-lg mb-5 shadow">
        <button
          id="subtab-wizard"
          onClick={() => { playClickSound(); setActiveSubTab('wizard'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'wizard'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Torre do Mago</span>
        </button>
        <button
          id="subtab-garden"
          onClick={() => { playClickSound(); setActiveSubTab('garden'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'garden'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Jardim Cósmico</span>
        </button>
      </div>

      {/* ----------------- SUB-TAB: TORRE DO MAGO ----------------- */}
      {activeSubTab === 'wizard' && (
        <div id="wizard-game-panel" className="flex flex-col">
          
          {/* Mana Pool Gauge */}
          <div id="wizard-mana-gauge-card" className="bg-[#16161a] border border-white/10 rounded-lg p-5 mb-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[8px] text-white/40 uppercase tracking-widest font-black block">Reserva Arcana</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Mana de Biscoito</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-indigo-400">
                  {Math.floor(gameState.wizardMana)} / {gameState.wizardMaxMana}
                </span>
                <span className="text-[8px] text-white/30 block uppercase tracking-wider mt-0.5">+0.5 Mana/s</span>
              </div>
            </div>

            {/* Glowing Mana Bar */}
            <div className="w-full h-3 bg-black/40 border border-white/5 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.wizardMana / gameState.wizardMaxMana) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Spell Book List */}
          <div id="spell-book-list" className="flex flex-col gap-4">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block pl-1">Grimório Disponível</span>
            
            {SPELLS.map((spell) => {
              const SpellIcon = spell.icon;
              const hasMana = gameState.wizardMana >= spell.cost;
              return (
                <div
                  id={`spell-card-${spell.id}`}
                  key={spell.id}
                  className={`bg-[#16161a] border rounded-lg p-4 transition-all flex flex-col gap-3.5 relative shadow-md ${spell.borderColor} ${
                    hasMana ? 'hover:border-white/25 hover:shadow-[0_4px_16px_rgba(255,255,255,0.02)]' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded bg-black/30 border border-white/5 flex items-center justify-center ${spell.color} shrink-0`}>
                      <SpellIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{spell.name}</h4>
                        <span className={`text-[10px] font-mono font-bold ${hasMana ? 'text-indigo-400' : 'text-white/20'}`}>
                          {spell.cost} Mana
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{spell.desc}</p>
                    </div>
                  </div>

                  <button
                    id={`cast-spell-btn-${spell.id}`}
                    disabled={!hasMana}
                    onClick={() => handleCastSpellClick(spell.id, spell.cost)}
                    className={`w-full py-2.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                      hasMana
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/10'
                        : 'bg-black/30 border border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>CONJURAR MAGIA</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ----------------- SUB-TAB: JARDIM CÓSMICO ----------------- */}
      {activeSubTab === 'garden' && (
        <div id="garden-game-panel" className="flex flex-col">
          
          {/* Garden explanation / instructions */}
          <div id="garden-intro-banner" className="bg-[#16161a] border border-white/10 rounded-lg p-4 mb-5 shadow relative overflow-hidden flex gap-3">
            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Estufa Cósmica</h4>
              <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-wider mt-1">
                Plante sementes usando cookies. Elas crescem em tempo real, mesmo com o jogo fechado! Colha ao atingir 100% para receber bônus.
              </p>
            </div>
          </div>

          {/* Seed list selector IF popup/overlay is active */}
          <AnimatePresence>
            {selectedPlotForPlanting !== null && (
              <motion.div
                id="seed-picker-overlay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a20] border border-orange-500/30 p-4.5 rounded-lg mb-5 flex flex-col gap-4 relative shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Plantar no Lote #{selectedPlotForPlanting + 1}
                  </span>
                  <button
                    id="close-seed-picker"
                    onClick={() => setSelectedPlotForPlanting(null)}
                    className="text-white/40 hover:text-white p-1 text-sm cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex flex-col gap-3.5">
                  {SEED_TYPES.map((seed) => {
                    const canAfford = gameState.cookies >= seed.cost;
                    return (
                      <div
                        id={`seed-option-${seed.type}`}
                        key={seed.type}
                        className={`border rounded-lg p-3 flex flex-col gap-2.5 transition-all ${seed.bgColor} ${
                          canAfford ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className={`text-[11px] font-black uppercase tracking-wider ${seed.color}`}>{seed.name}</h5>
                            <span className="text-[8px] text-white/40 uppercase tracking-widest font-mono font-bold block mt-0.5">
                              Tempo: {seed.time}s • Prêmio: {seed.rewardDesc}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-black text-white shrink-0">
                            {formatCookies(seed.cost)} 🍪
                          </span>
                        </div>
                        <p className="text-[9px] text-white/60 leading-relaxed uppercase tracking-wider">{seed.desc}</p>
                        
                        <button
                          id={`plant-action-btn-${seed.type}`}
                          disabled={!canAfford}
                          onClick={() => handlePlantSeedAction(seed.type, seed.cost)}
                          className={`w-full py-2 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                            canAfford
                              ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                              : 'bg-black/30 border border-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          Semear Planta
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid Layout (3x3 plots) */}
          <div id="garden-grid-3x3" className="grid grid-cols-3 gap-3.5 mb-6">
            {gameState.gardenPlots?.map((plot) => {
              const progress = getPlantProgress(plot.plant);
              const isMature = progress >= 100;
              const remainingStr = getRemainingTime(plot.plant);

              return (
                <button
                  id={`garden-plot-btn-${plot.id}`}
                  key={plot.id}
                  onClick={() => handlePlotClick(plot)}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 relative overflow-hidden transition-all select-none cursor-pointer ${
                    !plot.unlocked
                      ? 'bg-black/40 border-white/5 text-white/20 hover:border-orange-500/40 hover:text-white/60'
                      : plot.plant
                      ? 'bg-[#1a1a20] border-orange-500/40 text-orange-400'
                      : 'bg-black/20 border-white/10 text-white/20 border-dashed hover:border-orange-500/40 hover:text-white/50'
                  }`}
                >
                  {/* Lock status or Plant display */}
                  {!plot.unlocked ? (
                    <div className="flex flex-col items-center text-center gap-1">
                      <Lock className="w-4 h-4 opacity-50" />
                      <span className="text-[7px] uppercase tracking-widest font-black leading-none mt-1">Bloqueado</span>
                      <span className="text-[8px] font-mono font-bold text-white/40 mt-1">{formatCookies(getUnlockCost(plot.id))}</span>
                    </div>
                  ) : plot.plant ? (
                    <div className="flex flex-col items-center text-center w-full h-full justify-between relative z-10">
                      
                      {/* Top label */}
                      <span className="text-[6.5px] uppercase font-black tracking-widest text-white/40 truncate w-full">
                        {plot.plant.name}
                      </span>

                      {/* Plant Visual representation using anims */}
                      <div className="my-1 shrink-0">
                        {plot.plant.type === 'starseed' ? (
                          <Sparkles className={`w-5 h-5 text-blue-400 ${isMature ? 'animate-bounce' : 'animate-pulse'}`} />
                        ) : plot.plant.type === 'sugarspike' ? (
                          <Zap className={`w-5 h-5 text-orange-400 ${isMature ? 'animate-bounce' : 'animate-pulse'}`} />
                        ) : (
                          <Sprout className={`w-5 h-5 text-amber-400 ${isMature ? 'animate-bounce' : 'animate-pulse'}`} />
                        )}
                      </div>

                      {/* Progress state */}
                      <div className="w-full">
                        <span className={`text-[7px] font-mono font-black block leading-none ${isMature ? 'text-green-400' : 'text-white/50'}`}>
                          {isMature ? 'COLHER!' : `${Math.floor(progress)}%`}
                        </span>
                        {!isMature && (
                          <span className="text-[6px] font-mono text-white/30 block mt-0.5 leading-none">
                            {remainingStr}
                          </span>
                        )}
                      </div>

                      {/* Growth mini bar */}
                      <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${isMature ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Sprout className="w-4 h-4 opacity-30" />
                      <span className="text-[7.5px] uppercase tracking-wider font-extrabold block">Vazio</span>
                      <span className="text-[6px] uppercase text-white/30 tracking-widest font-bold">Semear</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
