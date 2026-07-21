import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cookie, ShoppingBag, Award, Zap, Sparkles, Volume2, VolumeX, RefreshCw, Star, Gamepad2 
} from 'lucide-react';

import { 
  Building, Upgrade, Achievement, GameState, ActiveBuff, FloatingText, GoldenCookie, GardenPlant 
} from './types';

import { 
  INITIAL_BUILDINGS, INITIAL_UPGRADES, INITIAL_ACHIEVEMENTS, INITIAL_SKILLS, 
  DEFAULT_GAME_STATE, formatCookies, formatTime 
} from './utils/gameData';

import { 
  toggleSound, isSoundEnabled, playClickSound, playCrunchSound, 
  playUpgradeSound, playGoldenCookieSound, playAscensionSound 
} from './utils/audio';

import MainCookieView from './components/MainCookieView';
import ShopView from './components/ShopView';
import StatsView from './components/StatsView';
import PrestigeView from './components/PrestigeView';
import SkillsView from './components/SkillsView';
import MinigamesView from './components/MinigamesView';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [activeTab, setActiveTab] = useState<'cookie' | 'shop' | 'stats' | 'prestige' | 'skills' | 'minigames'>('cookie');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [goldenCookies, setGoldenCookies] = useState<GoldenCookie[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);

  // Load game state on mount
  useEffect(() => {
    const saved = localStorage.getItem('cookie_clicker_mobile_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure playTime is loaded, backward compatibility
        setGameState({
          ...DEFAULT_GAME_STATE,
          ...parsed,
          lastSaved: Date.now()
        });
      } catch (e) {
        console.error("Erro ao carregar o estado salvo", e);
      }
    }
    
    // Check local sound setting
    const savedSound = localStorage.getItem('cookie_clicker_sound_enabled');
    if (savedSound !== null) {
      const isEnabled = savedSound === 'true';
      setSoundEnabled(isEnabled);
      toggleSound(isEnabled);
    }
  }, []);

  // Audio state synchronizer
  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    toggleSound(newVal);
    localStorage.setItem('cookie_clicker_sound_enabled', String(newVal));
  };

  // Compute stats based on upgrades and prestige
  const currentBuildings: Building[] = INITIAL_BUILDINGS.map(b => {
    const count = gameState.buildings[b.id] || 0;
    
    // Find building multipliers (upgrades bought)
    const bUpgrades = INITIAL_UPGRADES.filter(u => 
      gameState.purchasedUpgrades.includes(u.id) && 
      u.effectType === 'buildingMultiplier' && 
      u.effectTarget === b.id
    );
    
    let multiplier = 1;
    bUpgrades.forEach(u => multiplier *= u.multiplier);

    // Skill Tree Grandma production double
    if (b.id === 'grandma' && gameState.unlockedSkills?.includes('skill_grandma_wisdom')) {
      multiplier *= 2;
    }
    
    const actualCps = b.baseCps * multiplier;
    
    // Base cost
    let currentCost = Math.ceil(b.baseCost * Math.pow(b.costMultiplier, count));

    // Skill Tree building cost reduction: skill_efficiency_1 (-5%), skill_efficiency_2 (-10%)
    let costReduction = 0;
    if (gameState.unlockedSkills?.includes('skill_efficiency_1')) {
      costReduction += 0.05;
    }
    if (gameState.unlockedSkills?.includes('skill_efficiency_2')) {
      costReduction += 0.10;
    }
    if (costReduction > 0) {
      currentCost = Math.ceil(currentCost * (1 - costReduction));
    }
    
    return {
      ...b,
      count,
      baseCps: actualCps,
      currentCost,
    };
  });

  // Calculate global multipliers
  let globalMultiplier = 1;
  const globalUpgrades = INITIAL_UPGRADES.filter(u => 
    gameState.purchasedUpgrades.includes(u.id) && 
    u.effectType === 'globalMultiplier'
  );
  globalUpgrades.forEach(u => globalMultiplier *= u.multiplier);
  
  // Add prestige level bonus: +1% per level
  globalMultiplier += gameState.prestigeLevel * 0.01;

  // Skill Tree global CPS multipliers: skill_cps_1 (+12%), skill_frenzy_boost (+10%)
  if (gameState.unlockedSkills?.includes('skill_cps_1')) {
    globalMultiplier += 0.12;
  }
  if (gameState.unlockedSkills?.includes('skill_frenzy_boost')) {
    globalMultiplier += 0.10;
  }

  // Garden active plant multipliers (Starseed: +15% CPS while alive)
  let gardenCpsBonus = 0;
  if (gameState.gardenPlots) {
    gameState.gardenPlots.forEach(plot => {
      if (plot.plant && plot.plant.type === 'starseed') {
        gardenCpsBonus += 0.15;
      }
    });
  }
  globalMultiplier += gardenCpsBonus;

  // Calculate Base CPS (before buffs)
  let baseCps = 0;
  currentBuildings.forEach(b => {
    baseCps += b.baseCps * b.count;
  });
  baseCps *= globalMultiplier;

  // Calculate final CPS (applying active buffs like frenzy)
  let finalCps = baseCps;
  const frenzyBuff = activeBuffs.find(b => b.type === 'frenzy');
  if (frenzyBuff) {
    finalCps *= frenzyBuff.multiplier;
  }

  // Active Skill "Surto Cósmico": CPS +400% (so multiplied by 5)
  if (gameState.activeSkillTimeLeft > 0) {
    finalCps *= 5;
  }

  // Calculate Click Power
  let clickAdd = 0;
  if (gameState.purchasedUpgrades.includes('up_click_1')) clickAdd += 1;
  let clickMult = 1;
  if (gameState.purchasedUpgrades.includes('up_click_2')) clickMult *= 2;

  // Skill Tree Click Power multipliers: skill_click_1 (+15%), skill_click_2 (+30%)
  let skillClickMultiplier = 1;
  if (gameState.unlockedSkills?.includes('skill_click_1')) {
    skillClickMultiplier += 0.15;
  }
  if (gameState.unlockedSkills?.includes('skill_click_2')) {
    skillClickMultiplier += 0.30;
  }
  
  let finalClickPower = (1 + clickAdd) * clickMult * skillClickMultiplier;
  
  // Apply click frenzy if active
  const clickFrenzyBuff = activeBuffs.find(b => b.type === 'clickFrenzy');
  if (clickFrenzyBuff) {
    finalClickPower *= clickFrenzyBuff.multiplier;
  }

  // Get current upgrades list with their dynamic unlock state
  const currentUpgrades: Upgrade[] = INITIAL_UPGRADES.map(u => {
    const purchased = gameState.purchasedUpgrades.includes(u.id);
    let unlocked = u.unlocked; // default
    
    // Custom unlock rules if not unlocked already
    if (!unlocked) {
      if (u.effectType === 'buildingMultiplier' && u.effectTarget) {
        // Unlock when player owns at least 1 of the target building
        const bCount = gameState.buildings[u.effectTarget] || 0;
        unlocked = bCount >= 1;
      } else if (u.id === 'up_click_2') {
        // Unlock Titanium Clicks after 50 clicks
        unlocked = gameState.clicks >= 50;
      } else if (u.id === 'up_global_2') {
        // Unlock Cosmic Sugar after baking 100k cookies
        unlocked = gameState.totalCookiesBaked >= 100000;
      }
    }

    return {
      ...u,
      purchased,
      unlocked,
    };
  });

  // Current achievements list
  const currentAchievements: Achievement[] = INITIAL_ACHIEVEMENTS.map(a => {
    const unlocked = gameState.unlockedAchievements.includes(a.id);
    return {
      ...a,
      unlocked,
    };
  });

  // Helper: Trigger saving to LocalStorage
  const saveGameState = (updatedState: GameState) => {
    const stateToSave = {
      ...updatedState,
      lastSaved: Date.now()
    };
    localStorage.setItem('cookie_clicker_mobile_state', JSON.stringify(stateToSave));
  };

  // Helper: Check and trigger achievements
  const runAchievementChecking = (stateToCheck: GameState) => {
    const newlyUnlocked: string[] = [];
    INITIAL_ACHIEVEMENTS.forEach(ach => {
      if (stateToCheck.unlockedAchievements.includes(ach.id)) return;

      let conditionMet = false;
      if (ach.conditionType === 'clicks') {
        conditionMet = stateToCheck.clicks >= ach.conditionValue;
      } else if (ach.conditionType === 'totalCookies') {
        conditionMet = stateToCheck.totalCookiesBaked >= ach.conditionValue;
      } else if (ach.conditionType === 'goldenCookies') {
        conditionMet = stateToCheck.goldenCookieClicks >= ach.conditionValue;
      } else if (ach.conditionType === 'buildingCount' && ach.conditionTarget) {
        const bCount = stateToCheck.buildings[ach.conditionTarget] || 0;
        conditionMet = bCount >= ach.conditionValue;
      }

      if (conditionMet) {
        newlyUnlocked.push(ach.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      // Find the first achievement to show as Toast
      const firstId = newlyUnlocked[0];
      const achObj = INITIAL_ACHIEVEMENTS.find(a => a.id === firstId);
      if (achObj) {
        setRecentAchievement(achObj);
        playGoldenCookieSound(); // satisfying sound
        setTimeout(() => setRecentAchievement(null), 4000);
      }

      setGameState(prev => {
        const updated = {
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked]
        };
        saveGameState(updated);
        return updated;
      });
    }
  };

  // 1. Core game tick loop running every 100ms
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // 1. Add fractional cookies from CPS
      const cpsTick = finalCps / 10;
      
      setGameState((prev) => {
        const nextCooldown = Math.max(0, (prev.activeSkillCooldown || 0) - 0.1);
        const nextTimeLeft = Math.max(0, (prev.activeSkillTimeLeft || 0) - 0.1);

        const newCookies = prev.cookies + cpsTick;
        const newBaked = prev.totalCookiesBaked + cpsTick;

        // Minigames properties regeneration/initialization
        const maxMana = prev.wizardMaxMana !== undefined ? prev.wizardMaxMana : 100;
        const currentMana = prev.wizardMana !== undefined ? prev.wizardMana : 100;
        const nextMana = Math.min(maxMana, currentMana + 0.05);

        const currentPlots = prev.gardenPlots !== undefined ? prev.gardenPlots : DEFAULT_GAME_STATE.gardenPlots;
        
        return {
          ...prev,
          cookies: newCookies,
          totalCookiesBaked: newBaked,
          activeSkillCooldown: nextCooldown,
          activeSkillTimeLeft: nextTimeLeft,
          wizardMana: nextMana,
          wizardMaxMana: maxMana,
          gardenPlots: currentPlots,
        };
      });

      // 2. Tick down active buff durations
      setActiveBuffs((prevBuffs) => {
        if (prevBuffs.length === 0) return prevBuffs;
        return prevBuffs
          .map((b) => ({ ...b, timeLeft: b.timeLeft - 0.1 }))
          .filter((b) => b.timeLeft > 0);
      });

    }, 100);

    return () => clearInterval(tickInterval);
  }, [finalCps]);

  // 2. Playtime and Auto-save clock running every 1s
  useEffect(() => {
    const playClock = setInterval(() => {
      setGameState((prev) => {
        const updated = {
          ...prev,
          playTime: prev.playTime + 1,
        };

        // Auto save every 10 seconds
        if (updated.playTime % 10 === 0) {
          saveGameState(updated);
        }

        // Run achievements check every second based on current stats
        runAchievementChecking(updated);

        return updated;
      });

      // Chance to spawn golden cookies (0.5% chance per second, boosted by skill)
      let spawnChance = 0.005;
      if (gameState.unlockedSkills?.includes('skill_golden_1')) {
        spawnChance *= 1.35;
      }

      if (Math.random() < spawnChance && goldenCookies.length === 0) {
        const id = Math.random().toString(36).substring(2, 9);
        const types: ('frenzy' | 'lucky' | 'clickFrenzy')[] = ['frenzy', 'lucky', 'clickFrenzy'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // random coordinate percentages (keep safe padding for mobile click targets)
        const x = Math.floor(Math.random() * 60) + 15; // 15% to 75%
        const y = Math.floor(Math.random() * 50) + 25; // 25% to 75%
        
        let duration = 15;
        if (gameState.unlockedSkills?.includes('skill_golden_1')) {
          duration *= 1.35;
        }

        const newGoldenCookie: GoldenCookie = {
          id,
          type,
          duration,
          x,
          y,
          spawnTime: Date.now()
        };

        setGoldenCookies([newGoldenCookie]);
        playGoldenCookieSound(); // Play magical chime!
      }

      // Decrement golden cookie lifetimes on screen
      setGoldenCookies((prev) => 
        prev.filter((gc) => {
          const age = (Date.now() - gc.spawnTime) / 1000;
          return age < gc.duration;
        })
      );

    }, 1000);

    return () => clearInterval(playClock);
  }, [goldenCookies.length, gameState.unlockedSkills]);

  // Handle manual Big Cookie clicks
  const handleCookieClick = (clientX: number, clientY: number) => {
    // Determine click power
    const power = finalClickPower;
    
    // Play sound
    playClickSound();

    // Check if next click hits the 150-click star milestone
    const starReward = (gameState.clicks + 1) % 150 === 0;

    // Spawn floating text
    const textId = Math.random().toString(36).substring(2, 9);
    const textStr = starReward ? `+${formatCookies(power)} (+1★)` : `+${formatCookies(power)}`;
    const newFText: FloatingText = {
      id: textId,
      text: textStr,
      x: clientX,
      y: clientY,
    };

    setFloatingTexts((prev) => [...prev, newFText]);
    // Clean up floating text after 800ms
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== textId));
    }, 800);

    // Update state
    setGameState((prev) => {
      const updated = {
        ...prev,
        cookies: prev.cookies + power,
        totalCookiesBaked: prev.totalCookiesBaked + power,
        clicks: prev.clicks + 1,
        cosmicStars: prev.cosmicStars + (starReward ? 1 : 0),
      };
      
      // Run quick milestone checking
      runAchievementChecking(updated);
      return updated;
    });
  };

  // Handle Golden Cookie tap
  const handleGoldenCookieClick = (id: string) => {
    const gc = goldenCookies.find(c => c.id === id);
    if (!gc) return;

    // Play golden chime and a crunchy pop
    playGoldenCookieSound();
    playCrunchSound();

    // Remove from screen immediately
    setGoldenCookies(prev => prev.filter(c => c.id !== id));

    let buffName = "";
    let message = "";

    // Golden Cookie duration bonuses: skill_golden_1 (+35%)
    let durationMultiplier = 1;
    if (gameState.unlockedSkills?.includes('skill_golden_1')) {
      durationMultiplier = 1.35;
    }

    // Calculate effect
    if (gc.type === 'frenzy') {
      buffName = "Fúria do Cookie";
      let baseTime = 77;
      if (gameState.unlockedSkills?.includes('skill_frenzy_boost')) {
        baseTime += 5;
      }
      const finalTime = baseTime * durationMultiplier;

      const newBuff: ActiveBuff = {
        id: Math.random().toString(36).substring(2, 9),
        name: "Frenzy: x7 Produção!",
        type: 'frenzy',
        multiplier: 7,
        timeLeft: finalTime,
        maxDuration: finalTime,
      };
      setActiveBuffs(prev => [...prev.filter(b => b.type !== 'frenzy'), newBuff]);
      message = `Cookie Dourado! Multiplicador de CPS x7 por ${Math.round(finalTime)} segundos!`;
    } else if (gc.type === 'clickFrenzy') {
      buffName = "Frenzíaco de Cliques";
      let baseTime = 12;
      if (gameState.unlockedSkills?.includes('skill_frenzy_boost')) {
        baseTime += 5;
      }
      const finalTime = baseTime * durationMultiplier;

      const newBuff: ActiveBuff = {
        id: Math.random().toString(36).substring(2, 9),
        name: "Clikes: x77 Força!",
        type: 'clickFrenzy',
        multiplier: 77,
        timeLeft: finalTime,
        maxDuration: finalTime,
      };
      setActiveBuffs(prev => [...prev.filter(b => b.type !== 'clickFrenzy'), newBuff]);
      message = `BÔNUS ABSURDO! Cliques manuais x77 mais fortes por ${Math.round(finalTime)} segundos!`;
    } else {
      // 'lucky' instant windfalls: 15 minutes of CPS or 15% of bank
      const fifteenMinsCps = finalCps * 900;
      const bankCapped = gameState.cookies * 0.15;
      const amountGained = Math.max(15, Math.min(fifteenMinsCps, bankCapped));
      
      setGameState(prev => ({
        ...prev,
        cookies: prev.cookies + amountGained,
        totalCookiesBaked: prev.totalCookiesBaked + amountGained,
      }));
      message = `Sorte Celestial! Você ganhou +${formatCookies(amountGained)} cookies instantaneamente!`;
    }

    // Increment click counter, add +2 Cosmic Stars, and save
    setGameState(prev => {
      const updated = {
        ...prev,
        goldenCookieClicks: prev.goldenCookieClicks + 1,
        cosmicStars: (prev.cosmicStars || 0) + 2,
      };
      runAchievementChecking(updated);
      saveGameState(updated);
      return updated;
    });

    // Display a beautiful on-screen floating status message
    const floatId = Math.random().toString(36).substring(2, 9);
    const newFloat: FloatingText = {
      id: floatId,
      text: gc.type === 'lucky' ? "🍀 Sorte! (+2★)" : "✨ Bônus! (+2★)",
      x: window.innerWidth / 2 - 40,
      y: window.innerHeight / 2 - 80,
    };
    setFloatingTexts((prev) => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== floatId));
    }, 1500);

    alert(message); // standard fallback for easy mobile attention, or simply show notification
  };

  // Buy Structure from catalog
  const handleBuyBuilding = (buildingId: string, qty: number) => {
    const building = currentBuildings.find(b => b.id === buildingId);
    if (!building) return;

    // Compounding cost formula for buying multiple units
    let totalCost = 0;
    let tempCost = building.currentCost;
    for (let i = 0; i < qty; i++) {
      totalCost += tempCost;
      tempCost = Math.ceil(tempCost * building.costMultiplier);
    }

    if (gameState.cookies < totalCost) return;

    playCrunchSound(); // satisfying feedback!

    setGameState((prev) => {
      const currentCount = prev.buildings[buildingId] || 0;
      const updated = {
        ...prev,
        cookies: prev.cookies - totalCost,
        cookiesSpent: prev.cookiesSpent + totalCost,
        buildings: {
          ...prev.buildings,
          [buildingId]: currentCount + qty,
        },
      };
      
      runAchievementChecking(updated);
      saveGameState(updated);
      return updated;
    });
  };

  // Buy Upgrade
  const handleBuyUpgrade = (upgradeId: string) => {
    const upgrade = currentUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.cookies < upgrade.cost || upgrade.purchased) return;

    playUpgradeSound(); // glorious upgrade sound!

    setGameState((prev) => {
      const updated = {
        ...prev,
        cookies: prev.cookies - upgrade.cost,
        cookiesSpent: prev.cookiesSpent + upgrade.cost,
        purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
      };
      
      runAchievementChecking(updated);
      saveGameState(updated);
      return updated;
    });
  };

  // Unlock a Skill from the Tree
  const handleUnlockSkill = (skillId: string) => {
    const skill = INITIAL_SKILLS.find(s => s.id === skillId);
    if (!skill || gameState.unlockedSkills.includes(skillId)) return;
    if (gameState.cosmicStars < skill.cost) return;

    // Verify prerequisites
    const met = !skill.dependsOn || skill.dependsOn.every(id => gameState.unlockedSkills.includes(id));
    if (!met) return;

    // Glorious feedback!
    playUpgradeSound();

    setGameState((prev) => {
      const updated = {
        ...prev,
        cosmicStars: prev.cosmicStars - skill.cost,
        unlockedSkills: [...prev.unlockedSkills, skillId],
      };
      saveGameState(updated);
      return updated;
    });

    // Notify player
    const textId = Math.random().toString(36).substring(2, 9);
    const newFText: FloatingText = {
      id: textId,
      text: `🔓 Ativou: ${skill.name}!`,
      x: window.innerWidth / 2 - 80,
      y: window.innerHeight * 0.35,
    };
    setFloatingTexts(prev => [...prev, newFText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 2500);
  };

  // Trade Cookies for Cosmic Star Point
  const handleExchangeCookiesForStar = () => {
    const cost = 25000 * (1 + gameState.cosmicStarsExchanged);
    if (gameState.cookies < cost) return;

    playCrunchSound();

    setGameState((prev) => {
      const updated = {
        ...prev,
        cookies: prev.cookies - cost,
        cookiesSpent: prev.cookiesSpent + cost,
        cosmicStars: (prev.cosmicStars || 0) + 1,
        cosmicStarsExchanged: (prev.cosmicStarsExchanged || 0) + 1,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Activate the "Surto Cósmico" Action Ability
  const handleActivateSkill = () => {
    if (!gameState.unlockedSkills.includes('skill_active_surge')) return;
    if (gameState.activeSkillCooldown > 0) return;

    playUpgradeSound();

    setGameState((prev) => {
      const updated = {
        ...prev,
        activeSkillTimeLeft: 15,
        activeSkillCooldown: 90,
      };
      saveGameState(updated);
      return updated;
    });

    // Notify
    const textId = Math.random().toString(36).substring(2, 9);
    const newFText: FloatingText = {
      id: textId,
      text: "🔥 SURTO CÓSMICO ATIVO! x5 CPS! 🔥",
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight * 0.35,
    };
    setFloatingTexts(prev => [...prev, newFText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 2500);
  };

  // 1. Cast Spell (Wizard Tower)
  const handleCastSpell = (spellId: string) => {
    let cost = 0;
    if (spellId === 'conjure_cookie') cost = 30;
    else if (spellId === 'feverish_spark') cost = 50;
    else if (spellId === 'oven_alchemy') cost = 70;

    if (gameState.wizardMana < cost) return;

    let textStr = "";
    let actualReward = 0;

    // Apply effects
    if (spellId === 'conjure_cookie') {
      const id = Math.random().toString(36).substring(2, 9);
      const types: ('frenzy' | 'lucky' | 'clickFrenzy')[] = ['frenzy', 'lucky', 'clickFrenzy'];
      const type = types[Math.floor(Math.random() * types.length)];
      const x = Math.floor(Math.random() * 60) + 15;
      const y = Math.floor(Math.random() * 50) + 25;
      let duration = 15;
      if (gameState.unlockedSkills?.includes('skill_golden_1')) {
        duration *= 1.35;
      }
      const newGoldenCookie: GoldenCookie = { id, type, duration, x, y, spawnTime: Date.now() };
      setGoldenCookies(prev => [...prev, newGoldenCookie]);
      textStr = "✨ Cookie Dourado Conjurado! ✨";
      playGoldenCookieSound();
    } else if (spellId === 'feverish_spark') {
      const newBuff: ActiveBuff = {
        id: Math.random().toString(36).substring(2, 9),
        name: "Frenzy: x7 Produção!",
        type: 'frenzy',
        multiplier: 7,
        timeLeft: 30,
        maxDuration: 30,
      };
      setActiveBuffs(prev => [...prev.filter(b => b.type !== 'frenzy'), newBuff]);
      textStr = "🔥 Frenesi Conjurado (30s)! 🔥";
      playGoldenCookieSound();
    } else if (spellId === 'oven_alchemy') {
      const fiveMinsCps = finalCps * 300;
      const reward = Math.min(gameState.totalCookiesBaked * 0.3, fiveMinsCps);
      actualReward = Math.max(10, Math.floor(reward));
      textStr = `🪙 Alquimia: +${formatCookies(actualReward)}!`;
      playCrunchSound();
    }

    setGameState((prev) => {
      const updated = {
        ...prev,
        wizardMana: Math.max(0, prev.wizardMana - cost),
        cookies: prev.cookies + (spellId === 'oven_alchemy' ? actualReward : 0),
        totalCookiesBaked: prev.totalCookiesBaked + (spellId === 'oven_alchemy' ? actualReward : 0),
      };
      saveGameState(updated);
      return updated;
    });

    // Notification floating text
    const floatTextId = Math.random().toString(36).substring(2, 9);
    const newFloatText: FloatingText = {
      id: floatTextId,
      text: textStr,
      x: window.innerWidth / 2 - 80,
      y: window.innerHeight * 0.35,
    };
    setFloatingTexts(prev => [...prev, newFloatText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== floatTextId));
    }, 2500);
  };

  // 2. Plant Seed (Cosmic Garden)
  const handlePlantSeed = (plotId: number, plantType: 'chocoflour' | 'starseed' | 'sugarspike') => {
    const seedCosts = { chocoflour: 2000, sugarspike: 5000, starseed: 15000 };
    const cost = seedCosts[plantType];
    if (gameState.cookies < cost) return;

    const plantNames = {
      chocoflour: 'Trigo de Biscoito',
      sugarspike: 'Espinho de Açúcar',
      starseed: 'Semente Estelar',
    };

    const newPlant: GardenPlant = {
      id: Math.random().toString(36).substring(2, 9),
      name: plantNames[plantType],
      type: plantType,
      plantedAt: Date.now(),
      growTime: plantType === 'chocoflour' ? 60 : plantType === 'sugarspike' ? 180 : 300,
    };

    playUpgradeSound();

    setGameState((prev) => {
      const updatedPlots = prev.gardenPlots.map(plot => {
        if (plot.id === plotId) {
          return { ...plot, plant: newPlant };
        }
        return plot;
      });

      const updated = {
        ...prev,
        cookies: prev.cookies - cost,
        cookiesSpent: prev.cookiesSpent + cost,
        gardenPlots: updatedPlots,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // 3. Harvest Plant (Cosmic Garden)
  const handleHarvestPlant = (plotId: number) => {
    const plot = gameState.gardenPlots.find(p => p.id === plotId);
    if (!plot || !plot.plant) return;

    // Verify progress
    const elapsedSeconds = (Date.now() - plot.plant.plantedAt) / 1000;
    if (elapsedSeconds < plot.plant.growTime) return; // not mature yet

    let cookieReward = 0;
    let starReward = 0;

    if (plot.plant.type === 'chocoflour') {
      cookieReward = 10000;
    } else if (plot.plant.type === 'sugarspike') {
      starReward = 5;
    } else if (plot.plant.type === 'starseed') {
      cookieReward = 50000;
      starReward = 2;
    }

    playCrunchSound();
    playGoldenCookieSound();

    setGameState((prev) => {
      const updatedPlots = prev.gardenPlots.map(p => {
        if (p.id === plotId) {
          return { ...p, plant: null };
        }
        return p;
      });

      const updated = {
        ...prev,
        cookies: prev.cookies + cookieReward,
        totalCookiesBaked: prev.totalCookiesBaked + cookieReward,
        cosmicStars: (prev.cosmicStars || 0) + starReward,
        gardenPlots: updatedPlots,
      };
      saveGameState(updated);
      return updated;
    });

    // Notify
    const rewardMsg = cookieReward > 0 && starReward > 0
      ? `Colhido! +${formatCookies(cookieReward)} 🍪 e +${starReward}★`
      : cookieReward > 0
      ? `Colhido! +${formatCookies(cookieReward)} 🍪`
      : `Colhido! +${starReward}★ Estrelas`;

    const floatTextId = Math.random().toString(36).substring(2, 9);
    const newFloatText: FloatingText = {
      id: floatTextId,
      text: rewardMsg,
      x: window.innerWidth / 2 - 80,
      y: window.innerHeight * 0.35,
    };
    setFloatingTexts(prev => [...prev, newFloatText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== floatTextId));
    }, 2500);
  };

  // 4. Unlock Garden Plot
  const handleUnlockPlot = (plotId: number) => {
    const unlockCosts: { [key: number]: number } = {
      2: 10000, 5: 25000, 6: 50000, 7: 100000, 8: 250000
    };
    const cost = unlockCosts[plotId] || 0;
    if (gameState.cookies < cost) return;

    playUpgradeSound();

    setGameState((prev) => {
      const updatedPlots = prev.gardenPlots.map(plot => {
        if (plot.id === plotId) {
          return { ...plot, unlocked: true };
        }
        return plot;
      });

      const updated = {
        ...prev,
        cookies: prev.cookies - cost,
        cookiesSpent: prev.cookiesSpent + cost,
        gardenPlots: updatedPlots,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // 5. Remove / Uproot early (Cosmic Garden)
  const handleRemovePlant = (plotId: number) => {
    playCrunchSound();
    setGameState((prev) => {
      const updatedPlots = prev.gardenPlots.map(plot => {
        if (plot.id === plotId) {
          return { ...plot, plant: null };
        }
        return plot;
      });

      const updated = {
        ...prev,
        gardenPlots: updatedPlots,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Reset progress (entirely fresh start)
  const handleResetGame = () => {
    setGameState(DEFAULT_GAME_STATE);
    setGoldenCookies([]);
    setActiveBuffs([]);
    localStorage.removeItem('cookie_clicker_mobile_state');
  };

  // Ascend (soft prestige reset)
  const handleAscend = () => {
    const currentPrestige = gameState.prestigeLevel;
    const totalAllTimeBaked = gameState.prestigePointsAllTime + gameState.totalCookiesBaked;
    const targetPrestige = Math.floor(Math.sqrt(totalAllTimeBaked / 1000000));
    const chipsGained = Math.max(0, targetPrestige - currentPrestige);

    if (chipsGained === 0) return;

    setGameState((prev) => {
      const newPrestigeLevel = prev.prestigeLevel + chipsGained;
      
      const resetState: GameState = {
        ...DEFAULT_GAME_STATE,
        prestigeLevel: newPrestigeLevel,
        prestigePointsAllTime: totalAllTimeBaked,
        unlockedAchievements: prev.unlockedAchievements, // Keep Achievements!
        playTime: prev.playTime, // Keep playtime!
        goldenCookieClicks: prev.goldenCookieClicks, // Keep golden stats
        clicks: prev.clicks, // Keep overall clicks
        // Preserve skills and cosmic star variables across Prestige Ascensions
        cosmicStars: prev.cosmicStars,
        cosmicStarsExchanged: prev.cosmicStarsExchanged,
        unlockedSkills: prev.unlockedSkills,
      };
      
      saveGameState(resetState);
      return resetState;
    });

    setGoldenCookies([]);
    setActiveBuffs([]);
    setActiveTab('cookie'); // Bring back to cooking!
  };

  return (
    <div id="game-app-shell" className="min-h-screen bg-[#0f0f12] text-[#e0e0e0] flex flex-col font-sans max-w-md mx-auto relative border-x border-white/10 shadow-2xl overflow-hidden">
      
      {/* Top Mobile Bar Header */}
      <header id="phone-app-header" className="sticky top-0 bg-[#16161a]/95 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-1.5 rounded-lg border border-orange-400/20 shadow-lg">
            <Cookie className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Cookie Clicker</h1>
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Geometric Edition</span>
          </div>
        </div>

        {/* Prestige Level badge on Header */}
        {gameState.prestigeLevel > 0 && (
          <div id="prestige-header-badge" className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <span>LVL {gameState.prestigeLevel}</span>
          </div>
        )}
      </header>

      {/* Main Container / Tab Swapping */}
      <main id="phone-main-content" className="flex-1 overflow-hidden">
        {activeTab === 'cookie' && (
          <MainCookieView
            cookies={gameState.cookies}
            cps={finalCps}
            clickPower={finalClickPower}
            soundEnabled={soundEnabled}
            onCookieClick={handleCookieClick}
            floatingTexts={floatingTexts}
            activeBuffs={activeBuffs}
            onToggleSound={handleToggleSound}
            onResetGame={handleResetGame}
            onGoldenCookieClick={handleGoldenCookieClick}
            goldenCookies={goldenCookies}
            activeSkillUnlocked={gameState.unlockedSkills?.includes('skill_active_surge')}
            activeSkillCooldown={gameState.activeSkillCooldown || 0}
            activeSkillTimeLeft={gameState.activeSkillTimeLeft || 0}
            onActivateSkill={handleActivateSkill}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            cookies={gameState.cookies}
            buildings={currentBuildings}
            upgrades={currentUpgrades}
            onBuyBuilding={handleBuyBuilding}
            onBuyUpgrade={handleBuyUpgrade}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsView
            gameState={gameState}
            skills={INITIAL_SKILLS}
            onUnlockSkill={handleUnlockSkill}
            onExchangeCookiesForStar={handleExchangeCookiesForStar}
          />
        )}

        {activeTab === 'minigames' && (
          <MinigamesView
            gameState={gameState}
            onCastSpell={handleCastSpell}
            onPlantSeed={handlePlantSeed}
            onHarvestPlant={handleHarvestPlant}
            onUnlockPlot={handleUnlockPlot}
            onRemovePlant={handleRemovePlant}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            gameState={gameState}
            achievements={currentAchievements}
            cps={finalCps}
            clickPower={finalClickPower}
          />
        )}

        {activeTab === 'prestige' && (
          <PrestigeView
            gameState={gameState}
            onAscend={handleAscend}
          />
        )}
      </main>

      {/* Achievement Unlocked Toast Notification */}
      <AnimatePresence>
        {recentAchievement && (
          <motion.div
            id="achievement-toast-alert"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute bottom-20 left-4 right-4 bg-[#1a1a20] border border-orange-500/50 p-3 rounded-xl flex items-center gap-3.5 z-50 shadow-[0_4px_25px_rgba(249,115,22,0.15)]"
          >
            <div className="w-10 h-10 bg-orange-600/20 border border-orange-500/30 rounded-lg flex items-center justify-center text-orange-400 shadow">
              <Award className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] text-orange-500 uppercase font-black tracking-widest">Conquista Desbloqueada!</span>
              <h4 className="text-xs font-black text-white leading-tight mt-0.5">{recentAchievement.name}</h4>
              <p className="text-[10px] text-white/50 leading-snug mt-0.5">{recentAchievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Sticky Bottom Navigation Bar */}
      <nav id="phone-app-nav-bar" className="sticky bottom-0 bg-[#16161a] border-t border-white/10 px-1 py-1.5 flex justify-around items-center z-30 select-none">
        
        {/* Tab 1: Cookie */}
        <button
          id="nav-tab-cookie"
          onClick={() => setActiveTab('cookie')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'cookie'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Cookie className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Biscoito</span>
        </button>

        {/* Tab 2: Shop */}
        <button
          id="nav-tab-shop"
          onClick={() => setActiveTab('shop')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'shop'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Loja</span>
        </button>

        {/* Tab 3: Skills */}
        <button
          id="nav-tab-skills"
          onClick={() => setActiveTab('skills')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'skills'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Árvore</span>
        </button>

        {/* Tab 4: Minigames */}
        <button
          id="nav-tab-minigames"
          onClick={() => setActiveTab('minigames')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'minigames'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Minijogos</span>
        </button>

        {/* Tab 4: Stats */}
        <button
          id="nav-tab-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Conquistas</span>
        </button>

        {/* Tab 5: Prestige */}
        <button
          id="nav-tab-prestige"
          onClick={() => setActiveTab('prestige')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'prestige'
              ? 'text-white bg-white/10 font-bold border-t-2 border-orange-500 -mt-1.5'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-center leading-none">Legado</span>
        </button>

      </nav>

    </div>
  );
}
