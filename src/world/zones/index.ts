import { ZONE_WEIGHTS } from '../../config';
import type { Rng } from '../../rng';
import { pickWeighted } from '../../rng';
import { paintCity } from './city';
import { paintFarm } from './farm';
import { paintForest } from './forest';
import { paintLake } from './lake';
import { paintPark } from './park';
import type { ZonePainter } from './types';

export type ZoneKind = keyof typeof ZONE_WEIGHTS;

const PAINTERS: Readonly<Record<ZoneKind, ZonePainter>> = {
  farm: paintFarm,
  city: paintCity,
  forest: paintForest,
  park: paintPark,
  lake: paintLake,
};

/** Sorteia o tipo de cada célula da grade e pinta todas. */
export function paintZones(
  ctx: CanvasRenderingContext2D,
  worldSize: number,
  zoneSize: number,
  rng: Rng,
): void {
  const cells = Math.ceil(worldSize / zoneSize);
  for (let row = 0; row < cells; row++) {
    for (let column = 0; column < cells; column++) {
      const area = { x: column * zoneSize, y: row * zoneSize, width: zoneSize, height: zoneSize };
      PAINTERS[pickWeighted(rng, ZONE_WEIGHTS)](ctx, area, rng);
    }
  }
}
