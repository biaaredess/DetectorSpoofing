import { MAP_COLORS } from '../../config';
import { withSaved } from '../../canvas';
import { randomBetween, randomInt } from '../../rng';
import { drawTrees, fillRect, randomBlob, randomTree, traceBlob } from '../paint';
import type { ZonePainter } from './types';

/** Lago: espelho d'água de borda irregular, com margem de areia. */

const LAKE_RADIUS_RATIO = { min: 0.3, max: 0.38 };
const CENTER_JITTER_RATIO = 0.08;
const SHORE_HARMONICS = [2, 3, 5];
const SHORE_WOBBLE = 0.12;
const SAND_WIDTH = 11;
const DEEP_WATER_RATIO = 0.25;
const SHORE_LINE = 'rgba(255, 255, 255, 0.35)';
const SHORE_LINE_WIDTH = 2;
const TREE_COUNT = { min: 6, max: 14 };
const TREE_RADIUS = { min: 7, max: 12 };

export const paintLake: ZonePainter = (ctx, area, rng) => {
  fillRect(ctx, area, MAP_COLORS.grass);
  const trees = Array.from({ length: randomInt(rng, TREE_COUNT.min, TREE_COUNT.max) }, () =>
    randomTree(rng, area, TREE_RADIUS),
  );
  drawTrees(ctx, trees);

  const side = Math.min(area.width, area.height);
  const jitter = side * CENTER_JITTER_RATIO;
  const center = {
    x: area.x + area.width / 2 + randomBetween(rng, -jitter, jitter),
    y: area.y + area.height / 2 + randomBetween(rng, -jitter, jitter),
  };
  const radius = side * randomBetween(rng, LAKE_RADIUS_RATIO.min, LAKE_RADIUS_RATIO.max);
  const lake = randomBlob(rng, center, radius, SHORE_HARMONICS, SHORE_WOBBLE);

  ctx.fillStyle = MAP_COLORS.sand;
  traceBlob(ctx, lake, SAND_WIDTH);
  ctx.fill();

  withSaved(ctx, () => {
    const gradient = ctx.createRadialGradient(
      center.x,
      center.y,
      radius * DEEP_WATER_RATIO,
      center.x,
      center.y,
      radius,
    );
    gradient.addColorStop(0, MAP_COLORS.deepWater);
    gradient.addColorStop(1, MAP_COLORS.water);
    ctx.fillStyle = gradient;
    traceBlob(ctx, lake);
    ctx.fill();
    ctx.strokeStyle = SHORE_LINE;
    ctx.lineWidth = SHORE_LINE_WIDTH;
    ctx.stroke();
  });
};
