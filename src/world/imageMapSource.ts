import type { MapSource } from './MapSource';

/** Usa qualquer imagem quadrada (canvas, foto de satélite...) como mundo. */
export function createImageMapSource(image: CanvasImageSource, worldSize: number): MapSource {
  return {
    worldSize,
    drawRegion(ctx, region, dest) {
      ctx.drawImage(
        image,
        region.x,
        region.y,
        region.size,
        region.size,
        dest.x,
        dest.y,
        dest.width,
        dest.height,
      );
    },
  };
}

/**
 * Carrega uma imagem (por exemplo, um ortomosaico salvo em `public/`) para
 * substituir o mapa procedural. A imagem deve ser quadrada.
 */
export async function loadImageMapSource(url: string): Promise<MapSource> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return createImageMapSource(image, Math.min(image.naturalWidth, image.naturalHeight));
}
