/** Pequenos utilitários de canvas compartilhados por `world/` e `render/`. */

export function createCanvas(width: number, height: number = width): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível neste navegador');
  return ctx;
}

/** Safari antigo ignora `ctx.filter`; nesse caso pulamos só o desfoque. */
export function supportsCanvasFilter(ctx: CanvasRenderingContext2D): boolean {
  return typeof ctx.filter === 'string';
}

/** Executa `draw` entre save/restore, para nenhum estado vazar. */
export function withSaved(ctx: CanvasRenderingContext2D, draw: () => void): void {
  ctx.save();
  try {
    draw();
  } finally {
    ctx.restore();
  }
}
