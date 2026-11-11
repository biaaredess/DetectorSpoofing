import { WEATHER } from '../../config';

/** Escurecimento nas bordas, como numa lente de câmera de verdade. */
export function paintVignette(ctx: CanvasRenderingContext2D): void {
  const size = ctx.canvas.width;
  const center = size / 2;
  const { innerRatio, outerRatio, alpha } = WEATHER.vignette;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    size * innerRatio,
    center,
    center,
    size * outerRatio,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}
