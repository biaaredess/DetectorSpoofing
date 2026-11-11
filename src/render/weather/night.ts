import { WEATHER } from '../../config';
import { context2d, createCanvas, withSaved } from '../../canvas';
import type { Rng } from '../../rng';
import { randomBetween, randomInt } from '../../rng';

/** Noite: imagem bem escura, ruído de sensor e alguns pontos de luz. */

const CHANNELS = 4;
const MAX_BYTE = 255;

export function paintNight(ctx: CanvasRenderingContext2D, rng: Rng): void {
  const size = ctx.canvas.width;
  const { darkness, extraDarkAlpha } = WEATHER.night;

  withSaved(ctx, () => {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = darkness;
    ctx.fillRect(0, 0, size, size);
  });
  ctx.fillStyle = `rgba(0, 0, 10, ${extraDarkAlpha})`;
  ctx.fillRect(0, 0, size, size);

  paintLights(ctx, rng, size);
  paintSensorNoise(ctx, rng, size);
}

function paintLights(ctx: CanvasRenderingContext2D, rng: Rng, size: number): void {
  const { lightCount, lightRadius, lightColor } = WEATHER.night;
  withSaved(ctx, () => {
    ctx.globalCompositeOperation = 'lighter';
    const count = randomInt(rng, lightCount.min, lightCount.max);
    for (let i = 0; i < count; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const radius = randomBetween(rng, lightRadius.min, lightRadius.max);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(${lightColor}, 0.95)`);
      glow.addColorStop(1, `rgba(${lightColor}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  });
}

function paintSensorNoise(ctx: CanvasRenderingContext2D, rng: Rng, size: number): void {
  const noise = createCanvas(size);
  const noiseCtx = context2d(noise);
  const pixels = noiseCtx.createImageData(size, size);
  const alpha = Math.round(MAX_BYTE * WEATHER.night.noiseAlpha);
  for (let i = 0; i < pixels.data.length; i += CHANNELS) {
    const shade = Math.round(rng() * MAX_BYTE);
    pixels.data[i] = shade;
    pixels.data[i + 1] = shade;
    pixels.data[i + 2] = shade;
    pixels.data[i + 3] = alpha;
  }
  noiseCtx.putImageData(pixels, 0, 0);
  ctx.drawImage(noise, 0, 0);
}
