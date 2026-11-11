/** Contrato comum das telas montadas pelo `App`. */
export interface Screen {
  readonly root: HTMLElement;
  /** Move o foco para o ponto de partida da tela (acessibilidade por teclado). */
  focus(): void;
  /** Cancela animações e agendamentos próprios da tela. */
  dispose(): void;
}
