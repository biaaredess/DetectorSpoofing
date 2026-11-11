import { UI_COLORS, VIEW } from '../config';
import type { Point, Square } from '../geometry';
import { clamp, degToRad, squareAround, squareToRect } from '../geometry';
import type { Round } from '../game/types';
import type { MapSource } from '../world/MapSource';
import { drawDashedLine, drawDashedSquare, drawPin } from './markers';

/**
 * `question`: durante a rodada, só o pin laranja do GPS no centro.
 * `reveal`: depois da resposta, também a área que a câmera viu e o pin azul.
 */
export type SatelliteMode = 'question' | 'reveal';

/** Região do mundo mostrada enquanto o jogador decide. */
export function questionView(round: Round): Square {
  return squareAround(round.gpsPosition, VIEW.worldSpan);
}

/**
 * Região que enquadra o GPS e a posição real com folga. Num voo normal fica
 * igual à da pergunta; num ataque, afasta o "zoom" para caber os dois.
 */
export function revealView(round: Round, worldSize: number): Square {
  if (round.scenario.kind === 'normal') return questionView(round);
  const { gpsPosition: gps, realPosition: real } = round;
  const spread = Math.max(Math.abs(gps.x - real.x), Math.abs(gps.y - real.y));
  const size = Math.min(worldSize, spread + VIEW.worldSpan + VIEW.revealPadding * 2);
  const center = { x: (gps.x + real.x) / 2, y: (gps.y + real.y) / 2 };
  const half = size / 2;
  return squareAround(
    { x: clamp(center.x, half, worldSize - half), y: clamp(center.y, half, worldSize - half) },
    size,
  );
}

export function renderSatellite(
  ctx: CanvasRenderingContext2D,
  source: MapSource,
  view: Square,
  round: Round,
  mode: SatelliteMode,
): void {
  const size = ctx.canvas.width;
  const scale = size / view.size;
  const toCanvas = (point: Point): Point => ({
    x: (point.x - view.x) * scale,
    y: (point.y - view.y) * scale,
  });

  ctx.clearRect(0, 0, size, size);
  source.drawRegion(ctx, view, squareToRect({ x: 0, y: 0, size }));

  const gps = toCanvas(round.gpsPosition);
  if (mode === 'question') {
    drawPin(ctx, gps, UI_COLORS.orange);
    return;
  }

  if (round.scenario.kind === 'normal') {
    drawPin(ctx, gps, UI_COLORS.turquoise);
    return;
  }

  // A câmera mostra VIEW.worldSpan / escala do mundo, girada ao contrário.
  const real = toCanvas(round.realPosition);
  const { distortion } = round;
  const footprintHalf = (VIEW.worldSpan / distortion.scale / 2) * scale;
  drawDashedSquare(ctx, gps, (VIEW.worldSpan / 2) * scale, 0, UI_COLORS.orange);
  drawDashedSquare(
    ctx,
    real,
    footprintHalf,
    -degToRad(distortion.rotationDeg),
    UI_COLORS.turquoise,
  );
  drawDashedLine(ctx, gps, real);
  drawPin(ctx, gps, UI_COLORS.orange, 'GPS');
  drawPin(ctx, real, UI_COLORS.turquoise, 'DRONE');
}
