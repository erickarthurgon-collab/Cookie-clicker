import { Building, Upgrade, Achievement, GameState, SkillNode } from '../types';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Auto-clica no cookie principal a cada 10 segundos.',
    baseCost: 15,
    costMultiplier: 1.15,
    baseCps: 0.1,
    count: 0,
    currentCost: 15,
    icon: 'MousePointerClick',
  },
  {
    id: 'grandma',
    name: 'Vovó',
    description: 'Uma vovó simpática para assar mais cookies.',
    baseCost: 100,
    costMultiplier: 1.15,
    baseCps: 1,
    count: 0,
    currentCost: 100,
    icon: 'User',
  },
  {
    id: 'farm',
    name: 'Fazenda',
    description: 'Cultiva plantas de cookie a partir de sementes doces.',
    baseCost: 1100,
    costMultiplier: 1.15,
    baseCps: 8,
    count: 0,
    currentCost: 1100,
    icon: 'Sprout',
  },
  {
    id: 'mine',
    name: 'Mina',
    description: 'Minera massa de cookie crua e gotas de chocolate.',
    baseCost: 12000,
    costMultiplier: 1.15,
    baseCps: 47,
    count: 0,
    currentCost: 12000,
    icon: 'Pickaxe',
  },
  {
    id: 'factory',
    name: 'Fábrica',
    description: 'Produz cookies em linhas de montagem industriais.',
    baseCost: 130000,
    costMultiplier: 1.15,
    baseCps: 260,
    count: 0,
    currentCost: 130000,
    icon: 'Factory',
  },
  {
    id: 'bank',
    name: 'Banco',
    description: 'Gera juros de massa e valoriza a economia do cookie.',
    baseCost: 1400000,
    costMultiplier: 1.15,
    baseCps: 1400,
    count: 0,
    currentCost: 1400000,
    icon: 'Coins',
  },
  {
    id: 'temple',
    name: 'Templo',
    description: 'Dedicado aos deuses do chocolate e do açúcar.',
    baseCost: 20000000,
    costMultiplier: 1.15,
    baseCps: 7800,
    count: 0,
    currentCost: 20000000,
    icon: 'Church',
  },
  {
    id: 'wizard',
    name: 'Torre de Mago',
    description: 'Conjura encantamentos e feitiços altamente calóricos.',
    baseCost: 330000000,
    costMultiplier: 1.15,
    baseCps: 44000,
    count: 0,
    currentCost: 330000000,
    icon: 'Flame',
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Abre um canal direto para o Universo do Cookie.',
    baseCost: 5100000000,
    costMultiplier: 1.15,
    baseCps: 260000,
    count: 0,
    currentCost: 5100000000,
    icon: 'Orbit',
  },
  {
    id: 'time_machine',
    name: 'Máquina do Tempo',
    description: 'Traz cookies do passado, antes mesmo de serem pensados.',
    baseCost: 75000000000,
    costMultiplier: 1.15,
    baseCps: 1600000,
    count: 0,
    currentCost: 75000000000,
    icon: 'Zap',
  },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  // Cursors
  {
    id: 'up_click_1',
    name: 'Cliques Reforçados',
    description: 'Sua força ao clicar aumenta em +1 permanentemente.',
    cost: 100,
    purchased: false,
    unlocked: true,
    effectType: 'clickPower',
    multiplier: 1, // handled in formula as constant add or multi
    icon: 'MousePointerClick',
  },
  {
    id: 'up_click_2',
    name: 'Cliques de Titânio',
    description: 'Os cliques manuais passam a render o dobro de cookies.',
    cost: 500,
    purchased: false,
    unlocked: false,
    effectType: 'clickPower',
    multiplier: 2,
    icon: 'MousePointerClick',
  },
  {
    id: 'up_cursor_1',
    name: 'Dedo Amanteigado',
    description: 'Os Cursores ficam duas vezes mais eficientes.',
    cost: 400,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'cursor',
    multiplier: 2,
    icon: 'MousePointer',
  },
  {
    id: 'up_cursor_2',
    name: 'Foco de Luz',
    description: 'Os Cursores ganham mais duas vezes de eficiência.',
    cost: 10000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'cursor',
    multiplier: 2,
    icon: 'MousePointer',
  },
  // Grandmas
  {
    id: 'up_grandma_1',
    name: 'Rolos de Massa Reforçados',
    description: 'As Vovós ficam duas vezes mais rápidas.',
    cost: 1000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'grandma',
    multiplier: 2,
    icon: 'User',
  },
  {
    id: 'up_grandma_2',
    name: 'Fórmula Secreta de Cacau',
    description: 'As Vovós dobram sua produção.',
    cost: 50000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'grandma',
    multiplier: 2,
    icon: 'User',
  },
  // Farms
  {
    id: 'up_farm_1',
    name: 'Irrigação de Calda',
    description: 'As Fazendas de cookie dobram sua produção.',
    cost: 11000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'farm',
    multiplier: 2,
    icon: 'Sprout',
  },
  {
    id: 'up_farm_2',
    name: 'Sementes Geneticamente Açucaradas',
    description: 'Fazendas produzem o dobro.',
    cost: 150000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'farm',
    multiplier: 2,
    icon: 'Sprout',
  },
  // Mines
  {
    id: 'up_mine_1',
    name: 'Broca de Açúcar Mascavo',
    description: 'As Minas ficam duas vezes mais eficientes.',
    cost: 120000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'mine',
    multiplier: 2,
    icon: 'Pickaxe',
  },
  // Factories
  {
    id: 'up_factory_1',
    name: 'Chaminés Filtro de Chocolate',
    description: 'As Fábricas dobram sua produção.',
    cost: 1300000,
    purchased: false,
    unlocked: false,
    effectType: 'buildingMultiplier',
    effectTarget: 'factory',
    multiplier: 2,
    icon: 'Factory',
  },
  // Global
  {
    id: 'up_global_1',
    name: 'Leite Condensado Especial',
    description: 'Aumenta a produção global de cookies em +10%.',
    cost: 25000,
    purchased: false,
    unlocked: true,
    effectType: 'globalMultiplier',
    multiplier: 1.10,
    icon: 'Milk',
  },
  {
    id: 'up_global_2',
    name: 'Açúcar de Confeiteiro Cósmico',
    description: 'Aumenta a produção global de cookies em +20%.',
    cost: 500000,
    purchased: false,
    unlocked: false,
    effectType: 'globalMultiplier',
    multiplier: 1.20,
    icon: 'Sparkles',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Clicks
  {
    id: 'ach_click_1',
    name: 'Início Humilde',
    description: 'Clique no cookie principal pela primeira vez.',
    unlocked: false,
    conditionType: 'clicks',
    conditionValue: 1,
    icon: 'Award',
  },
  {
    id: 'ach_click_100',
    name: 'Dedo Quente',
    description: 'Clique no cookie principal 100 vezes.',
    unlocked: false,
    conditionType: 'clicks',
    conditionValue: 100,
    icon: 'Sparkles',
  },
  {
    id: 'ach_click_1000',
    name: 'Metralhadora de Cliques',
    description: 'Clique no cookie principal 1.000 vezes.',
    unlocked: false,
    conditionType: 'clicks',
    conditionValue: 1000,
    icon: 'Flame',
  },
  // Total Baked
  {
    id: 'ach_baked_100',
    name: 'Primeira Fornada',
    description: 'Asse 100 cookies no total de sua carreira.',
    unlocked: false,
    conditionType: 'totalCookies',
    conditionValue: 100,
    icon: 'Cookie',
  },
  {
    id: 'ach_baked_10k',
    name: 'Padeiro do Bairro',
    description: 'Asse 10.000 cookies no total.',
    unlocked: false,
    conditionType: 'totalCookies',
    conditionValue: 10000,
    icon: 'ShoppingBag',
  },
  {
    id: 'ach_baked_1m',
    name: 'Magnata do Açúcar',
    description: 'Asse 1 Milhão de cookies no total.',
    unlocked: false,
    conditionType: 'totalCookies',
    conditionValue: 1000000,
    icon: 'TrendingUp',
  },
  {
    id: 'ach_baked_100m',
    name: 'Império Galáctico de Cookies',
    description: 'Asse 100 Milhões de cookies no total.',
    unlocked: false,
    conditionType: 'totalCookies',
    conditionValue: 100000000,
    icon: 'Globe',
  },
  // Buildings
  {
    id: 'ach_grandma_1',
    name: 'Casa da Vovó',
    description: 'Tenha pelo menos 1 Vovó assando para você.',
    unlocked: false,
    conditionType: 'buildingCount',
    conditionTarget: 'grandma',
    conditionValue: 1,
    icon: 'UserCheck',
  },
  {
    id: 'ach_grandma_10',
    name: 'Asilo de Cookies',
    description: 'Tenha pelo menos 10 Vovós trabalhando juntas.',
    unlocked: false,
    conditionType: 'buildingCount',
    conditionTarget: 'grandma',
    conditionValue: 10,
    icon: 'Users',
  },
  {
    id: 'ach_factory_5',
    name: 'Revolução Industrial',
    description: 'Tenha pelo menos 5 Fábricas operando simultaneamente.',
    unlocked: false,
    conditionType: 'buildingCount',
    conditionTarget: 'factory',
    conditionValue: 5,
    icon: 'Cpu',
  },
  {
    id: 'ach_golden_1',
    name: 'Toque de Midas',
    description: 'Clique em um Cookie Dourado.',
    unlocked: false,
    conditionType: 'goldenCookies',
    conditionValue: 1,
    icon: 'Sun',
  },
];

