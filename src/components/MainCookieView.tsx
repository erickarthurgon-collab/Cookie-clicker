import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Sun, Award, Zap, Lock } from 'lucide-react';
import { Building, Upgrade, ActiveBuff, FloatingText, GoldenCookie } from '../types';
import { formatCookies, NEWS_TICKER_ITEMS } from '../utils/gameData';
import { playClickSound, playCrunchSound, playGoldenCookieSound } from '../utils/audio';

interface MainCookieViewProps {
  cookies: number;
  cps: number;
  clickPower: number;
  soundEnabled: boolean;
  onCookieClick: (x: number, y: number) => void;
  floatingTexts: FloatingText[];
  activeBuffs: ActiveBuff[];
  onToggleSound: () => void;
  onResetGame: () => void;
  onGoldenCookieClick: (id: string) => void;
  goldenCookies: GoldenCookie[];
  activeSkillUnlocked: boolean;
  activeSkillCooldown: number;
  activeSkillTimeLeft: number;
  onActivateSkill: () => void;
}

export default function MainCookieView({
  cookies,
  cps,
  clickPower,
  soundEnabled,
  onCookieClick,
  floatingTexts,
  activeBuffs,
  onToggleSound,
  onResetGame,
  onGoldenCookieClick,
  goldenCookies,
  activeSkillUnlocked,
  activeSkillCooldown,
  activeSkillTimeLeft,
  onActivateSkill,
}: MainCookieViewProps) {
  const [newsIndex, setNewsIndex] = useState(0);
  const [cookieWobble, setCookieWobble] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Change news ticker item every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % NEWS_TICKER_ITEMS.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // Handle big cookie click
  const handleCookieTouch = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Get coords relative to viewport
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // fallback to center if container is not available
    let localX = window.innerWidth / 2;
    let localY = window.innerHeight * 0.4;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      localX = clientX - rect.left;
      localY = clientY - rect.top;
    }

    setCookieWobble(true);
    setTimeout(() => setCookieWobble(false), 120);

    // Call state handler
    onCookieClick(localX, localY);
  };

  return (
    <div 
      id="main-cookie-view-container"
      ref={containerRef} 
      className="relative flex flex-col items-center justify-between h-[calc(100vh-140px)] px-5 py-4 select-none overflow-hidden bg-dot-grid"
    >
      {/* Options Bar */}
      <div id="options-bar" className="w-full flex justify-between items-center z-10 gap-3">
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          className="w-10 h-10 bg-[#16161a] hover:bg-[#1f1f26] text-white border border-white/10 rounded-md transition shadow-md flex items-center justify-center cursor-pointer"
          title={soundEnabled ? "Mutar Som" : "Ativar Som"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* Dynamic header quotes */}
        <div id="ticker-box" className="flex-1 bg-[#16161a] border border-white/10 px-4 py-1.5 rounded-md overflow-hidden h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={newsIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] text-white uppercase tracking-wider font-mono text-center truncate max-w-[200px]"
            >
              {NEWS_TICKER_ITEMS[newsIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          id="reset-game-btn"
          onClick={() => {
            if (confirm("Deseja realmente resetar todo o seu progresso? Seus cookies e conquistas serão apagados!")) {
              onResetGame();
            }
          }}
          className="w-10 h-10 bg-[#16161a] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-white/10 rounded-md transition shadow-md flex items-center justify-center cursor-pointer"
          title="Resetar Jogo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Buff Display */}
      {activeBuffs.length > 0 && (
        <div id="active-buffs-list" className="absolute top-18 left-0 right-0 flex flex-col items-center gap-2 z-20 px-6">
          {activeBuffs.map((buff) => (
            <motion.div
              id={`buff-${buff.id}`}
              key={buff.id}
              initial={{ scale: 0.9, opacity: 0, y: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -5 }}
              className={`flex items-center justify-between w-full max-w-[280px] px-3.5 py-2 rounded-md border text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                buff.type === 'clickFrenzy'
                  ? 'bg-[#1a1212] text-red-400 border-red-500/30'
                  : 'bg-[#1a1712] text-orange-400 border-orange-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{buff.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-14 bg-black/40 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${buff.type === 'clickFrenzy' ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${(buff.timeLeft / buff.maxDuration) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] w-5 text-right">{Math.ceil(buff.timeLeft)}s</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cookie Display Counts */}
      <div id="cookies-counter-panel" className="flex flex-col items-center mt-3 z-10 w-full">
        <div className="bg-[#16161a] border border-white/10 px-6 py-4 rounded-lg w-full text-center flex flex-col items-center shadow-lg relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-orange-600 border border-orange-500 text-[8px] font-black tracking-widest text-white uppercase rounded">
            Saldo Atual
          </div>
          <h2 id="total-cookies-display" className="text-4xl font-extrabold text-white tracking-tight text-center flex items-center gap-1.5 select-none font-mono mt-1">
            {formatCookies(cookies)}
            <span className="text-xl">🍪</span>
          </h2>
          <div className="w-full h-[1px] bg-white/5 my-2.5" />
          <div className="flex justify-between items-center w-full text-xs text-white/50 px-2">
            <span className="uppercase tracking-widest text-[9px]">Por Segundo:</span>
            <span id="cps-display" className="font-mono font-bold text-orange-400">
              {formatCookies(cps)}
            </span>
          </div>
          <div className="flex justify-between items-center w-full text-xs text-white/50 px-2 mt-1">
            <span className="uppercase tracking-widest text-[9px]">Poder do Clique:</span>
            <span id="clickpower-display" className="font-mono font-bold text-white/80">
              +{formatCookies(clickPower)}
            </span>
          </div>
        </div>
      </div>

      {/* Cookie Button Stage */}
      <div id="cookie-stage" className="relative flex items-center justify-center my-auto min-h-[220px]">
        {/* Soft geometric glowing ring and grid coordinates decoration */}
        <div id="glow-ring-1" className="absolute w-52 h-52 border border-white/5 rounded-full animate-spin-slow" />
        <div id="glow-ring-2" className="absolute w-60 h-60 border border-dashed border-orange-500/10 rounded-full" />
        <div id="glow-ring-3" className="absolute w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />

        {/* The Big Giant Cookie! */}
        <motion.button
          id="giant-cookie-btn"
          onMouseDown={handleCookieTouch}
          onTouchStart={handleCookieTouch}
          animate={{
            scale: cookieWobble ? 0.94 : 1.0,
            rotate: cookieWobble ? (Math.random() > 0.5 ? 3 : -3) : 0,
          }}
          transition={{ duration: 0.1, type: 'spring', stiffness: 500, damping: 15 }}
          className="relative focus:outline-none cursor-pointer z-10 group active:scale-95"
          aria-label="Clique no biscoito"
        >
          {/* Beautiful styled Cookie using SVG elements */}
          <svg
            className="w-48 h-48 filter drop-shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:drop-shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main base of the cookie */}
            <circle cx="50" cy="50" r="45" fill="#ca8a04" /> {/* amber-600 */}
            <circle cx="50" cy="50" r="44" fill="#d97706" /> {/* amber-500 */}
            <circle cx="48" cy="48" r="43" fill="#eab308" opacity="0.15" /> {/* highlight */}
            <circle cx="52" cy="52" r="43" fill="#92400e" opacity="0.15" /> {/* shadow */}

            {/* Cookie texture/wrinkles */}
            <path d="M 12,50 Q 30,55 50,52 Q 70,48 88,50" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
            <path d="M 50,12 Q 52,30 48,50 Q 55,70 50,88" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
            <path d="M 20,25 Q 40,30 80,25" stroke="#b45309" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
            <path d="M 22,75 Q 50,70 78,78" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.3" />

            {/* Chocolate Chips! */}
            {/* Chip 1 */}
            <circle cx="32" cy="30" r="5" fill="#451a03" />
            <circle cx="31" cy="29" r="4" fill="#3b0764" opacity="0.2" /> {/* shade */}
            <circle cx="33" cy="31" r="1.5" fill="#78350f" /> {/* highlight */}

            {/* Chip 2 */}
            <circle cx="68" cy="32" r="6" fill="#451a03" />
            <circle cx="69" cy="33" r="1.5" fill="#78350f" />

            {/* Chip 3 */}
            <circle cx="50" cy="46" r="6.5" fill="#451a03" />
            <circle cx="51" cy="47" r="1.5" fill="#78350f" />

            {/* Chip 4 */}
            <circle cx="30" cy="62" r="5.5" fill="#451a03" />
            <circle cx="31" cy="63" r="1.5" fill="#78350f" />

            {/* Chip 5 */}
            <circle cx="65" cy="60" r="5" fill="#451a03" />
            <circle cx="66" cy="61" r="1.2" fill="#78350f" />

            {/* Chip 6 */}
            <circle cx="48" cy="74" r="5.2" fill="#451a03" />
            <circle cx="49" cy="75" r="1.2" fill="#78350f" />

            {/* Smaller Chips */}
            <circle cx="21" cy="45" r="3.2" fill="#451a03" />
            <circle cx="78" cy="48" r="3" fill="#451a03" />
            <circle cx="52" cy="24" r="3.5" fill="#451a03" />
            <circle cx="40" cy="18" r="2" fill="#451a03" />
            <circle cx="60" cy="76" r="2.5" fill="#451a03" />
          </svg>

          {/* Interactive particles or rays inside cookie */}
          <span className="absolute -inset-2 bg-orange-500/5 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />
        </motion.button>

        {/* Floating Numbers overlay on click coordinates */}
        <AnimatePresence>
          {floatingTexts.map((fText) => (
            <motion.div
              id={`floating-text-${fText.id}`}
              key={fText.id}
              initial={{ opacity: 1, scale: 0.8, y: fText.y, x: fText.x }}
              animate={{ opacity: 0, scale: 1.3, y: fText.y - 120, x: fText.x + (Math.random() * 40 - 20) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute pointer-events-none text-2xl font-black text-orange-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 font-mono"
            >
              {fText.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Golden Cookie Spawner */}
        <AnimatePresence>
          {goldenCookies.map((gCookie) => (
            <motion.button
              id={`golden-cookie-${gCookie.id}`}
              key={gCookie.id}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: [1, 1.15, 1], 
                opacity: 1, 
                rotate: 0,
                x: [0, 5, -5, 0],
                y: [0, -5, 5, 0]
              }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{
                scale: { duration: 0.4 },
                opacity: { duration: 0.4 },
                rotate: { duration: 0.4 },
                x: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
              }}
              onClick={() => onGoldenCookieClick(gCookie.id)}
              className="absolute p-2 bg-[#1a1a20] border border-orange-500/50 rounded-md cursor-pointer z-40 filter drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] focus:outline-none"
              style={{
                left: `${gCookie.x}%`,
                top: `${gCookie.y}%`,
              }}
            >
              {/* Beautiful mini cookie golden icon */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Sun className="w-8 h-8 text-orange-500 animate-spin absolute" style={{ animationDuration: '8s' }} />
                <span className="text-xl z-10 animate-bounce">🍪</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Active Skill "Surto Cósmico" Button */}
        {activeSkillUnlocked && (
          <motion.button
            id="active-skill-surge-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={activeSkillCooldown > 0}
            onClick={onActivateSkill}
            className={`absolute bottom-2 right-2 w-12 h-12 rounded-full flex flex-col items-center justify-center border z-20 shadow-2xl focus:outline-none cursor-pointer select-none overflow-hidden ${
              activeSkillTimeLeft > 0
                ? 'bg-orange-600 border-white text-white animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                : activeSkillCooldown > 0
                ? 'bg-black/40 border-white/10 text-white/20'
                : 'bg-[#1a1a20] border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            }`}
          >
            {activeSkillTimeLeft > 0 ? (
              <>
                <Zap className="w-4 h-4 animate-bounce" />
                <span className="text-[7px] font-mono font-black">{Math.ceil(activeSkillTimeLeft)}s</span>
              </>
            ) : activeSkillCooldown > 0 ? (
              <>
                <Lock className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[7px] font-mono font-bold mt-0.5">{Math.ceil(activeSkillCooldown)}s</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="text-[6px] font-black uppercase tracking-widest mt-0.5 text-center leading-none">SURTO</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Helpful Instructions indicator */}
      <div id="gameplay-hint-box" className="w-full flex justify-center pb-2 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-md border border-white/10 text-[9px] text-white/40 font-medium uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span>Toque para Cozinhar</span>
        </div>
      </div>
    </div>
  );
}
