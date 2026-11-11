import { LEVELS, TIMING } from '../config';
import { explain } from '../game/feedback';
import type { GameEvent, GameState, Phase } from '../game/machine';
import { currentRound, initialState, levelOf, transition } from '../game/machine';
import { drawRounds } from '../game/rounds';
import { correctCount, totalPoints } from '../game/scoring';
import { accuracyByLevel, worstLevel } from '../game/stats';
import type { Verdict } from '../game/types';
import { createRng } from '../rng';
import type { DailyLeaderboard } from '../storage';
import type { MapSource } from '../world/MapSource';
import { intentFor } from './keyboard';
import { LeaderboardView } from './leaderboardView';
import { PhaseTimers } from './phaseTimers';
import { RoundTimer } from './roundTimer';
import type { GameSummary } from './screens/endScreen';
import { createEndScreen } from './screens/endScreen';
import { createHomeScreen } from './screens/homeScreen';
import { createLevelScreen } from './screens/levelScreen';
import type { RoundInfo } from './screens/playScreen';
import { PlayScreen } from './screens/playScreen';
import type { Screen } from './screens/screen';

export interface AppDependencies {
  readonly root: HTMLElement;
  readonly map: MapSource;
  readonly leaderboard: DailyLeaderboard;
  /** Seed de cada partida nova. */
  readonly newSeed: () => number;
}

/**
 * Liga a máquina de estados (pura) ao mundo real: telas, relógio, teclado e
 * placar. Toda mudança passa por `dispatch`, e `enter` reage à fase nova.
 */
export class App {
  private state: GameState = initialState();
  private screen: Screen | null = null;
  private playScreen: PlayScreen | null = null;
  private readonly phaseTimers = new PhaseTimers();
  private readonly roundTimer = new RoundTimer(
    TIMING.roundDurationMs,
    (timeLeftMs) => this.playScreen?.setTimeLeft(timeLeftMs),
    () => this.dispatch({ type: 'timeout' }),
  );

  constructor(private readonly deps: AppDependencies) {}

  start(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    this.enter(this.state.phase);
  }

  private dispatch(event: GameEvent): void {
    const next = transition(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.enter(next.phase);
  }

  private enter(phase: Phase): void {
    this.phaseTimers.clear();
    this.roundTimer.stop();

    switch (phase.name) {
      case 'intro':
        this.show(createHomeScreen(new LeaderboardView(this.deps.leaderboard), this.startGame));
        break;

      case 'levelIntro': {
        const level = LEVELS[phase.levelIndex];
        if (!level) return;
        const begin = (): void => this.dispatch({ type: 'beginLevel' });
        this.show(createLevelScreen(level, phase.levelIndex, LEVELS.length, begin));
        this.phaseTimers.after(TIMING.levelIntroAutoAdvanceMs, begin);
        break;
      }

      case 'playing': {
        const info = this.roundInfo();
        if (!info) return;
        const play = this.ensurePlayScreen();
        play.showRound(info);
        play.focus();
        this.roundTimer.start();
        break;
      }

      case 'feedback': {
        const info = this.roundInfo();
        const result = this.state.results[phase.roundIndex];
        if (!info || !result) return;
        this.ensurePlayScreen().showFeedback(info, result, explain(info.round, result));
        this.phaseTimers.after(TIMING.feedbackAutoAdvanceMs, () => this.dispatch({ type: 'next' }));
        break;
      }

      case 'end':
        this.showEndScreen();
        break;
    }
  }

  private readonly startGame = (): void => {
    const rounds = drawRounds(createRng(this.deps.newSeed()), {
      worldSize: this.deps.map.worldSize,
    });
    this.dispatch({ type: 'start', rounds });
  };

  private answer(verdict: Verdict): void {
    this.dispatch({ type: 'answer', answer: verdict, timeLeftMs: this.roundTimer.timeLeft() });
  }

  private confirm(): void {
    switch (this.state.phase.name) {
      case 'intro':
        this.startGame();
        break;
      case 'levelIntro':
        this.dispatch({ type: 'beginLevel' });
        break;
      case 'feedback':
        this.dispatch({ type: 'next' });
        break;
      case 'playing':
      case 'end':
        break;
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const intent = intentFor(this.state.phase.name, event);
    if (!intent) return;
    event.preventDefault();
    if (intent.kind === 'answer') this.answer(intent.verdict);
    else this.confirm();
  };

  private roundInfo(): RoundInfo | null {
    const round = currentRound(this.state);
    if (!round || (this.state.phase.name !== 'playing' && this.state.phase.name !== 'feedback')) {
      return null;
    }
    return {
      round,
      level: levelOf(round),
      roundNumber: this.state.phase.roundIndex + 1,
      totalRounds: this.state.rounds.length,
      score: totalPoints(this.state.results),
    };
  }

  private showEndScreen(): void {
    const { rounds, results } = this.state;
    const stats = accuracyByLevel(rounds, results, LEVELS.length);
    const worst = worstLevel(stats);
    const summary: GameSummary = {
      points: totalPoints(results),
      hits: correctCount(results),
      totalRounds: rounds.length,
      levels: stats.map((level) => ({
        name: LEVELS[level.levelIndex]?.name ?? '',
        accuracy: level.accuracy,
        isWorst: level.levelIndex === worst?.levelIndex,
      })),
    };

    const board = new LeaderboardView(this.deps.leaderboard);
    this.show(
      createEndScreen(summary, board, {
        onSave: (name) => {
          const entry = { name, score: summary.points, hits: summary.hits, savedAt: Date.now() };
          const outcome = this.deps.leaderboard.save(entry);
          board.refresh(entry);
          return outcome;
        },
        onRestart: this.startGame,
        onHome: () => this.dispatch({ type: 'home' }),
      }),
    );
  }

  /** A tela da partida é reaproveitada entre as rodadas de um mesmo nível. */
  private ensurePlayScreen(): PlayScreen {
    if (this.playScreen) return this.playScreen;
    const play = new PlayScreen(this.deps.map, {
      onAnswer: (verdict) => this.answer(verdict),
      onNext: () => this.dispatch({ type: 'next' }),
    });
    this.show(play);
    this.playScreen = play;
    return play;
  }

  private show(screen: Screen): void {
    this.screen?.dispose();
    this.playScreen = null;
    this.screen = screen;
    this.deps.root.replaceChildren(screen.root);
    screen.focus();
  }
}
