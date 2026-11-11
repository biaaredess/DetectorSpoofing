import { WEATHER } from '../../config';
import { withSaved } from '../../canvas';
import { FULL_TURN, degToRad } from '../../geometry';
import type { Rng } from '../../rng';
import { randomBetween, randomInt } from '../../rng';

/** Chuva: imagem mais escura, riscos diagonais e gotas grudadas na lente. */

const STREAK_COLOR = 'rgba(225, 235, 245, 0.38)';
const STREAK_WIDTH = { min: 0.8, max: 1.8 };
/** Uma gota funciona como lente: mostra um pedaço ampliado do que está atrás. */
const DROP_MAGNIFICATION = 1.7;
const DROP_RIM = 'rgba(10, 20, 30, 0.6)';
const DROP_RIM_WIDTH = 3;
const DROP_SHINE = 'rgba(255, 255, 255, 0.55)';
const DROP_SHINE_SCALE = 0.28;

export function paintRain(ctx: CanvasRenderingContext2D, rng: Rng): void {
  const size = ctx.canvas.width;
  const { darkenAlpha } = WEATHER.rain;
  ctx.fillStyle = `rgba(15, 25, 35, ${darkenAlpha})`;
  ctx.fillRect(0, 0, size, size);
  paintStreaks(ctx, rng, size);
  paintDrops(ctx, rng, size);
}

function paintStreaks(ctx: CanvasRenderingContext2D, rng: Rng, size: number): void {
  const { streakCount, streakLength, streakAngleDeg } = WEATHER.rain;
  const angle = degToRad(streakAngleDeg);
  ctx.strokeStyle = STREAK_COLOR;
  ctx.lineCap = 'round';
  for (let i = 0; i < streakCount; i++) {
    const length = randomBetween(rng, streakLength.min, streakLength.max);
    const x = rng() * size;
    const y = rng() * size;
    ctx.lineWidth = randomBetween(rng, STREAK_WIDTH.min, STREAK_WIDTH.max);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }
}

function paintDrops(ctx: CanvasRenderingContext2D, rng: Rng, size: number): void {
  const { dropCount, dropRadius } = WEATHER.rain;
  const count = randomInt(rng, dropCount.min, dropCount.max);
  for (let i = 0; i < count; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const radius = randomBetween(rng, dropRadius.min, dropRadius.max);
    withSaved(ctx, () => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, FULL_TURN);
      ctx.clip();
      const source = radius / DROP_MAGNIFICATION;
      ctx.drawImage(
        ctx.canvas,
        x - source,
        y - source,
        source * 2,
        source * 2,
        x - radius,
        y - radius,
        radius * 2,
        radius * 2,
      );
      ctx.strokeStyle = DROP_RIM;
      ctx.lineWidth = DROP_RIM_WIDTH;
      ctx.stroke();
    });
    ctx.fillStyle = DROP_SHINE;
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius * DROP_SHINE_SCALE, 0, FULL_TURN);
    ctx.fill();
  }
}
