import { LEADERBOARD } from '../../config';
import type { SaveOutcome } from '../../storage';
import { sanitizeName } from '../../storage';
import { formatNumber, formatPercent, h, onClick } from '../dom';
import type { LeaderboardView } from '../leaderboardView';
import type { Screen } from './screen';

export interface LevelSummary {
  readonly name: string;
  readonly accuracy: number;
  readonly isWorst: boolean;
}

export interface GameSummary {
  readonly points: number;
  readonly hits: number;
  readonly totalRounds: number;
  readonly levels: readonly LevelSummary[];
}

export interface EndHandlers {
  /** Recebe o nome já limpo; devolve o que aconteceu ao salvar. */
  readonly onSave: (name: string) => SaveOutcome;
  readonly onRestart: () => void;
  readonly onHome: () => void;
}

const RESEARCH_NOTE =
  'Os detectores que já existem têm o mesmo problema: pioram com mau tempo. Fazer a detecção funcionar em qualquer clima é um dos objetivos da pesquisa.';

export function createEndScreen(
  summary: GameSummary,
  board: LeaderboardView,
  handlers: EndHandlers,
): Screen {
  const title = h('h1', { class: 'end__title', tabindex: -1 }, 'Fim de missão!');
  const restart = h('button', { class: 'btn btn--orange', type: 'button' }, 'Jogar de novo');
  const home = h('button', { class: 'btn', type: 'button' }, 'Tela inicial');
  onClick(restart, handlers.onRestart);
  onClick(home, handlers.onHome);

  board.insertBelowTitle(createSaveForm(handlers.onSave));

  const root = h(
    'section',
    { class: 'screen' },
    h(
      'div',
      { class: 'end' },
      h(
        'div',
        { class: 'card end__summary' },
        title,
        h(
          'div',
          { class: 'end__score' },
          h('span', { class: 'end__points' }, `${formatNumber(summary.points)} pts`),
          h('span', { class: 'end__hits' }, `${summary.hits} de ${summary.totalRounds} acertos`),
        ),
        h('h2', { class: 'end__subtitle' }, 'Acerto por nível'),
        h('ul', { class: 'bars' }, ...summary.levels.map(levelBar)),
        researchCallout(summary.levels.find((level) => level.isWorst)),
      ),
      h('aside', { class: 'card' }, board.root),
      h('div', { class: 'end__actions' }, restart, home),
    ),
  );

  return { root, focus: () => title.focus(), dispose: () => undefined };
}

function levelBar(level: LevelSummary): HTMLLIElement {
  const percent = formatPercent(level.accuracy);
  const fill = h('div', {
    class: level.accuracy === 0 ? 'bar__fill is-empty' : 'bar__fill',
    style: `width: ${percent}`,
  });
  return h(
    'li',
    { class: level.isWorst ? 'bar is-worst' : 'bar' },
    h('span', {}, level.name),
    h(
      'div',
      { class: 'bar__track', role: 'img', 'aria-label': `${level.name}: ${percent} de acerto` },
      fill,
    ),
    h('span', { class: 'bar__value' }, percent),
  );
}

function researchCallout(worst: LevelSummary | undefined): HTMLElement {
  if (!worst) {
    return h(
      'p',
      { class: 'callout' },
      h('strong', {}, 'Você acertou tudo, em todos os climas! '),
      RESEARCH_NOTE,
    );
  }
  return h(
    'p',
    { class: 'callout callout--orange' },
    'Você errou mais em ',
    h('strong', {}, worst.name),
    '. ',
    RESEARCH_NOTE,
  );
}

function createSaveForm(onSave: EndHandlers['onSave']): HTMLElement {
  const input = h('input', {
    id: 'player-name',
    name: 'name',
    type: 'text',
    maxlength: LEADERBOARD.maxNameLength,
    autocomplete: 'off',
    placeholder: 'Seu nome ou apelido',
  });
  const message = h('p', { class: 'save-form__message', 'aria-live': 'polite' });
  const form = h(
    'form',
    { class: 'save-form' },
    h('label', { for: 'player-name' }, 'Entre no placar do dia'),
    input,
    h('button', { class: 'btn btn--small btn--turquoise', type: 'submit' }, 'Salvar'),
    message,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = sanitizeName(input.value);
    if (!name) {
      message.textContent = 'Escreva um nome para entrar no placar.';
      input.focus();
      return;
    }
    const note = h('p', { class: 'saved-note', role: 'status' }, savedMessage(onSave(name)));
    form.replaceWith(note);
  });
  return form;
}

function savedMessage(outcome: SaveOutcome): string {
  if (!outcome.persisted) return 'Não deu para guardar o placar neste navegador.';
  if (outcome.position === null) return 'Ficou fora do top 10 de hoje. Tente de novo!';
  return `Salvo! Você está em ${outcome.position + 1}º lugar hoje.`;
}
