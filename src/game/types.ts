import type { Point } from '../geometry';

/** O que o jogador (ou o detector) responde em cada rodada. */
export type Verdict = 'normal' | 'attack';

export type AttackDistance = 'near' | 'far';

export type Scenario =
  { readonly kind: 'normal' } | { readonly kind: 'attack'; readonly distance: AttackDistance };

/** Como a foto do drone difere da imagem de satélite do mesmo lugar. */
export interface CameraDistortion {
  readonly rotationDeg: number;
  readonly scale: number;
  readonly hueShiftDeg: number;
  readonly blurPx: number;
  readonly tint: string;
  readonly tintAlpha: number;
}

export interface Round {
  readonly levelIndex: number;
  readonly scenario: Scenario;
  /** Onde o drone está de verdade (centro da câmera). */
  readonly realPosition: Point;
  /** Onde o GPS diz que o drone está (centro do satélite). */
  readonly gpsPosition: Point;
  readonly distortion: CameraDistortion;
  /** Seed dos efeitos de clima, para a câmera não "piscar" ao redesenhar. */
  readonly weatherSeed: number;
}

export type RoundOutcome = 'correct' | 'wrong' | 'timeout';

export interface RoundResult {
  /** `null` quando o tempo acabou sem resposta. */
  readonly answer: Verdict | null;
  readonly outcome: RoundOutcome;
  readonly points: number;
  readonly timeLeftMs: number;
}

export interface LevelStats {
  readonly levelIndex: number;
  readonly correct: number;
  readonly total: number;
  /** De 0 a 1. */
  readonly accuracy: number;
}

export function truthOf(scenario: Scenario): Verdict {
  return scenario.kind;
}
