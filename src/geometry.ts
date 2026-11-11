export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Quadrado alinhado aos eixos, dado pelo canto superior esquerdo. */
export interface Square {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const FULL_TURN = Math.PI * 2;

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pointAtAngle(origin: Point, radius: number, angle: number): Point {
  return { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius };
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function squareAround(center: Point, size: number): Square {
  return { x: center.x - size / 2, y: center.y - size / 2, size };
}

export function squareCenter(square: Square): Point {
  return { x: square.x + square.size / 2, y: square.y + square.size / 2 };
}

export function squareToRect(square: Square): Rect {
  return { x: square.x, y: square.y, width: square.size, height: square.size };
}

export function insetRect(rect: Rect, inset: number): Rect {
  return {
    x: rect.x + inset,
    y: rect.y + inset,
    width: rect.width - inset * 2,
    height: rect.height - inset * 2,
  };
}

export function lerpSquare(from: Square, to: Square, t: number): Square {
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), size: lerp(from.size, to.size, t) };
}

/** Desaceleração suave usada nas animações. */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
