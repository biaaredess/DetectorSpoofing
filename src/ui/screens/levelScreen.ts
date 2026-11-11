import type { LevelConfig } from '../../config';
import { TIMING } from '../../config';
import { h, onClick, svgFromMarkup } from '../dom';
import { weatherIcon } from '../icons';
import type { Screen } from './screen';

/** Apresentação curta antes de cada nível; avança sozinha. */
export function createLevelScreen(
  level: LevelConfig,
  levelIndex: number,
  levelCount: number,
  onBegin: () => void,
): Screen {
  const begin = h(
    'button',
    {
      class: 'btn btn--orange auto-advance',
      type: 'button',
      style: `--auto-advance-ms: ${TIMING.levelIntroAutoAdvanceMs}ms`,
    },
    'Vamos!',
    h('kbd', {}, 'Enter'),
  );
  onClick(begin, onBegin);

  const icon = svgFromMarkup(weatherIcon(level.weather));
  icon.classList.add('level__icon');

  const root = h(
    'section',
    { class: 'screen' },
    h(
      'div',
      { class: 'card level' },
      icon,
      h('span', { class: 'pill pill--light' }, `Nível ${levelIndex + 1} de ${levelCount}`),
      h('h1', { class: 'level__title' }, level.name),
      h('p', { class: 'level__tagline' }, level.tagline),
      begin,
    ),
  );

  return { root, focus: () => begin.focus(), dispose: () => undefined };
}
