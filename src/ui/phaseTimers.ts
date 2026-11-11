/** Agendamentos que valem só para a fase atual e são cancelados ao trocar de fase. */
export class PhaseTimers {
  private readonly handles = new Set<number>();

  after(delayMs: number, action: () => void): void {
    const handle = window.setTimeout(() => {
      this.handles.delete(handle);
      action();
    }, delayMs);
    this.handles.add(handle);
  }

  clear(): void {
    for (const handle of this.handles) window.clearTimeout(handle);
    this.handles.clear();
  }
}
