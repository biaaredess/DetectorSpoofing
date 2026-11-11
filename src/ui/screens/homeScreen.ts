import { LEVELS, ROUNDS_PER_LEVEL, TIMING } from '../../config';
import { h, onClick } from '../dom';
import type { LeaderboardView } from '../leaderboardView';
import type { Screen } from './screen';

const MS_PER_SECOND = 1000;

export function createHomeScreen(board: LeaderboardView, onStart: () => void): Screen {
  const start = h(
    'button',
    { class: 'btn btn--orange', type: 'button' },
    'Começar',
    h('kbd', {}, 'Enter'),
  );
  onClick(start, onStart);

  const rounds = LEVELS.length * ROUNDS_PER_LEVEL;
  const seconds = TIMING.roundDurationMs / MS_PER_SECOND;

  const root = h(
    'section',
    { class: 'screen' },
    h(
      'div',
      { class: 'home' },
      h(
        'div',
        { class: 'card home__main' },
        h('span', { class: 'pill' }, 'GPS spoofing em drones'),
        h('h1', { class: 'home__title' }, 'Você é o ', h('span', {}, 'detector')),
        h(
          'p',
          { class: 'home__lead' },
          'Num ataque de GPS spoofing, alguém manda um sinal de GPS falso e o drone passa a “achar” que está em outro lugar. Sua missão: comparar a câmera com o satélite e descobrir quando o GPS está mentindo.',
        ),
        h(
          'ol',
          { class: 'steps' },
          h(
            'li',
            { class: 'is-camera' },
            h('strong', {}, 'Câmera do drone'),
            'Mostra o chão onde o drone está de verdade.',
          ),
          h(
            'li',
            { class: 'is-satellite' },
            h('strong', {}, 'Satélite'),
            'Mostra onde o GPS diz que ele está (pin laranja).',
          ),
          h(
            'li',
            {},
            h('strong', {}, 'Bate ou não bate?'),
            'Mesmas formas: ',
            h('kbd', {}, '←'),
            ' voo normal. Diferentes: ',
            h('kbd', {}, '→'),
            ' ataque!',
          ),
        ),
        h(
          'div',
          { class: 'home__start' },
          start,
          h(
            'p',
            { class: 'home__meta' },
            `${rounds} rodadas · ${seconds} segundos cada · ${LEVELS.length} climas`,
          ),
        ),
      ),
      h('aside', { class: 'card' }, board.root),
    ),
  );

  return {
    root,
    focus: () => start.focus(),
    dispose: () => undefined,
  };
}