export const NEWS_TICKER_ITEMS: string[] = [
  "Notícia: Vovós estão revoltadas e exigem mais farinha de trigo de alta qualidade.",
  "Economia: As ações do mercado de gotas de chocolate sobem 40% em poucas horas.",
  "Relato: Cientistas dizem que comer biscoito melhora o foco nos estudos em até 777%.",
  "Alerta: Portais de cookie estão exalando um cheiro maravilhoso de baunilha no bairro.",
  "Notícia: As vovós dizem que 'seus dedinhos de clicar estão ficando lindos'.",
  "Curiosidade: O biscoito gigante principal parece possuir uma gravidade levemente açucarada.",
  "Opinião: 'Apenas mais um cookie...', diz cidadão viciado que não dorme há três dias.",
  "Espaço: Astrônomos descobrem um planeta gigante gasoso feito inteiramente de glacê.",
  "Culinária: Chef famoso tenta recriar a receita mágica e falha miseravelmente: 'Faltou amor'.",
  "Religião: Cultos ao sagrado chocolate crescem por todo o país.",
  "Tempo: Tempestades de raspas de chocolate são previstas para a tarde de hoje.",
  "Especulação: Máquinas do tempo estariam trazendo cookies antes mesmo de existirem ingredientes?",
  "Fofoca: As vovós estão comentando que o seu ritmo de cliques é 'divino'.",
  "Mundo: O PIB global agora é medido em 'Cookies Assados por Segundo'."
];

