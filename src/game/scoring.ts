import { SCORING } from '../config';
import type { Round, RoundResult, Verdict } from './types';
import { truthOf } from './types';

/** Acerto vale a base mais um ponto por décimo de segundo que sobrou. */
export function pointsFor(isCorrect: boolean, timeLeftMs: number): number {
  if (!isCorrect) return 0;
  const tenthsLeft = Math.floor(Math.max(0, timeLeftMs) / SCORING.msPerBonusStep);
  return SCORING.correctAnswerPoints + tenthsLeft * SCORING.bonusPerTenthOfSecond;
}

export function evaluateAnswer(round: Round, answer: Verdict, timeLeftMs: number): RoundResult {
  const isCorrect = answer === truthOf(round.scenario);
  return {
    answer,
    outcome: isCorrect ? 'correct' : 'wrong',
    points: pointsFor(isCorrect, timeLeftMs),
    timeLeftMs,
  };
}

export function timeoutResult(): RoundResult {
  return { answer: null, outcome: 'timeout', points: 0, timeLeftMs: 0 };
}

export function totalPoints(results: readonly RoundResult[]): number {
  return results.reduce((sum, result) => sum + result.points, 0);
}

export function correctCount(results: readonly RoundResult[]): number {
  return results.filter((result) => result.outcome === 'correct').length;
}
