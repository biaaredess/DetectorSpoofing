import type { DailyLeaderboard, ScoreEntry } from '../storage';
import { formatNumber, h, onClick } from './dom';

/**
 * Lista do "Placar do dia", com o botão de limpar. A confirmação acontece
 * dentro da própria página (o `confirm()` nativo trava a tela da feira).
 */
export class LeaderboardView {
  readonly root: HTMLElement;
  private readonly title: HTMLElement;
  private readonly list: HTMLOListElement;
  private readonly footer: HTMLElement;
  private highlight: ScoreEntry | null = null;

  constructor(private readonly board: DailyLeaderboard) {
    this.title = h(
      'h2',
      { class: 'board__title', id: 'board-title', tabindex: -1 },
      'Placar do dia',
    );
    this.list = h('ol', { class: 'board__list' });
    this.footer = h('div', { class: 'board__footer' });
    this.root = h(
      'section',
      { class: 'board', 'aria-labelledby': 'board-title' },
      this.title,
      this.list,
      this.footer,
    );
    this.refresh();
  }

  /** Encaixa um conteúdo extra (o formulário da tela final) logo abaixo do título. */
  insertBelowTitle(element: HTMLElement): void {
    this.title.after(element);
  }

  /** Recarrega do storage; `highlight` destaca a entrada recém-salva. */
  refresh(highlight: ScoreEntry | null = this.highlight): void {
    this.highlight = highlight;
    const entries = this.board.load();
    this.list.replaceChildren(
      ...(entries.length > 0
        ? entries.map((entry) => this.renderEntry(entry))
        : [h('li', { class: 'board__empty' }, 'Ninguém jogou ainda hoje. Seja o primeiro!')]),
    );
    this.showClearButton(entries.length > 0);
  }

  private renderEntry(entry: ScoreEntry): HTMLLIElement {
    const isNew =
      this.highlight !== null &&
      entry.savedAt === this.highlight.savedAt &&
      entry.name === this.highlight.name;
    return h(
      'li',
      { class: isNew ? 'board__entry is-new' : 'board__entry' },
      h('span', { class: 'board__name' }, entry.name),
      h('span', { class: 'board__score' }, `${formatNumber(entry.score)} pts`),
    );
  }

  private showClearButton(hasEntries: boolean): void {
    if (!hasEntries) {
      this.footer.replaceChildren();
      return;
    }
    const clear = h('button', { class: 'btn btn--link', type: 'button' }, 'Limpar placar');
    onClick(clear, () => this.askToClear());
    this.footer.replaceChildren(clear);
  }

  private askToClear(): void {
    const confirm = h(
      'button',
      { class: 'btn btn--small btn--orange', type: 'button' },
      'Sim, apagar',
    );
    const cancel = h('button', { class: 'btn btn--small', type: 'button' }, 'Cancelar');
    onClick(confirm, () => {
      this.board.clear();
      this.refresh(null);
      this.title.focus();
    });
    onClick(cancel, () => {
      this.refresh();
      this.footer.querySelector('button')?.focus();
    });
    this.footer.replaceChildren(
      h(
        'div',
        { class: 'board__confirm', role: 'group', 'aria-label': 'Confirmar limpeza do placar' },
        h('span', {}, 'Apagar o placar de hoje?'),
        confirm,
        cancel,
      ),
    );
    cancel.focus();
  }
}
