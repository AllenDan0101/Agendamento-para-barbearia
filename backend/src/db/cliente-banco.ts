export interface Executor {
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
  exec(sql: string): Promise<void>;
}

export interface DbClient extends Executor {
  transaction<T>(trabalho: () => Promise<T>): Promise<T>;
  fechar(): Promise<void>;
}
