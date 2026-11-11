import { MAP_COLORS } from '../../config';
import type { Rect } from '../../geometry';
import { degToRad, insetRect } from '../../geometry';
import { withSaved } from '../../canvas';
import type { Rng } from '../../rng';
import { chance, pick, randomBetween } from '../../rng';
import { fillRect } from '../paint';
import type { ZonePainter } from './types';

/** Plantação: talhões de culturas diferentes, cada um com listras de plantio. */

const PATH_WIDTH = 5;
const SPLIT_RANGE = { min: 0.35, max: 0.65 };
const MAX_SPLIT_DEPTH = 2;
const SPLIT_CHANCE_AT_DEPTH = [1, 0.7];
const STRIPE_SPACING = { min: 6, max: 10 };
const STRIPE_WIDTH = 2;
const STRIPE_ANGLES_DEG = [0, 90, 30, -30, 60];

export const paintFarm: ZonePainter = (ctx, area, rng) => {
  fillRect(ctx, area, MAP_COLORS.dirt);
  for (const plot of splitIntoPlots(rng, area, 0)) {
    paintPlot(ctx, insetRect(plot, PATH_WIDTH / 2), rng);
  }
};

/** Divide o retângulo pelo lado mais comprido, recursivamente. */
function splitIntoPlots(rng: Rng, area: Rect, depth: number): Rect[] {
  const splitChance = SPLIT_CHANCE_AT_DEPTH[depth] ?? 0;
  if (depth >= MAX_SPLIT_DEPTH || !chance(rng, splitChance)) return [area];

  const ratio = randomBetween(rng, SPLIT_RANGE.min, SPLIT_RANGE.max);
  const [first, second] =
    area.width >= area.height
      ? [
          { ...area, width: area.width * ratio },
          { ...area, x: area.x + area.width * ratio, width: area.width * (1 - ratio) },
        ]
      : [
          { ...area, height: area.height * ratio },
          { ...area, y: area.y + area.height * ratio, height: area.height * (1 - ratio) },
        ];
  return [...splitIntoPlots(rng, first, depth + 1), ...splitIntoPlots(rng, second, depth + 1)];
}

function paintPlot(ctx: CanvasRenderingContext2D, plot: Rect, rng: Rng): void {
  const crop = pick(rng, MAP_COLORS.crops);
  fillRect(ctx, plot, crop.base);

  const spacing = randomBetween(rng, STRIPE_SPACING.min, STRIPE_SPACING.max);
  const angle = degToRad(pick(rng, STRIPE_ANGLES_DEG));
  const reach = Math.hypot(plot.width, plot.height) / 2;

  withSaved(ctx, () => {
    ctx.beginPath();
    ctx.rect(plot.x, plot.y, plot.width, plot.height);
    ctx.clip();
    ctx.translate(plot.x + plot.width / 2, plot.y + plot.height / 2);
    ctx.rotate(angle);
    ctx.strokeStyle = crop.stripe;
    ctx.lineWidth = STRIPE_WIDTH;
    ctx.beginPath();
    for (let offset = -reach; offset <= reach; offset += spacing) {
      ctx.moveTo(-reach, offset);
      ctx.lineTo(reach, offset);
    }
    ctx.stroke();
  });
}
