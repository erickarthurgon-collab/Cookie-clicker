export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseCps: number;
  count: number;
  currentCost: number;
  icon: string; // Name of Lucide icon
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  unlocked: boolean; // True when requirements met
  effectType: 'clickPower' | 'buildingMultiplier' | 'globalMultiplier';
  effectTarget?: string; // building ID if target is building
  multiplier: number; // e.g. 2 for double
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  conditionType: 'totalCookies' | 'cookiesInBank' | 'clicks' | 'buildingCount' | 'goldenCookies';
  conditionTarget?: string; // e.g. building ID or undefined
  conditionValue: number;
  icon: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number; // in cosmicStars
  dependsOn?: string[]; // prerequisite skill IDs
  icon: string; // Lucide icon name
  effectType: 'clickPowerBonus' | 'buildingCostReduction' | 'goldenCookieFrequency' | 'cpsMultiplier' | 'activeAbility' | 'grandmaMultiplier';
  effectValue: number; // e.g. 0.15 for +15%
  x: number; // visual grid x percentage (0 - 100)
  y: number; // visual grid y percentage (0 - 100)
}

export interface GardenPlant {
  id: string;
  name: string;
  type: 'chocoflour' | 'starseed' | 'sugarspike';
  plantedAt: number; // timestamp in ms
  growTime: number; // total duration in seconds
}

export interface GardenPlot {
  id: number; // index 0 - 8
  unlocked: boolean;
  plant: GardenPlant | null;
}

export interface GameState {
  cookies: number;
  totalCookiesBaked: number;
  cookiesSpent: number;
  clicks: number;
  goldenCookieClicks: number;
  prestigeLevel: number; // Celestial chips
  heavenlyChipsToClaim: number;
  prestigePointsAllTime: number; // Total cookies ever baked across ascensions
  buildings: { [id: string]: number }; // buildingId -> count
  purchasedUpgrades: string[]; // list of upgradeIds
  unlockedAchievements: string[]; // list of achievementIds
  playTime: number; // in seconds
  lastSaved: number; // timestamp
  
  // Skill Tree integration fields
  cosmicStars: number; // Star shards currency
  cosmicStarsExchanged: number; // total stars bought with cookies
  unlockedSkills: string[]; // list of unlocked skill IDs
  activeSkillCooldown: number; // in seconds
  activeSkillTimeLeft: number; // in seconds (for the active buff)

  // Minigames integration fields
  wizardMana: number;
  wizardMaxMana: number;
  gardenPlots: GardenPlot[];
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface GoldenCookie {
  id: string;
  type: 'frenzy' | 'lucky' | 'clickFrenzy';
  duration: number; // in seconds
  x: number; // percentage width
  y: number; // percentage height
  spawnTime: number;
}

export interface ActiveBuff {
  id: string;
  name: string;
  type: 'frenzy' | 'clickFrenzy';
  multiplier: number;
  timeLeft: number;
  maxDuration: number;
}
