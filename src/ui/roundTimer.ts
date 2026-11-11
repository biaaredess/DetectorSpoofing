/**
 * Relógio da rodada, baseado em `requestAnimationFrame` para a barra andar
 * lisa. Avisa a cada quadro quanto falta e chama `onExpire` no fim.
 */
export class RoundTimer {
  private frame = 0;
  private startedAt = 0;
  private running = false;

  constructor(
    private readonly durationMs: number,
    private readonly onTick: (timeLeftMs: number) => void,
    private readonly onExpire: () => void,
  ) {}

  start(): void {
    this.stop();
    this.startedAt = performance.now();
    this.running = true;
    this.onTick(this.durationMs);
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Para o relógio e devolve quanto tempo ainda restava. */
  stop(): number {
    const left = this.timeLeft();
    this.running = false;
    cancelAnimationFrame(this.frame);
    return left;
  }

  timeLeft(): number {
    if (!this.running) return 0;
    return Math.max(0, this.durationMs - (performance.now() - this.startedAt));
  }

  private readonly tick = (): void => {
    if (!this.running) return;
    const left = this.timeLeft();
    this.onTick(left);
    if (left <= 0) {
      this.running = false;
      this.onExpire();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}
