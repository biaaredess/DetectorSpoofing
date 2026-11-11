import { WEATHER } from '../../config';
import type { Rng } from '../../rng';
import { randomBetween, randomInt } from '../../rng';

/** Neblina: véu branco uniforme e manchas mais densas aqui e ali. */
export function paintFog(ctx: CanvasRenderingContext2D, rng: Rng): void {
  const size = ctx.canvas.width;
  const { veilAlpha, patchCount, patchRadius, patchAlpha, color } = WEATHER.fog;

  ctx.fillStyle = `rgba(${color}, ${veilAlpha})`;
  ctx.fillRect(0, 0, size, size);

  const patches = randomInt(rng, patchCount.min, patchCount.max);
  for (let i = 0; i < patches; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const radius = randomBetween(rng, patchRadius.min, patchRadius.max);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(
      0,
      `rgba(${color}, ${randomBetween(rng, patchAlpha.min, patchAlpha.max)})`,
    );
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
}
