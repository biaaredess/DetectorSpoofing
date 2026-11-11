import { MAP_COLORS } from '../../config';
import type { Rect } from '../../geometry';
import { insetRect } from '../../geometry';
import type { Rng } from '../../rng';
import { chance, pick, randomBetween, randomInt } from '../../rng';
import { fillRect } from '../paint';
import type { ZonePainter } from './types';

/** Cidade: quarteirões separados por ruas, com telhados coloridos e sombra. */

const STREET_WIDTH = 10;
const BLOCKS_PER_SIDE = { min: 2, max: 3 };
const BUILDINGS_PER_SIDE = { min: 2, max: 3 };
const BUILDING_GAP = 4;
const BUILDING_JITTER = 4;
const SHADOW_OFFSET = 5;
const EMPTY_LOT_CHANCE = 0.08;
const RIDGE_CHANCE = 0.55;
const RIDGE_COLOR = 'rgba(255, 255, 255, 0.28)';
const RIDGE_WIDTH = 2;

export const paintCity: ZonePainter = (ctx, area, rng) => {
  fillRect(ctx, area, MAP_COLORS.cityStreet);
  const blocks = randomInt(rng, BLOCKS_PER_SIDE.min, BLOCKS_PER_SIDE.max);
  for (const block of grid(insetRect(area, STREET_WIDTH / 2), blocks, blocks)) {
    const lot = insetRect(block, STREET_WIDTH / 2);
    fillRect(ctx, lot, MAP_COLORS.cityGround);
    paintBuildings(ctx, lot, rng);
  }
};

function paintBuildings(ctx: CanvasRenderingContext2D, lot: Rect, rng: Rng): void {
  const columns = randomInt(rng, BUILDINGS_PER_SIDE.min, BUILDINGS_PER_SIDE.max);
  const rows = randomInt(rng, BUILDINGS_PER_SIDE.min, BUILDINGS_PER_SIDE.max);
  for (const cell of grid(lot, columns, rows)) {
    if (chance(rng, EMPTY_LOT_CHANCE)) continue;
    const building = insetRect(cell, BUILDING_GAP + randomBetween(rng, 0, BUILDING_JITTER));
    fillRect(
      ctx,
      { ...building, x: building.x + SHADOW_OFFSET, y: building.y + SHADOW_OFFSET },
      MAP_COLORS.shadow,
    );
    fillRect(ctx, building, pick(rng, MAP_COLORS.roofs));
    if (chance(rng, RIDGE_CHANCE)) paintRidge(ctx, building);
  }
}

/** Cumeeira do telhado, ao longo do lado mais comprido. */
function paintRidge(ctx: CanvasRenderingContext2D, roof: Rect): void {
  ctx.strokeStyle = RIDGE_COLOR;
  ctx.lineWidth = RIDGE_WIDTH;
  ctx.beginPath();
  if (roof.width >= roof.height) {
    const y = roof.y + roof.height / 2;
    ctx.moveTo(roof.x, y);
    ctx.lineTo(roof.x + roof.width, y);
  } else {
    const x = roof.x + roof.width / 2;
    ctx.moveTo(x, roof.y);
    ctx.lineTo(x, roof.y + roof.height);
  }
  ctx.stroke();
}

function grid(area: Rect, columns: number, rows: number): Rect[] {
  const width = area.width / columns;
  const height = area.height / rows;
  return Array.from({ length: columns * rows }, (_, i) => ({
    x: area.x + (i % columns) * width,
    y: area.y + Math.floor(i / columns) * height,
    width,
    height,
  }));
}
