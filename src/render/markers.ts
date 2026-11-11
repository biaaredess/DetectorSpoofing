import { UI_COLORS } from '../config';
import { withSaved } from '../canvas';
import type { Point } from '../geometry';
import { FULL_TURN } from '../geometry';

/** Marcadores desenhados por cima das imagens: pins, mira e contornos. */

const PIN = { headRadius: 14, height: 46, outline: 4, dotRadius: 5 };
const LABEL = {
  font: '800 17px Nunito, "Segoe UI", system-ui, sans-serif',
  padX: 8,
  height: 24,
  gap: 6,
};
const LABEL_RADIUS = 8;
const CROSSHAIR = { gap: 9, arm: 16, width: 3, outline: 6 };
const OUTLINE_DASH = [10, 8];
const OUTLINE_WIDTH = 3;

export function drawPin(
  ctx: CanvasRenderingContext2D,
  tip: Point,
  color: string,
  label?: string,
): void {
  const headY = tip.y - PIN.height + PIN.headRadius;
  withSaved(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.arc(tip.x, headY, PIN.headRadius, Math.PI * 0.8, Math.PI * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = UI_COLORS.border;
    ctx.lineWidth = PIN.outline;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tip.x, headY, PIN.dotRadius, 0, FULL_TURN);
    ctx.fillStyle = UI_COLORS.white;
    ctx.fill();
  });
  if (label) drawLabel(ctx, { x: tip.x, y: tip.y - PIN.height - LABEL.gap }, label, color);
}

/** Etiqueta em pílula, centralizada acima do ponto `bottom`. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  bottom: Point,
  text: string,
  color: string,
): void {
  withSaved(ctx, () => {
    ctx.font = LABEL.font;
    const width = ctx.measureText(text).width + LABEL.padX * 2;
    const x = bottom.x - width / 2;
    const y = bottom.y - LABEL.height;
    ctx.beginPath();
    ctx.roundRect(x, y, width, LABEL.height, LABEL_RADIUS);
    ctx.fillStyle = color;
    ctx.strokeStyle = UI_COLORS.border;
    ctx.lineWidth = OUTLINE_WIDTH;
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = UI_COLORS.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bottom.x, y + LABEL.height / 2 + 1);
  });
}

/** Mira no centro da câmera: o ponto exato onde o drone está. */
export function drawCrosshair(ctx: CanvasRenderingContext2D): void {
  const center = ctx.canvas.width / 2;
  const { gap, arm } = CROSSHAIR;
  const traceArms = (): void => {
    ctx.beginPath();
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      ctx.moveTo(center + dx * gap, center + dy * gap);
      ctx.lineTo(center + dx * (gap + arm), center + dy * (gap + arm));
    }
  };
  withSaved(ctx, () => {
    ctx.lineCap = 'round';
    traceArms();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = CROSSHAIR.outline;
    ctx.stroke();
    traceArms();
    ctx.strokeStyle = UI_COLORS.white;
    ctx.lineWidth = CROSSHAIR.width;
    ctx.stroke();
  });
}

/** Quadrado tracejado (opcionalmente girado) mostrando uma área vista. */
export function drawDashedSquare(
  ctx: CanvasRenderingContext2D,
  center: Point,
  halfSize: number,
  rotation: number,
  color: string,
): void {
  withSaved(ctx, () => {
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.setLineDash(OUTLINE_DASH);
    ctx.lineWidth = OUTLINE_WIDTH + 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.strokeRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
    ctx.lineWidth = OUTLINE_WIDTH;
    ctx.strokeStyle = color;
    ctx.strokeRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
  });
}

export function drawDashedLine(ctx: CanvasRenderingContext2D, from: Point, to: Point): void {
  withSaved(ctx, () => {
    ctx.setLineDash(OUTLINE_DASH);
    ctx.lineWidth = OUTLINE_WIDTH;
    ctx.strokeStyle = UI_COLORS.white;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });
}
