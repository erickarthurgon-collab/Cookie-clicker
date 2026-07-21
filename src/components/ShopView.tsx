import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MousePointerClick, MousePointer, User, Sprout, Pickaxe, Factory, Coins, 
  Church, Flame, Orbit, Zap, Milk, Sparkles, HelpCircle, ArrowRight 
} from 'lucide-react';
import { Building, Upgrade } from '../types';
import { formatCookies } from '../utils/gameData';

interface ShopViewProps {
  cookies: number;
  buildings: Building[];
  upgrades: Upgrade[];
  onBuyBuilding: (id: string, qty: number) => void;
  onBuyUpgrade: (id: string) => void;
}

// Map strings to Lucide components for dynamic icon loading
const ICON_MAP: { [key: string]: React.ComponentType<any> } = {
  MousePointerClick,
  MousePointer,
  User,
  Sprout,
  Pickaxe,
  Factory,
  Coins,
  Church,
  Flame,
  Orbit,
  Zap,
  Milk,
  Sparkles,
};

export default function ShopView({
  cookies,
  buildings,
  upgrades,
  onBuyBuilding,
  onBuyUpgrade,
}: ShopViewProps) {
  const [buyQty, setBuyQty] = useState<1 | 10 | 100>(1);
  const [selectedUpgrade, setSelectedUpgrade] = useState<Upgrade | null>(null);

  // Available upgrades (unlocked and not purchased yet)
  const availableUpgrades = upgrades.filter(u => u.unlocked && !u.purchased);

  // Helper to calculate total compounding cost of buying multiple buildings
  const getBulkInfo = (b: Building, qty: number) => {
    let totalCost = 0;
    let tempCost = b.currentCost;
    for (let i = 0; i < qty; i++) {
      totalCost += tempCost;
      tempCost = Math.ceil(tempCost * b.costMultiplier);
    }
    return {
      totalCost,
      canAfford: cookies >= totalCost,
    };
  };

  return (
    <div id="shop-view-container" className="flex flex-col h-[calc(100vh-140px)] px-5 py-4 select-none overflow-y-auto pb-10 bg-dot-grid">
      
      {/* Upgrades Section */}
      {availableUpgrades.length > 0 && (
        <div id="upgrades-shelf" className="mb-4 bg-[#16161a] p-3.5 rounded-lg border border-white/10">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Melhorias ({availableUpgrades.length})</span>
          </h3>
          
          <div className="flex flex-wrap gap-2.5 max-h-32 overflow-y-auto py-1">
            {availableUpgrades.map((upgrade) => {
              const IconComp = ICON_MAP[upgrade.icon] || HelpCircle;
              const isAffordable = cookies >= upgrade.cost;
              return (
                <motion.button
                  id={`upgrade-shop-btn-${upgrade.id}`}
                  key={upgrade.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedUpgrade(upgrade)}
                  className={`relative w-11 h-11 rounded border transition-all ${
                    isAffordable 
                      ? 'bg-[#1a1a20] border-orange-500/50 text-white shadow-[0_0_10px_rgba(249,115,22,0.15)] hover:bg-[#25252e] cursor-pointer' 
                      : 'bg-black/40 border-white/5 text-white/20 opacity-50 cursor-pointer'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {isAffordable && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Detail Sheet/Modal */}
      <AnimatePresence>
        {selectedUpgrade && (
          <motion.div
            id="upgrade-detail-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 bg-[#1a1a20] border border-orange-500/50 p-4 rounded-lg flex flex-col gap-3.5 relative shadow-2xl"
          >
            <button 
              id="close-upgrade-detail"
              onClick={() => setSelectedUpgrade(null)} 
              className="absolute top-2 right-3 text-white/40 hover:text-white p-1 text-base cursor-pointer"
            >
              &times;
            </button>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded bg-[#16161a] border border-white/10 flex items-center justify-center text-orange-500">
                {React.createElement(ICON_MAP[selectedUpgrade.icon] || HelpCircle, { className: "w-5 h-5" })}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedUpgrade.name}</h4>
                <p className="text-[10px] text-white/50 mt-1 leading-normal">{selectedUpgrade.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Investimento</span>
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-0.5 mt-0.5">
                  {formatCookies(selectedUpgrade.cost)} 🍪
                </span>
              </div>
              <button
                id="buy-upgrade-btn"
                disabled={cookies < selectedUpgrade.cost}
                onClick={() => {
                  onBuyUpgrade(selectedUpgrade.id);
                  setSelectedUpgrade(null);
                }}
                className={`px-4 py-2 rounded font-bold text-[9px] uppercase tracking-widest shadow transition-all ${
                  cookies >= selectedUpgrade.cost
                    ? 'bg-orange-600 text-white hover:bg-orange-500 cursor-pointer'
                    : 'bg-[#16161a] text-white/20 border border-white/5 cursor-not-allowed'
                }`}
              >
                Ativar Upgrade
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Buy Toggle */}
      <div id="bulk-buy-bar" className="flex items-center justify-between mb-4 bg-[#16161a] p-2.5 rounded-lg border border-white/10">
        <span className="text-[10px] uppercase tracking-widest font-black text-white/60 pl-1">Multiplicador</span>
        <div className="flex gap-1.5">
          {([1, 10, 100] as const).map((qty) => (
            <button
              id={`buy-qty-btn-${qty}`}
              key={qty}
              onClick={() => setBuyQty(qty)}
              className={`w-12 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                buyQty === qty
                  ? 'bg-orange-600 text-white font-black'
                  : 'bg-[#1a1a20] text-white/40 border border-white/5 hover:text-white'
              }`}
            >
              x{qty}
            </button>
          ))}
        </div>
      </div>

      {/* Buildings List */}
      <div id="buildings-list-container" className="flex flex-col gap-3">
        {buildings.map((building) => {
          const IconComp = ICON_MAP[building.icon] || HelpCircle;
          const bulk = getBulkInfo(building, buyQty);
          const singleCpsTotal = building.baseCps * building.count;

          return (
            <motion.div
              id={`building-card-${building.id}`}
              key={building.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (bulk.canAfford) {
                  onBuyBuilding(building.id, buyQty);
                }
              }}
              className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                bulk.canAfford
                  ? 'bg-[#16161a] border-white/10 hover:border-orange-500/30 cursor-pointer shadow-md'
                  : 'bg-[#16161a]/40 border-white/5 opacity-60 cursor-pointer'
              }`}
            >
              {/* Left Side: Icon & Details */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded flex items-center justify-center border transition-all ${
                  bulk.canAfford 
                    ? 'bg-[#1a1a20] border-white/10 text-orange-400' 
                    : 'bg-black/30 border-white/5 text-white/20'
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider truncate">{building.name}</span>
                    {building.count > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#1a1a20] text-orange-400 border border-white/10 rounded font-mono font-bold">
                        x{building.count}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-white/40 mt-1 truncate max-w-[170px] leading-snug">
                    {building.description}
                  </span>
                  {building.count > 0 && (
                    <span className="text-[9px] font-mono text-orange-400/80 mt-1">
                      Produção: +{formatCookies(singleCpsTotal)} CPS
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Cost & Action */}
              <div className="flex flex-col items-end pl-2">
                <span className={`text-[8px] uppercase tracking-widest font-bold ${bulk.canAfford ? 'text-white/60' : 'text-white/20'}`}>
                  Custo x{buyQty}
                </span>
                <span className={`text-xs font-mono font-bold mt-1 flex items-center gap-0.5 ${bulk.canAfford ? 'text-white' : 'text-white/30'}`}>
                  {formatCookies(bulk.totalCost)} 🍪
                </span>
                <span className="text-[8px] font-mono text-white/30 mt-1">
                  +{formatCookies(building.baseCps)} CPS cd.
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
