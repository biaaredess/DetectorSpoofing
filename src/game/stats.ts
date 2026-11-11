import type { LevelStats, Round, RoundResult } from './types';

/** Taxa de acerto de cada nível, na ordem dos níveis. */
export function accuracyByLevel(
  rounds: readonly Round[],
  results: readonly RoundResult[],
  levelCount: number,
): LevelStats[] {
  return Array.from({ length: levelCount }, (_, levelIndex) => {
    const levelResults = rounds
      .map((round, i) => ({ round, result: results[i] }))
      .filter(({ round, result }) => round.levelIndex === levelIndex && result !== undefined);
    const correct = levelResults.filter(({ result }) => result?.outcome === 'correct').length;
    const total = levelResults.length;
    return { levelIndex, correct, total, accuracy: total === 0 ? 0 : correct / total };
  });
}

/**
 * Nível em que a pessoa mais errou, ou `null` se ela não errou nenhum.
 * No empate fica o nível mais adiante, que tem o clima mais difícil.
 */
export function worstLevel(stats: readonly LevelStats[]): LevelStats | null {
  const played = stats.filter((level) => level.total > 0);
  if (played.every((level) => level.correct === level.total)) return null;
  return played.reduce((worst, level) => (level.accuracy <= worst.accuracy ? level : worst));
}
