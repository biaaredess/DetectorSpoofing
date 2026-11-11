import { LEADERBOARD } from './config';

/**
 * Placar do dia, guardado no localStorage com uma chave por data. Todo acesso
 * ao storage fica em try/catch: em janela anônima ou com o storage cheio ou
 * bloqueado, o jogo continua funcionando, só sem guardar o placar.
 */

export interface ScoreEntry {
  readonly name: string;
  readonly score: number;
  readonly hits: number;
  readonly savedAt: number;
}

/** O pedaço do `Storage` que o placar usa. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function browserStorage(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Chave do dia pela data local, no formato AAAA-MM-DD. */
export function dailyKey(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${LEADERBOARD.storageKeyPrefix}${day}`;
}

export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, LEADERBOARD.maxNameLength);
}

/** Ordena por pontos e, no empate, por quem salvou primeiro. Função pura. */
export function insertEntry(
  entries: readonly ScoreEntry[],
  entry: ScoreEntry,
  limit: number = LEADERBOARD.size,
): ScoreEntry[] {
  return [...entries, entry]
    .sort((a, b) => b.score - a.score || a.savedAt - b.savedAt)
    .slice(0, limit);
}

export function loadLeaderboard(store: KeyValueStore | null, date: Date): ScoreEntry[] {
  if (!store) return [];
  try {
    const raw = store.getItem(dailyKey(date));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isScoreEntry) : [];
  } catch {
    return [];
  }
}

export interface SaveOutcome {
  readonly entries: ScoreEntry[];
  /** Posição (0 = primeiro) da entrada nova, ou `null` se não entrou no top. */
  readonly position: number | null;
  readonly persisted: boolean;
}

export function saveScore(store: KeyValueStore | null, date: Date, entry: ScoreEntry): SaveOutcome {
  const entries = insertEntry(loadLeaderboard(store, date), entry);
  const index = entries.indexOf(entry);
  const position = index === -1 ? null : index;
  if (!store) return { entries, position, persisted: false };
  try {
    store.setItem(dailyKey(date), JSON.stringify(entries));
    return { entries, position, persisted: true };
  } catch {
    return { entries, position, persisted: false };
  }
}

export function clearLeaderboard(store: KeyValueStore | null, date: Date): void {
  if (!store) return;
  try {
    store.removeItem(dailyKey(date));
  } catch {
    // Sem storage não há o que apagar.
  }
}

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.name === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.hits === 'number' &&
    typeof entry.savedAt === 'number'
  );
}

/** O placar do dia já amarrado a um storage e a um relógio. */
export interface DailyLeaderboard {
  load(): ScoreEntry[];
  save(entry: ScoreEntry): SaveOutcome;
  clear(): void;
}

export function dailyLeaderboard(
  store: KeyValueStore | null,
  today: () => Date = () => new Date(),
): DailyLeaderboard {
  return {
    load: () => loadLeaderboard(store, today()),
    save: (entry) => saveScore(store, today(), entry),
    clear: () => clearLeaderboard(store, today()),
  };
}
