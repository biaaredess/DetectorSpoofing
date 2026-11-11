// Fontes embutidas no build (só o subconjunto latino), para funcionar sem internet.
import '@fontsource/luckiest-guy/latin-400.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles/main.css';

import { freshSeed } from './rng';
import { browserStorage, dailyLeaderboard } from './storage';
import { App } from './ui/app';
import { createProceduralMap } from './world/proceduralMap';

function bootstrap(): void {
  const root = document.getElementById('app');
  if (!root) throw new Error('Elemento #app não encontrado');

  const app = new App({
    root,
    map: createProceduralMap(),
    leaderboard: dailyLeaderboard(browserStorage()),
    newSeed: freshSeed,
  });
  app.start();
}

bootstrap();
