import { MAP_COLORS } from '../../config';
import type { Point, Rect } from '../../geometry';
import { FULL_TURN } from '../../geometry';
import { withSaved } from '../../canvas';
import type { Rng } from '../../rng';
import { chance, pick, randomBetween, randomInt } from '../../rng';
import { drawTrees, fillRect } from '../paint';
import type { ZonePainter } from './types';

/** Parque: gramado com campo de futebol, um caminho de terra e algumas árvores. */

const PITCH = { length: 130, width: 84, jitter: 30 };
const PITCH_STRIPES = 8;
const PITCH_LINE_WIDTH = 2;
const CENTER_CIRCLE_RADIUS = 12;
const PENALTY_BOX = { depth: 20, width: 44 };
const PATH_WIDTH = 9;
const TREE_COUNT = { min: 10, max: 20 };
const TREE_RADIUS = { min: 7, max: 12 };
const TREE_EDGE_BAND = 55;

export const paintPark: ZonePainter = (ctx, area, rng) => {
  fillRect(ctx, area, MAP_COLORS.parkGrass);
  paintPath(ctx, area, rng);
  paintPitch(ctx, area, rng);
  paintEdgeTrees(ctx, area, rng);
};

/** Caminho em curva de um lado ao outro do parque. */
function paintPath(ctx: CanvasRenderingContext2D, area: Rect, rng: Rng): void {
  const horizontal = chance(rng, 0.5);
  const along = (t: number, across: number): Point =>
    horizontal
      ? { x: area.x + area.width * t, y: area.y + area.height * across }
      : { x: area.x + area.width * across, y: area.y + area.height * t };
  const start = along(0, randomBetween(rng, 0.15, 0.85));
  const control = along(0.5, randomBetween(rng, -0.2, 1.2));
  const end = along(1, randomBetween(rng, 0.15, 0.85));

  ctx.strokeStyle = MAP_COLORS.path;
  ctx.lineWidth = PATH_WIDTH;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
  ctx.stroke();
}

function paintPitch(ctx: CanvasRenderingContext2D, area: Rect, rng: Rng): void {
  const center = {
    x: area.x + area.width / 2 + randomBetween(rng, -PITCH.jitter, PITCH.jitter),
    y: area.y + area.height / 2 + randomBetween(rng, -PITCH.jitter, PITCH.jitter),
  };
  const rotation = chance(rng, 0.5) ? 0 : Math.PI / 2;
  const halfLength = PITCH.length / 2;
  const halfWidth = PITCH.width / 2;

  withSaved(ctx, () => {
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    const stripeLength = PITCH.length / PITCH_STRIPES;
    for (let i = 0; i < PITCH_STRIPES; i++) {
      ctx.fillStyle = i % 2 === 0 ? MAP_COLORS.pitch : MAP_COLORS.pitchStripe;
      ctx.fillRect(-halfLength + i * stripeLength, -halfWidth, stripeLength, PITCH.width);
    }

    ctx.strokeStyle = MAP_COLORS.pitchLine;
    ctx.lineWidth = PITCH_LINE_WIDTH;
    ctx.strokeRect(-halfLength, -halfWidth, PITCH.length, PITCH.width);
    ctx.beginPath();
    ctx.moveTo(0, -halfWidth);
    ctx.lineTo(0, halfWidth);
    ctx.moveTo(CENTER_CIRCLE_RADIUS, 0);
    ctx.arc(0, 0, CENTER_CIRCLE_RADIUS, 0, FULL_TURN);
    ctx.stroke();
    const boxHalf = PENALTY_BOX.width / 2;
    ctx.strokeRect(-halfLength, -boxHalf, PENALTY_BOX.depth, PENALTY_BOX.width);
    ctx.strokeRect(halfLength - PENALTY_BOX.depth, -boxHalf, PENALTY_BOX.depth, PENALTY_BOX.width);
  });
}

/** Árvores só perto das bordas, para não cobrir o campo. */
function paintEdgeTrees(ctx: CanvasRenderingContext2D, area: Rect, rng: Rng): void {
  const trees = Array.from({ length: randomInt(rng, TREE_COUNT.min, TREE_COUNT.max) }, () => ({
    center: pointNearEdge(rng, area),
    radius: randomBetween(rng, TREE_RADIUS.min, TREE_RADIUS.max),
    color: pick(rng, MAP_COLORS.trees),
  }));
  drawTrees(ctx, trees);
}

function pointNearEdge(rng: Rng, area: Rect): Point {
  const depth = randomBetween(rng, 0, TREE_EDGE_BAND);
  const along = rng();
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  switch (randomInt(rng, 0, 3)) {
    case 0:
      return { x: area.x + area.width * along, y: area.y + depth };
    case 1:
      return { x: area.x + area.width * along, y: bottom - depth };
    case 2:
      return { x: area.x + depth, y: area.y + area.height * along };
    default:
      return { x: right - depth, y: area.y + area.height * along };
  }
}
