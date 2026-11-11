import type { WeatherKind } from '../config';
import { VIEW } from '../config';
import { supportsCanvasFilter, withSaved } from '../canvas';
import { degToRad, squareAround } from '../geometry';
import type { Round } from '../game/types';
import { createRng } from '../rng';
import type { MapSource } from '../world/MapSource';
import { drawCrosshair } from './markers';
import { applyWeather } from './weather';

/**
 * Lado da região do mundo copiada antes de girar. Precisa cobrir a diagonal
 * do canvas mesmo com a menor escala (0,92) e a maior rotação.
 */
const ROTATION_COVERAGE = 1.6;

/**
 * Foto da câmera do drone: o chão sob a posição *real*, girado, com outra
 * escala, outro tom e um pouco de desfoque, e depois o clima por cima.
 */
export function renderCamera(
  ctx: CanvasRenderingContext2D,
  source: MapSource,
  round: Round,
  weather: WeatherKind,
): void {
  const size = ctx.canvas.width;
  const { distortion } = round;
  const span = VIEW.worldSpan * ROTATION_COVERAGE;
  const pixelsPerWorldUnit = (size / VIEW.worldSpan) * distortion.scale;

  ctx.clearRect(0, 0, size, size);
  withSaved(ctx, () => {
    if (supportsCanvasFilter(ctx)) {
      ctx.filter = `blur(${distortion.blurPx}px) hue-rotate(${distortion.hueShiftDeg}deg)`;
    }
    ctx.translate(size / 2, size / 2);
    ctx.rotate(degToRad(distortion.rotationDeg));
    ctx.scale(pixelsPerWorldUnit, pixelsPerWorldUnit);
    source.drawRegion(ctx, squareAround(round.realPosition, span), {
      x: -span / 2,
      y: -span / 2,
      width: span,
      height: span,
    });
  });

  withSaved(ctx, () => {
    ctx.globalAlpha = distortion.tintAlpha;
    ctx.fillStyle = distortion.tint;
    ctx.fillRect(0, 0, size, size);
  });

  applyWeather(ctx, weather, createRng(round.weatherSeed));
  drawCrosshair(ctx);
}
