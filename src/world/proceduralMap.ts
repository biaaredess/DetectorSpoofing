import { WORLD } from '../config';
import { context2d, createCanvas } from '../canvas';
import { createRng } from '../rng';
import type { MapSource } from './MapSource';
import { paintGrain } from './features/grain';
import { paintHighway } from './features/highway';
import { paintRiver } from './features/river';
import { paintRoads } from './features/roads';
import { createImageMapSource } from './imageMapSource';
import { paintZones } from './zones';

/**
 * Gera o mapa inteiro uma vez, num canvas grande. A ordem das camadas importa:
 * zonas, depois o rio, e as estradas por cima dele (como pontes).
 */
export function createProceduralMap(seed: number = WORLD.seed): MapSource {
  const { size, zoneSize } = WORLD;
  const canvas = createCanvas(size);
  const ctx = context2d(canvas);
  const rng = createRng(seed);

  paintZones(ctx, size, zoneSize, rng);
  paintRiver(ctx, size, rng);
  paintRoads(ctx, size, zoneSize, rng);
  paintHighway(ctx, size, rng);
  paintGrain(ctx, size, rng);

  return createImageMapSource(canvas, size);
}
