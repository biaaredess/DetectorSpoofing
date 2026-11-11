import { GRAIN } from '../../config';
import { context2d, createCanvas } from '../../canvas';
import type { Rng } from '../../rng';

/** Granulação leve, para o mapa não parecer vetorial demais. */

const CHANNELS = 4;
const MAX_BYTE = 255;

export function paintGrain(ctx: CanvasRenderingContext2D, worldSize: number, rng: Rng): void {
  const tile = createCanvas(GRAIN.tileSize);
  const tileCtx = context2d(tile);
  const pixels = tileCtx.createImageData(GRAIN.tileSize, GRAIN.tileSize);
  for (let i = 0; i < pixels.data.length; i += CHANNELS) {
    const shade = rng() < 0.5 ? 0 : MAX_BYTE;
    pixels.data[i] = shade;
    pixels.data[i + 1] = shade;
    pixels.data[i + 2] = shade;
    pixels.data[i + 3] = Math.round(rng() * MAX_BYTE * GRAIN.alpha);
  }
  tileCtx.putImageData(pixels, 0, 0);

  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, worldSize, worldSize);
}
