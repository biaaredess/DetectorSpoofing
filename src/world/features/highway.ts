import { HIGHWAY, MAP_COLORS } from '../../config';
import type { Point } from '../../geometry';
import type { Rng } from '../../rng';
import { randomBetween } from '../../rng';

/** Rodovia em curva (Bézier cúbica) que cruza o mapa de cima a baixo. */

const ENDPOINT_RANGE = { min: 0.15, max: 0.85 };
const CONTROL_RANGE = { min: -0.1, max: 1.1 };
const CONTROL_HEIGHTS = [0.33, 0.66];
const OVERHANG = 40;
const SHOULDER_COLOR = '#E8E8E8';

export function paintHighway(ctx: CanvasRenderingContext2D, worldSize: number, rng: Rng): void {
  const along = (range: { min: number; max: number }): number =>
    worldSize * randomBetween(rng, range.min, range.max);
  const [firstHeight = 0, secondHeight = 1] = CONTROL_HEIGHTS;
  const start = { x: along(ENDPOINT_RANGE), y: -OVERHANG };
  const control1 = { x: along(CONTROL_RANGE), y: worldSize * firstHeight };
  const control2 = { x: along(CONTROL_RANGE), y: worldSize * secondHeight };
  const end = { x: along(ENDPOINT_RANGE), y: worldSize + OVERHANG };

  const trace = (): void => traceCurve(ctx, start, control1, control2, end);
  ctx.lineCap = 'butt';
  stroke(ctx, trace, MAP_COLORS.highwayEdge, HIGHWAY.edgeWidth);
  stroke(ctx, trace, SHOULDER_COLOR, HIGHWAY.shoulderWidth);
  stroke(ctx, trace, MAP_COLORS.highway, HIGHWAY.laneWidth);
  ctx.setLineDash(HIGHWAY.dash);
  stroke(ctx, trace, MAP_COLORS.highwayCenter, HIGHWAY.centerWidth);
  ctx.setLineDash([]);
}

function traceCurve(
  ctx: CanvasRenderingContext2D,
  start: Point,
  control1: Point,
  control2: Point,
  end: Point,
): void {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);
}

function stroke(
  ctx: CanvasRenderingContext2D,
  trace: () => void,
  color: string,
  width: number,
): void {
  trace();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}
