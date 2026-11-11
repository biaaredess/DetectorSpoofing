import type { LevelConfig } from '../../config';
import { TIMING, VIEW } from '../../config';
import { context2d } from '../../canvas';
import type { Explanation } from '../../game/feedback';
import type { Round, RoundOutcome, RoundResult, Verdict } from '../../game/types';
import { easeOutCubic, lerpSquare } from '../../geometry';
import { renderCamera } from '../../render/camera';
import { questionView, renderSatellite, revealView } from '../../render/satellite';
import type { MapSource } from '../../world/MapSource';
import { formatNumber, h, onClick } from '../dom';
import { prefersReducedMotion } from '../motion';
import type { Screen } from './screen';

const MS_PER_SECOND = 1000;

const BADGES: Readonly<Record<RoundOutcome, string>> = {
  correct: '✓',
  wrong: '✗',
  timeout: '!',
};

export interface PlayHandlers {
  readonly onAnswer: (verdict: Verdict) => void;
  readonly onNext: () => void;
}

export interface RoundInfo {
  readonly round: Round;
  readonly level: LevelConfig;
  readonly roundNumber: number;
  readonly totalRounds: number;
  readonly score: number;
}

/**
 * Tela da partida. Fica montada durante as rodadas de um mesmo nível e só
 * troca o conteúdo: pergunta (`showRound`) e resposta (`showFeedback`).
 */
export class PlayScreen implements Screen {
  readonly root: HTMLElement;
  private readonly cameraCtx: CanvasRenderingContext2D;
  private readonly satelliteCtx: CanvasRenderingContext2D;
  private readonly views: HTMLElement;
  private readonly levelPill = h('span', { class: 'pill' });
  private readonly roundLabel = h('p', { class: 'hud__round' });
  private readonly scoreLabel = h('span', { class: 'pill pill--light hud__score' });
  private readonly timer = h('div', { class: 'timer', 'aria-hidden': 'true' });
  private readonly timerFill = h('div', { class: 'timer__fill' });
  private readonly timerSeconds = h('span', { class: 'timer__seconds' });
  private readonly answers: HTMLElement;
  private readonly feedback = h('div', {
    class: 'feedback card is-idle',
    role: 'status',
    'aria-live': 'polite',
  });
  private revealFrame = 0;

  constructor(
    private readonly map: MapSource,
    private readonly handlers: PlayHandlers,
  ) {
    const camera = createViewCanvas('Imagem da câmera do drone');
    const satellite = createViewCanvas('Imagem de satélite do lugar indicado pelo GPS');
    this.cameraCtx = context2d(camera);
    this.satelliteCtx = context2d(satellite);

    this.views = h(
      'div',
      { class: 'views', tabindex: -1, 'aria-label': 'Compare as duas imagens' },
      viewCard('camera', 'Câmera do drone', 'posição real', camera),
      viewCard('satellite', 'Satélite', 'onde o GPS diz', satellite),
    );

    const normal = answerButton('btn--turquoise', [h('kbd', {}, '←'), 'Voo normal']);
    const attack = answerButton('btn--orange', ['Ataque!', h('kbd', {}, '→')]);
    onClick(normal, () => this.handlers.onAnswer('normal'));
    onClick(attack, () => this.handlers.onAnswer('attack'));
    this.answers = h('div', { class: 'answers' }, normal, attack);

    this.timer.append(h('div', { class: 'timer__track' }, this.timerFill), this.timerSeconds);

    this.root = h(
      'section',
      { class: 'play', 'aria-label': 'Partida' },
      h('header', { class: 'hud' }, this.levelPill, this.roundLabel, this.scoreLabel),
      this.timer,
      this.views,
      h('div', { class: 'bottom' }, this.answers, this.feedback),
    );
  }

