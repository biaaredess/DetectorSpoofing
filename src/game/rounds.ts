import { ATTACK, CAMERA_DISTORTION, LEVELS, ROUNDS_PER_LEVEL, VIEW } from '../config';
import type { Point } from '../geometry';
import { FULL_TURN, clamp, pointAtAngle } from '../geometry';
import type { Rng } from '../rng';
import { pick, randomBetween, randomInt, shuffle } from '../rng';
import type { AttackDistance, CameraDistortion, Round, Scenario } from './types';

const UINT32_MAX = 0xffffffff;

export interface RoundPlanOptions {
  readonly worldSize: number;
  readonly levelCount?: number;
  readonly roundsPerLevel?: number;
}

/**
 * Sorteia todas as rodadas da partida. Cada nível tem pelo menos uma rodada
 * normal e uma de ataque; cerca de 60% dos ataques são do tipo "perto".
 */
export function drawRounds(rng: Rng, options: RoundPlanOptions): Round[] {
  const levelCount = options.levelCount ?? LEVELS.length;
  const roundsPerLevel = options.roundsPerLevel ?? ROUNDS_PER_LEVEL;

  const verdictsPerLevel = Array.from({ length: levelCount }, () =>
    drawLevelVerdicts(rng, roundsPerLevel),
  );
  const attackCount = verdictsPerLevel.flat().filter((isAttack) => isAttack).length;
  const distances = drawAttackDistances(rng, attackCount);

  return verdictsPerLevel.flatMap((verdicts, levelIndex) =>
    verdicts.map((isAttack) => {
      const scenario: Scenario = isAttack
        ? { kind: 'attack', distance: distances.pop() ?? 'near' }
        : { kind: 'normal' };
      return buildRound(rng, levelIndex, scenario, options.worldSize);
    }),
  );
}

/** `true` = ataque. Garante os dois tipos e embaralha a ordem. */
export function drawLevelVerdicts(rng: Rng, roundsPerLevel: number): boolean[] {
  const attacks = randomInt(rng, 1, roundsPerLevel - 1);
  const verdicts = Array.from({ length: roundsPerLevel }, (_, i) => i < attacks);
  return shuffle(rng, verdicts);
}

/** Proporção fixa (e não sorteio independente) para a dificuldade não variar muito. */
export function drawAttackDistances(rng: Rng, attackCount: number): AttackDistance[] {
  const nearCount = Math.round(attackCount * ATTACK.nearShare);
  const distances = Array.from({ length: attackCount }, (_, i): AttackDistance =>
    i < nearCount ? 'near' : 'far',
  );
  return shuffle(rng, distances);
}

function buildRound(rng: Rng, levelIndex: number, scenario: Scenario, worldSize: number): Round {
  const realPosition = randomPlayablePoint(rng, worldSize);
  return {
    levelIndex,
    scenario,
    realPosition,
    gpsPosition: gpsPositionFor(rng, scenario, realPosition, worldSize),
    distortion: drawDistortion(rng),
    weatherSeed: Math.floor(rng() * UINT32_MAX),
  };
}

function gpsPositionFor(rng: Rng, scenario: Scenario, real: Point, worldSize: number): Point {
  if (scenario.kind === 'normal') {
    const jittered = pointAtAngle(
      real,
      randomBetween(rng, 0, ATTACK.honestGpsJitter),
      rng() * FULL_TURN,
    );
    return clampToPlayable(jittered, worldSize);
  }
  const range = scenario.distance === 'near' ? ATTACK.nearDistance : ATTACK.farDistance;
  for (let attempt = 0; attempt < ATTACK.maxPlacementAttempts; attempt++) {
    const candidate = pointAtAngle(
      real,
      randomBetween(rng, range.min, range.max),
      rng() * FULL_TURN,
    );
    if (isPlayable(candidate, worldSize)) return candidate;
  }
  return fallbackSpoofedPosition(real, range.min, worldSize);
}

/**
 * Caso raro em que nenhum ângulo sorteado coube: anda em direção ao centro,
 * que sempre fica dentro da área jogável.
 */
function fallbackSpoofedPosition(real: Point, minDistance: number, worldSize: number): Point {
  const center = worldSize / 2;
  return pointAtAngle(real, minDistance, Math.atan2(center - real.y, center - real.x));
}

function randomPlayablePoint(rng: Rng, worldSize: number): Point {
  return {
    x: randomBetween(rng, VIEW.edgeMargin, worldSize - VIEW.edgeMargin),
    y: randomBetween(rng, VIEW.edgeMargin, worldSize - VIEW.edgeMargin),
  };
}

function clampToPlayable(point: Point, worldSize: number): Point {
  const min = VIEW.edgeMargin;
  const max = worldSize - VIEW.edgeMargin;
  return { x: clamp(point.x, min, max), y: clamp(point.y, min, max) };
}

export function isPlayable(point: Point, worldSize: number): boolean {
  const min = VIEW.edgeMargin;
  const max = worldSize - VIEW.edgeMargin;
  return point.x >= min && point.x <= max && point.y >= min && point.y <= max;
}

function drawDistortion(rng: Rng): CameraDistortion {
  const d = CAMERA_DISTORTION;
  return {
    rotationDeg: randomBetween(rng, -d.maxRotationDeg, d.maxRotationDeg),
    scale: randomBetween(rng, d.scale.min, d.scale.max),
    hueShiftDeg: randomBetween(rng, -d.maxHueShiftDeg, d.maxHueShiftDeg),
    blurPx: randomBetween(rng, d.blurPx.min, d.blurPx.max),
    tint: pick(rng, d.tints),
    tintAlpha: randomBetween(rng, d.tintAlpha.min, d.tintAlpha.max),
  };
}
