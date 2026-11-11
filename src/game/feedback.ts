import { METERS_PER_WORLD_PIXEL } from '../config';
import { distance } from '../geometry';
import type { Round, RoundResult } from './types';

export interface Explanation {
  readonly title: string;
  /** Uma frase explicando por que a resposta certa é a certa. */
  readonly reason: string;
}

const METERS_ROUNDING = 10;

/** Distância do desvio do GPS, em metros, arredondada para a frase. */
export function spoofDistanceMeters(round: Round): number {
  const meters = distance(round.realPosition, round.gpsPosition) * METERS_PER_WORLD_PIXEL;
  return Math.round(meters / METERS_ROUNDING) * METERS_ROUNDING;
}

export function explain(round: Round, result: RoundResult): Explanation {
  return { title: titleFor(result), reason: reasonFor(round, result) };
}

function titleFor(result: RoundResult): string {
  switch (result.outcome) {
    case 'correct':
      return `Acertou! +${result.points}`;
    case 'wrong':
      return 'Errou!';
    case 'timeout':
      return 'Tempo esgotado!';
  }
}

function reasonFor(round: Round, result: RoundResult): string {
  const correct = result.outcome === 'correct';
  const { scenario } = round;

  if (scenario.kind === 'normal') {
    return correct
      ? 'As formas batem: a câmera e o satélite mostram o mesmo lugar, só girado e com outra luz.'
      : 'Era voo normal: apesar da rotação e do clima, as estradas e formas são as mesmas nas duas imagens.';
  }

  const meters = spoofDistanceMeters(round);
  if (scenario.distance === 'near') {
    return correct
      ? `Bem visto! O GPS mentiu por uns ${meters} m: as imagens se parecem, mas o centro não bate.`
      : `Era ataque! O GPS apontava só uns ${meters} m ao lado: parecido, mas deslocado (veja o pin azul).`;
  }
  return correct
    ? `Isso! O GPS dizia que o drone estava a uns ${meters} m dali, e as formas não têm nada a ver.`
    : `Era ataque! O GPS apontava para uns ${meters} m dali: as formas das duas imagens não batem.`;
}