  showRound(info: RoundInfo): void {
    this.cancelReveal();
    const { round } = info;
    this.updateHud(info);
    this.root.removeAttribute('data-outcome');
    this.feedback.classList.add('is-idle');
    this.feedback.replaceChildren();
    this.answers.hidden = false;

    renderCamera(this.cameraCtx, this.map, round, info.level.weather);
    renderSatellite(this.satelliteCtx, this.map, questionView(round), round, 'question');
    this.setTimeLeft(TIMING.roundDurationMs);
  }

  setTimeLeft(timeLeftMs: number): void {
    const fraction = timeLeftMs / TIMING.roundDurationMs;
    this.timerFill.style.transform = `scaleX(${fraction})`;
    this.timerSeconds.textContent = `${Math.ceil(timeLeftMs / MS_PER_SECOND)} s`;
    this.timer.classList.toggle('is-warning', timeLeftMs <= TIMING.timerWarningMs);
  }

  showFeedback(info: RoundInfo, result: RoundResult, explanation: Explanation): void {
    this.updateHud(info);
    this.root.dataset.outcome = result.outcome;
    this.answers.hidden = true;

    const next = h(
      'button',
      {
        class: 'btn btn--small feedback__next auto-advance',
        type: 'button',
        style: `--auto-advance-ms: ${TIMING.feedbackAutoAdvanceMs}ms`,
      },
      'Próxima',
      h('kbd', {}, 'Enter'),
    );
    onClick(next, () => this.handlers.onNext());

    this.feedback.dataset.outcome = result.outcome;
    this.feedback.replaceChildren(
      h('span', { class: 'feedback__badge', 'aria-hidden': 'true' }, BADGES[result.outcome]),
      h(
        'div',
        {},
        h('h2', { class: 'feedback__title' }, explanation.title),
        h('p', { class: 'feedback__reason' }, explanation.reason),
      ),
      next,
    );
    this.feedback.classList.remove('is-idle');
    next.focus();

    this.animateReveal(info.round);
  }

  focus(): void {
    this.views.focus();
  }

  dispose(): void {
    this.cancelReveal();
  }

  private updateHud(info: RoundInfo): void {
    this.levelPill.textContent = `Nível ${info.round.levelIndex + 1} · ${info.level.name}`;
    this.roundLabel.textContent = `Rodada ${info.roundNumber} de ${info.totalRounds}`;
    this.scoreLabel.textContent = `${formatNumber(info.score)} pts`;
  }

  /** Afasta o "zoom" do satélite até mostrar onde o drone estava de verdade. */
  private animateReveal(round: Round): void {
    this.cancelReveal();
    const from = questionView(round);
    const to = revealView(round, this.map.worldSize);
    const draw = (t: number): void =>
      renderSatellite(this.satelliteCtx, this.map, lerpSquare(from, to, t), round, 'reveal');

    if (prefersReducedMotion() || from.size === to.size) {
      draw(1);
      return;
    }
    const startedAt = performance.now();
    const step = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / TIMING.revealAnimationMs);
      draw(easeOutCubic(progress));
      if (progress < 1) this.revealFrame = requestAnimationFrame(step);
    };
    this.revealFrame = requestAnimationFrame(step);
  }

  private cancelReveal(): void {
    cancelAnimationFrame(this.revealFrame);
  }
}

function createViewCanvas(label: string): HTMLCanvasElement {
  return h('canvas', {
    width: VIEW.canvasSize,
    height: VIEW.canvasSize,
    role: 'img',
    'aria-label': label,
  });
}

function viewCard(
  kind: 'camera' | 'satellite',
  title: string,
  subtitle: string,
  canvas: HTMLCanvasElement,
): HTMLElement {
  const pillColor = kind === 'camera' ? 'pill--turquoise' : '';
  return h(
    'figure',
    { class: `card view view--${kind}` },
    h('figcaption', { class: `pill view__label ${pillColor}` }, title, h('small', {}, subtitle)),
    canvas,
  );
}

function answerButton(variant: string, content: (HTMLElement | string)[]): HTMLButtonElement {
  return h('button', { class: `btn ${variant}`, type: 'button' }, ...content);
}
