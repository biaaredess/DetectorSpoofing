import type { LevelConfig } from '../config';
import { LEVELS } from '../config';
import { evaluateAnswer, timeoutResult } from './scoring';
import type { Round, RoundResult, Verdict } from './types';

/**
 * Máquina de estados da partida:
 *
 *   intro → levelIntro → playing → feedback ─┬→ playing     (mesmo nível)
 *     ↑          ↑                           ├→ levelIntro  (próximo nível)
 *     │          └──────── start ── end ←────┘              (última rodada)
 *     └───────────────────  home ────┘
 */
export type Phase =
  | { readonly name: 'intro' }
  | { readonly name: 'levelIntro'; readonly levelIndex: number }
  | { readonly name: 'playing'; readonly roundIndex: number }
  | { readonly name: 'feedback'; readonly roundIndex: number }
  | { readonly name: 'end' };

export type PhaseName = Phase['name'];

export interface GameState {
  readonly phase: Phase;
  readonly rounds: readonly Round[];
  /** Um resultado por rodada já respondida, na mesma ordem de `rounds`. */
  readonly results: readonly RoundResult[];
}

export type GameEvent =
  | { readonly type: 'start'; readonly rounds: readonly Round[] }
  | { readonly type: 'beginLevel' }
  | { readonly type: 'answer'; readonly answer: Verdict; readonly timeLeftMs: number }
  | { readonly type: 'timeout' }
  | { readonly type: 'next' }
  | { readonly type: 'home' };

export function initialState(): GameState {
  return { phase: { name: 'intro' }, rounds: [], results: [] };
}

/**
 * Função pura de transição. Eventos que não fazem sentido na fase atual
 * (um clique duplo, uma tecla atrasada) devolvem o mesmo estado.
 */
export function transition(state: GameState, event: GameEvent): GameState {
  const { phase } = state;
  switch (event.type) {
    case 'start':
      if (phase.name !== 'intro' && phase.name !== 'end') return state;
      if (event.rounds.length === 0) return state;
      return { phase: levelIntroFor(event.rounds, 0), rounds: event.rounds, results: [] };

    case 'beginLevel':
      if (phase.name !== 'levelIntro') return state;
      return { ...state, phase: { name: 'playing', roundIndex: state.results.length } };

    case 'answer':
    case 'timeout': {
      if (phase.name !== 'playing') return state;
      const round = state.rounds[phase.roundIndex];
      if (!round) return state;
      const result =
        event.type === 'answer'
          ? evaluateAnswer(round, event.answer, event.timeLeftMs)
          : timeoutResult();
      return {
        ...state,
        phase: { name: 'feedback', roundIndex: phase.roundIndex },
        results: [...state.results, result],
      };
    }

    case 'next': {
      if (phase.name !== 'feedback') return state;
      const nextIndex = phase.roundIndex + 1;
      const current = state.rounds[phase.roundIndex];
      const upcoming = state.rounds[nextIndex];
      if (!current || !upcoming) return { ...state, phase: { name: 'end' } };
      if (upcoming.levelIndex !== current.levelIndex) {
        return { ...state, phase: levelIntroFor(state.rounds, nextIndex) };
      }
      return { ...state, phase: { name: 'playing', roundIndex: nextIndex } };
    }

    case 'home':
      return phase.name === 'end' ? initialState() : state;
  }
}

function levelIntroFor(rounds: readonly Round[], roundIndex: number): Phase {
  return { name: 'levelIntro', levelIndex: rounds[roundIndex]?.levelIndex ?? 0 };
}

export function currentRound(state: GameState): Round | undefined {
  const { phase } = state;
  if (phase.name !== 'playing' && phase.name !== 'feedback') return undefined;
  return state.rounds[phase.roundIndex];
}

export function levelOf(round: Round): LevelConfig {
  const level = LEVELS[round.levelIndex];
  if (!level) throw new Error(`Nível inexistente: ${round.levelIndex}`);
  return level;
}
