import type { WeatherKind } from '../../config';
import type { Rng } from '../../rng';
import { paintFog } from './fog';
import { paintNight } from './night';
import { paintRain } from './rain';
import { paintVignette } from './vignette';

/** Aplica o clima do nível e, por fim, a vinheta da lente (em todos os níveis). */
export function applyWeather(ctx: CanvasRenderingContext2D, weather: WeatherKind, rng: Rng): void {
  switch (weather) {
    case 'clear':
      break;
    case 'fog':
      paintFog(ctx, rng);
      break;
    case 'rain':
      paintRain(ctx, rng);
      break;
    case 'night':
      paintNight(ctx, rng);
      break;
  }
  paintVignette(ctx);
}
