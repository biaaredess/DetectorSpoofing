/**
 * Gerador pseudoaleatório com seed (mulberry32). Com a mesma seed, o mapa e as
 * rodadas saem sempre iguais.
 */
export type Rng = () => number;

const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 2 ** 32;

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

/** Seed nova para cada partida, a partir do relógio. */
export function freshSeed(): number {
  return Date.now() % UINT32_RANGE;
}

export function randomBetween(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Inteiro em [min, max], incluindo os dois extremos. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(randomBetween(rng, min, max + 1));
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error('pick() em lista vazia');
  return item;
}

export function pickWeighted<K extends string>(rng: Rng, weights: Readonly<Record<K, number>>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll < 0) return key;
  }
  return entries[entries.length - 1]![0];
}

/** Embaralhamento de Fisher–Yates; devolve uma cópia. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function randomSign(rng: Rng): 1 | -1 {
  return rng() < 0.5 ? -1 : 1;
}
