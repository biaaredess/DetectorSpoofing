/**
 * Todas as constantes de ajuste do jogo ficam aqui: tempos, níveis, tamanhos,
 * dificuldade dos ataques, intensidade do clima e paleta de cores.
 */

// ---------------------------------------------------------------- tempos (ms)

export const TIMING = {
  roundDurationMs: 10_000,
  /** A barra de tempo fica laranja quando faltar isto. */
  timerWarningMs: 3_000,
  feedbackAutoAdvanceMs: 4_500,
  levelIntroAutoAdvanceMs: 3_200,
  revealAnimationMs: 700,
} as const;

// ---------------------------------------------------------------- níveis

export type WeatherKind = 'clear' | 'fog' | 'rain' | 'night';

export interface LevelConfig {
  readonly weather: WeatherKind;
  readonly name: string;
  readonly tagline: string;
}

export const LEVELS: readonly LevelConfig[] = [
  {
    weather: 'clear',
    name: 'Céu limpo',
    tagline: 'Dia bonito. Compare estradas, lagos e rios nas duas imagens.',
  },
  {
    weather: 'fog',
    name: 'Neblina',
    tagline: 'A neblina apaga os detalhes. Procure as formas grandes.',
  },
  {
    weather: 'rain',
    name: 'Chuva',
    tagline: 'Gotas na lente e tudo mais escuro. Não se distraia!',
  },
  {
    weather: 'night',
    name: 'Noite',
    tagline: 'Quase não dá para ver nada. Confie no que ainda aparece.',
  },
];

export const ROUNDS_PER_LEVEL = 3;

// ---------------------------------------------------------------- pontuação

export const SCORING = {
  correctAnswerPoints: 100,
  /** Bônus por décimo de segundo que sobrou no relógio. */
  bonusPerTenthOfSecond: 1,
  msPerBonusStep: 100,
} as const;

// ---------------------------------------------------------------- mundo e visão

export const WORLD = {
  /** Lado do mapa procedural, em pixels de mundo. */
  size: 2400,
  zoneSize: 300,
  seed: 20_261_110,
} as const;

export const VIEW = {
  /** Lado da região do mundo que cabe numa imagem. */
  worldSpan: 400,
  /** Resolução interna dos dois canvas (o CSS escala para caber na tela). */
  canvasSize: 600,
  /** Distância mínima até a borda do mapa, para a câmera girada não sair dele. */
  edgeMargin: 320,
  /** Folga ao redor dos dois pins quando o mapa revela o ataque. */
  revealPadding: 60,
} as const;

// ---------------------------------------------------------------- ataques

export const ATTACK = {
  /** Fração dos ataques que são do tipo difícil ("perto"). */
  nearShare: 0.6,
  nearDistance: { min: 150, max: 230 },
  farDistance: { min: 620, max: 1200 },
  /** Ruído normal de um GPS honesto. */
  honestGpsJitter: 8,
  maxPlacementAttempts: 200,
} as const;

/** Escala da conversão para a frase de feedback ("o GPS mentiu por ~90 m"). */
export const METERS_PER_WORLD_PIXEL = 0.5;

// ---------------------------------------------------------------- distorção da câmera

export const CAMERA_DISTORTION = {
  maxRotationDeg: 12,
  scale: { min: 0.92, max: 1.1 },
  maxHueShiftDeg: 14,
  blurPx: { min: 0.6, max: 1.2 },
  tintAlpha: { min: 0.06, max: 0.14 },
  tints: ['#FFB070', '#7FD3FF', '#C8FF9A', '#FF9AD5'],
} as const;

// ---------------------------------------------------------------- clima (só na câmera)

export const WEATHER = {
  vignette: { innerRatio: 0.28, outerRatio: 0.75, alpha: 0.55 },
  fog: {
    veilAlpha: 0.5,
    patchCount: { min: 7, max: 11 },
    patchRadius: { min: 90, max: 220 },
    patchAlpha: { min: 0.3, max: 0.6 },
    color: '235, 238, 240',
  },
  rain: {
    darkenAlpha: 0.38,
    streakCount: 260,
    streakLength: { min: 16, max: 34 },
    streakAngleDeg: 68,
    dropCount: { min: 8, max: 13 },
    dropRadius: { min: 14, max: 32 },
  },
  night: {
    darkness: '#34416A',
    extraDarkAlpha: 0.2,
    noiseAlpha: 0.16,
    lightCount: { min: 10, max: 22 },
    lightRadius: { min: 6, max: 14 },
    lightColor: '255, 214, 130',
  },
} as const;

// ---------------------------------------------------------------- placar

export const LEADERBOARD = {
  size: 10,
  storageKeyPrefix: 'voce-e-o-detector:placar:',
  maxNameLength: 16,
} as const;

// ---------------------------------------------------------------- cores

/** Paleta da interface, igual aos slides. Espelhada em `styles/main.css`. */
export const UI_COLORS = {
  ink: '#4A4A4A',
  border: '#5A5A5A',
  orange: '#FF8A3D',
  turquoise: '#4FC3D1',
  white: '#FFFFFF',
} as const;

/** Paleta do mapa procedural. */
export const MAP_COLORS = {
  grass: '#8DB36B',
  dirt: '#A48A62',
  crops: [
    { base: '#C9B458', stripe: '#AE9A45' },
    { base: '#9DBF5A', stripe: '#84A646' },
    { base: '#7FA650', stripe: '#668C3E' },
    { base: '#D9C27A', stripe: '#BFA862' },
    { base: '#A88B57', stripe: '#8C7246' },
  ],
  cityGround: '#B5B2AA',
  cityStreet: '#8E8C88',
  roofs: ['#C8553D', '#E07A5F', '#9A9A9A', '#D9A441', '#6D8EA0', '#EDE6DA', '#B65E8C'],
  shadow: 'rgba(0, 0, 0, 0.32)',
  forestFloor: '#3F6B35',
  trees: ['#2F5A2A', '#3E7A35', '#4D8A3E', '#2A4D24', '#56934A'],
  parkGrass: '#94C871',
  pitch: '#5FA845',
  pitchStripe: '#56993E',
  pitchLine: '#F4F4F4',
  path: '#D8C9A3',
  sand: '#E3D3A1',
  water: '#3C7FB0',
  deepWater: '#2D6592',
  asphalt: '#7D7D7D',
  asphaltEdge: '#5F5F5F',
  laneMark: '#EDEDED',
  highway: '#5E5E5E',
  highwayEdge: '#454545',
  highwayCenter: '#F2C94C',
} as const;

/** Pesos do sorteio do tipo de cada zona. */
export const ZONE_WEIGHTS = {
  farm: 32,
  city: 22,
  forest: 20,
  park: 13,
  lake: 13,
} as const;

export const ROADS = {
  /** Chance de cada linha da grade ganhar um trecho de estrada. */
  lineChance: 0.55,
  width: 14,
  edgeWidth: 18,
  dash: [12, 12],
} as const;

export const HIGHWAY = {
  edgeWidth: 34,
  shoulderWidth: 30,
  laneWidth: 26,
  centerWidth: 2,
  dash: [18, 14],
} as const;

export const RIVER = {
  bankWidth: 54,
  waterWidth: 38,
  stepPx: 30,
  meanderAmplitude: { min: 120, max: 260 },
  wiggleAmplitude: { min: 20, max: 45 },
} as const;

export const GRAIN = {
  tileSize: 160,
  alpha: 0.07,
} as const;
