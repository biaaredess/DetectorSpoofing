import type { Rect } from '../../geometry';
import type { Rng } from '../../rng';

/** Cada tipo de zona sabe se pintar dentro do seu quadrado da grade. */
export type ZonePainter = (ctx: CanvasRenderingContext2D, area: Rect, rng: Rng) => void;