export const INITIAL_SKILLS: SkillNode[] = [
  // Tier 1
  {
    id: 'skill_click_1',
    name: 'Mão Celestial I',
    description: 'Aumenta permanentemente o poder dos seus cliques em +15%.',
    cost: 1,
    icon: 'MousePointerClick',
    effectType: 'clickPowerBonus',
    effectValue: 0.15,
    x: 30,
    y: 15,
  },
  {
    id: 'skill_efficiency_1',
    name: 'Arquitetura Celestial I',
    description: 'Reduz permanentemente o custo de compra de todas as estruturas em 5%.',
    cost: 1,
    icon: 'Factory',
    effectType: 'buildingCostReduction',
    effectValue: 0.05,
    x: 70,
    y: 15,
  },
  // Tier 2
  {
    id: 'skill_click_2',
    name: 'Mão Celestial II',
    description: 'Aumenta permanentemente o poder dos seus cliques em +30%.',
    cost: 2,
    dependsOn: ['skill_click_1'],
    icon: 'Sparkles',
    effectType: 'clickPowerBonus',
    effectValue: 0.30,
    x: 20,
    y: 40,
  },
  {
    id: 'skill_golden_1',
    name: 'Estrela Sorteada',
    description: 'Aumenta a taxa de surgimento dos Cookies Dourados em 35% e sua duração em 35%.',
    cost: 2,
    dependsOn: ['skill_click_1'],
    icon: 'Sun',
    effectType: 'goldenCookieFrequency',
    effectValue: 0.35,
    x: 40,
    y: 40,
  },
  {
    id: 'skill_cps_1',
    name: 'Frequência Estelar',
    description: 'Aumenta a produção passiva global de cookies (CPS) em +12%.',
    cost: 2,
    dependsOn: ['skill_efficiency_1'],
    icon: 'Coins',
    effectType: 'cpsMultiplier',
    effectValue: 0.12,
    x: 60,
    y: 40,
  },
  {
    id: 'skill_efficiency_2',
    name: 'Arquitetura Celestial II',
    description: 'Reduz permanentemente o custo de compra de todas as estruturas em mais 10%.',
    cost: 2,
    dependsOn: ['skill_efficiency_1'],
    icon: 'Orbit',
    effectType: 'buildingCostReduction',
    effectValue: 0.10,
    x: 80,
    y: 40,
  },
  // Tier 3
  {
    id: 'skill_frenzy_boost',
    name: 'Frenesi Amplificado',
    description: 'Aumenta em 5 segundos a duração de todos os efeitos ativos de frenesi e dá +10% CPS.',
    cost: 3,
    dependsOn: ['skill_click_2', 'skill_golden_1'],
    icon: 'Flame',
    effectType: 'cpsMultiplier',
    effectValue: 0.10,
    x: 30,
    y: 65,
  },
  {
    id: 'skill_grandma_wisdom',
    name: 'Sabedoria Ancestral',
    description: 'Ensina novas receitas estelares às Vovós, dobrando (+100%) a eficiência delas.',
    cost: 3,
    dependsOn: ['skill_cps_1', 'skill_efficiency_2'],
    icon: 'UserCheck',
    effectType: 'grandmaMultiplier',
    effectValue: 1.0,
    x: 70,
    y: 65,
  },
  // Tier 4 (Capstone Active)
  {
    id: 'skill_active_surge',
    name: 'Surto Cósmico',
    description: 'Habilidade Ativa: Desbloqueia uma habilidade de recarga de 90s que aumenta sua produção total (CPS) em +400% por 15 segundos.',
    cost: 4,
    dependsOn: ['skill_frenzy_boost', 'skill_grandma_wisdom'],
    icon: 'Zap',
    effectType: 'activeAbility',
    effectValue: 4.0,
    x: 50,
    y: 85,
  },
];

