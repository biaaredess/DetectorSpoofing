import type { Rect, Square } from '../geometry';

/**
 * De onde vêm as imagens do chão. O jogo só conhece esta interface: hoje ela
 * é atendida por um mapa procedural, mas pode ser trocada por um recorte de
 * satélite real (veja `imageMapSource.ts` e o README).
 */
export interface MapSource {
  /** Lado do mundo em pixels; as posições das rodadas vão de 0 a `worldSize`. */
  readonly worldSize: number;
  /** Desenha a região `region` do mundo no retângulo `dest` do contexto. */
  drawRegion(ctx: CanvasRenderingContext2D, region: Square, dest: Rect): void;
}
