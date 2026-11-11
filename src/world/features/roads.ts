import { MAP_COLORS, ROADS } from '../../config';
import type { Point } from '../../geometry';
import type { Rng } from '../../rng';
import { chance, randomInt } from '../../rng';

/** Estradas em trechos de algumas divisas entre zonas. */

const MIN_SPAN_CELLS = 2;

interface Segment {
  readonly from: Point;
  readonly to: Point;
}

export function paintRoads(
  ctx: CanvasRenderingContext2D,
  worldSize: number,
  zoneSize: number,
  rng: Rng,
): void {
  const segments = roadSegments(worldSize, zoneSize, rng);
  ctx.lineCap = 'butt';
  // Três passadas para os cruzamentos ficarem limpos: borda, asfalto, faixa.
  strokeSegments(ctx, segments, MAP_COLORS.asphaltEdge, ROADS.edgeWidth);
  strokeSegments(ctx, segments, MAP_COLORS.asphalt, ROADS.width);
  ctx.setLineDash(ROADS.dash);
  strokeSegments(ctx, segments, MAP_COLORS.laneMark, 1);
  ctx.setLineDash([]);
}

function roadSegments(worldSize: number, zoneSize: number, rng: Rng): Segment[] {
  const cells = Math.ceil(worldSize / zoneSize);
  const segments: Segment[] = [];
  for (let line = 1; line < cells; line++) {
    for (const vertical of [true, false]) {
      if (!chance(rng, ROADS.lineChance)) continue;
      const startCell = randomInt(rng, 0, cells - MIN_SPAN_CELLS);
      const endCell = randomInt(rng, startCell + MIN_SPAN_CELLS, cells);
      const fixed = line * zoneSize;
      const start = startCell * zoneSize;
      const end = endCell * zoneSize;
      segments.push(
        vertical
          ? { from: { x: fixed, y: start }, to: { x: fixed, y: end } }
          : { from: { x: start, y: fixed }, to: { x: end, y: fixed } },
      );
    }
  }
  return segments;
}

function strokeSegments(
  ctx: CanvasRenderingContext2D,
  segments: readonly Segment[],
  color: string,
  width: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (const { from, to } of segments) {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }
  ctx.stroke();
}
