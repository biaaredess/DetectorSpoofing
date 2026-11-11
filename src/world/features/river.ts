import { MAP_COLORS, RIVER } from '../../config';
import type { Point } from '../../geometry';
import { FULL_TURN } from '../../geometry';
import type { Rng } from '../../rng';
import { randomBetween } from '../../rng';

/** Rio que atravessa o mapa da esquerda para a direita, serpenteando. */

const BASE_LINE_RANGE = { min: 0.3, max: 0.7 };
const MEANDER_WAVELENGTH = { min: 900, max: 1500 };
const WIGGLE_WAVELENGTH = { min: 220, max: 380 };
const BANK_COLOR = MAP_COLORS.sand;

export function paintRiver(ctx: CanvasRenderingContext2D, worldSize: number, rng: Rng): void {
  const path = riverPath(worldSize, rng);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  strokePath(ctx, path, BANK_COLOR, RIVER.bankWidth);
  strokePath(ctx, path, MAP_COLORS.water, RIVER.waterWidth);
}

function riverPath(worldSize: number, rng: Rng): Point[] {
  const baseY = worldSize * randomBetween(rng, BASE_LINE_RANGE.min, BASE_LINE_RANGE.max);
  const meander = wave(rng, RIVER.meanderAmplitude, MEANDER_WAVELENGTH);
  const wiggle = wave(rng, RIVER.wiggleAmplitude, WIGGLE_WAVELENGTH);
  const points: Point[] = [];
  for (let x = -RIVER.stepPx; x <= worldSize + RIVER.stepPx; x += RIVER.stepPx) {
    points.push({ x, y: baseY + meander(x) + wiggle(x) });
  }
  return points;
}

type Range = { readonly min: number; readonly max: number };

function wave(rng: Rng, amplitude: Range, wavelength: Range): (x: number) => number {
  const a = randomBetween(rng, amplitude.min, amplitude.max);
  const k = FULL_TURN / randomBetween(rng, wavelength.min, wavelength.max);
  const phase = rng() * FULL_TURN;
  return (x) => a * Math.sin(k * x + phase);
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  color: string,
  width: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach((point, i) =>
    i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y),
  );
  ctx.stroke();
}
