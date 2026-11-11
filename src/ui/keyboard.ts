import type { PhaseName } from '../game/machine';
import type { Verdict } from '../game/types';

/** O que uma tecla significa em cada fase do jogo. */
export type KeyIntent =
  { readonly kind: 'confirm' } | { readonly kind: 'answer'; readonly verdict: Verdict };

const ANSWER_KEYS: Readonly<Record<string, Verdict>> = {
  ArrowLeft: 'normal',
  ArrowRight: 'attack',
};

const CONFIRM_PHASES: ReadonlySet<PhaseName> = new Set(['intro', 'levelIntro', 'feedback']);

export function intentFor(phase: PhaseName, event: KeyboardEvent): KeyIntent | null {
  // Tecla segurada não deve responder várias rodadas de uma vez.
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return null;
  if (isEditable(event.target)) return null;

  if (phase === 'playing') {
    const verdict = ANSWER_KEYS[event.key];
    return verdict ? { kind: 'answer', verdict } : null;
  }
  // Enter num botão já vira clique nativo; tratar aqui duplicaria a ação.
  if (event.key === 'Enter' && CONFIRM_PHASES.has(phase) && !isButton(event.target)) {
    return { kind: 'confirm' };
  }
  return null;
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function isButton(target: EventTarget | null): boolean {
  return target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;
}
