import { MAP_COLORS } from '../config';
import type { Point, Rect } from '../geometry';
import { FULL_TURN } from '../geometry';
import type { Rng } from '../rng';
import { pick, randomBetween } from '../rng';

/** Funções de desenho reaproveitadas por várias zonas. */

export function fillRect(ctx: CanvasRenderingContext2D, rect: Rect, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
}

export function fillCircle(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, FULL_TURN);
  ctx.fill();
}

export function randomPointIn(rng: Rng, area: Rect, margin = 0): Point {
  return {
    x: randomBetween(rng, area.x + margin, area.x + area.width - margin),
    y: randomBetween(rng, area.y + margin, area.y + area.height - margin),
  };
}

export interface Tree {
  readonly center: Point;
  readonly radius: number;
  readonly color: string;
}

const TREE_SHADOW_OFFSET = 3;
const TREE_HIGHLIGHT = 'rgba(255, 255, 255, 0.16)';
const TREE_HIGHLIGHT_SCALE = 0.45;
const TREE_HIGHLIGHT_SHIFT = 0.3;

export function randomTree(rng: Rng, area: Rect, radius: { min: number; max: number }): Tree {
  return {
    center: randomPointIn(rng, area, radius.max / 2),
    radius: randomBetween(rng, radius.min, radius.max),
    color: pick(rng, MAP_COLORS.trees),
  };
}

/** Sombras primeiro e copas depois, para uma copa não ficar sob a sombra da vizinha. */
export function drawTrees(ctx: CanvasRenderingContext2D, trees: readonly Tree[]): void {
  for (const tree of trees) {
    const shadowCenter = {
      x: tree.center.x + TREE_SHADOW_OFFSET,
      y: tree.center.y + TREE_SHADOW_OFFSET,
    };
    fillCircle(ctx, shadowCenter, tree.radius, MAP_COLORS.shadow);
  }
  for (const tree of trees) {
    fillCircle(ctx, tree.center, tree.radius, tree.color);
    const shift = tree.radius * TREE_HIGHLIGHT_SHIFT;
    const highlight = { x: tree.center.x - shift, y: tree.center.y - shift };
    fillCircle(ctx, highlight, tree.radius * TREE_HIGHLIGHT_SCALE, TREE_HIGHLIGHT);
  }
}

export interface BlobShape {
  readonly center: Point;
  readonly radius: number;
  /** Harmônicos que deixam a borda irregular, como um lago de verdade. */
  readonly waves: readonly { frequency: number; amplitude: number; phase: number }[];
}

const BLOB_STEPS = 72;

export function randomBlob(
  rng: Rng,
  center: Point,
  radius: number,
  frequencies: readonly number[],
  maxAmplitude: number,
): BlobShape {
  return {
    center,
    radius,
    waves: frequencies.map((frequency) => ({
      frequency,
      amplitude: randomBetween(rng, 0, maxAmplitude),
      phase: rng() * FULL_TURN,
    })),
  };
}

/** Traça o contorno do blob, crescido em `grow` pixels. */
export function traceBlob(ctx: CanvasRenderingContext2D, blob: BlobShape, grow = 0): void {
  ctx.beginPath();
  for (let step = 0; step <= BLOB_STEPS; step++) {
    const angle = (step / BLOB_STEPS) * FULL_TURN;
    const wobble = blob.waves.reduce(
      (sum, wave) => sum + Math.sin(angle * wave.frequency + wave.phase) * wave.amplitude,
      0,
    );
    const r = blob.radius * (1 + wobble) + grow;
    const x = blob.center.x + Math.cos(angle) * r;
    const y = blob.center.y + Math.sin(angle) * r;
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