export const DEFAULT_GAME_STATE: GameState = {
  cookies: 0,
  totalCookiesBaked: 0,
  cookiesSpent: 0,
  clicks: 0,
  goldenCookieClicks: 0,
  prestigeLevel: 0,
  heavenlyChipsToClaim: 0,
  prestigePointsAllTime: 0,
  buildings: {},
  purchasedUpgrades: [],
  unlockedAchievements: [],
  playTime: 0,
  lastSaved: 0,
  cosmicStars: 0,
  cosmicStarsExchanged: 0,
  unlockedSkills: [],
  activeSkillCooldown: 0,
  activeSkillTimeLeft: 0,
  wizardMana: 100,
  wizardMaxMana: 100,
  gardenPlots: [
    { id: 0, unlocked: true, plant: null },
    { id: 1, unlocked: true, plant: null },
    { id: 2, unlocked: false, plant: null },
    { id: 3, unlocked: true, plant: null },
    { id: 4, unlocked: true, plant: null },
    { id: 5, unlocked: false, plant: null },
    { id: 6, unlocked: false, plant: null },
    { id: 7, unlocked: false, plant: null },
    { id: 8, unlocked: false, plant: null },
  ],
};

// Helper for large numbers formatting
export function formatCookies(num: number): string {
  if (num === 0) return '0';
  if (num < 1000) {
    // If it has decimal places (like with 0.1 CPS), show up to 1 decimal
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }
  const suffixes = [
    { value: 1e3, symbol: ' mil' },
    { value: 1e6, symbol: ' Milhão' },
    { value: 1e9, symbol: ' Bilhão' },
    { value: 1e12, symbol: ' Trilhão' },
    { value: 1e15, symbol: ' Quatrilhão' },
    { value: 1e18, symbol: ' Quintilhão' },
  ];
  
  // Plurals for millions etc.
  for (let i = suffixes.length - 1; i >= 0; i--) {
    if (num >= suffixes[i].value) {
      const scaled = num / suffixes[i].value;
      const formatted = scaled.toFixed(2).replace(/\.?0+$/, '');
      
      let sym = suffixes[i].symbol;
      if (num >= 2 * suffixes[i].value && i > 0) {
        // change "Milhão" to "Milhões"
        sym = sym.replace('ão', 'ões');
      }
      return `${formatted}${sym}`;
    }
  }
  return num.toFixed(0);
}

// Convert seconds into a nice readable duration
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSecs}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}
