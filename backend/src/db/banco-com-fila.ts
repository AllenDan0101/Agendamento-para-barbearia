import { AsyncLocalStorage } from 'async_hooks';
import type { DbClient, Executor } from './cliente-banco';

/**
 * Serializa o acesso a uma única conexão e usa AsyncLocalStorage para que
 * repositórios participantes de `transaction()` reutilizem o mesmo BEGIN/COMMIT
 * sem receber a conexão por parâmetro.
 */
export abstract class BancoComFila implements DbClient {
  private fila: Promise<unknown> = Promise.resolve();
  private readonly contexto = new AsyncLocalStorage<Executor>();

  protected abstract allRaw<T>(sql: string, params: unknown[]): Promise<T[]>;
  protected abstract getRaw<T>(sql: string, params: unknown[]): Promise<T | undefined>;
  protected abstract runRaw(sql: string, params: unknown[]): Promise<{ changes: number }>;
  protected abstract execRaw(sql: string): Promise<void>;
  protected abstract fecharRaw(): Promise<void>;

  private enfileirar<T>(trabalho: () => Promise<T>): Promise<T> {
    const execucao = this.fila.then(trabalho, trabalho);
    this.fila = execucao.then(
      () => undefined,
      () => undefined,
    );
    return execucao;
  }

  private executorAtual(): Executor {
    return {
      all: (sql, params = []) => this.allRaw(sql, params),
      get: (sql, params = []) => this.getRaw(sql, params),
      run: (sql, params = []) => this.runRaw(sql, params),
      exec: (sql) => this.execRaw(sql),
    };
  }

  private usar<T>(fora: () => Promise<T>, dentro: (atual: Executor) => Promise<T>): Promise<T> {
    const atual = this.contexto.getStore();
    if (atual) return dentro(atual);
    return this.enfileirar(fora);
  }

  all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.usar(
      () => this.allRaw(sql, params),
      (atual) => atual.all<T>(sql, params),
    );
  }

  get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return this.usar(
      () => this.getRaw(sql, params),
      (atual) => atual.get<T>(sql, params),
    );
  }

  run(sql: string, params: unknown[] = []): Promise<{ changes: number }> {
    return this.usar(
      () => this.runRaw(sql, params),
      (atual) => atual.run(sql, params),
    );
  }

  exec(sql: string): Promise<void> {
    return this.usar(
      () => this.execRaw(sql),
      (atual) => atual.exec(sql),
    );
  }

  transaction<T>(trabalho: () => Promise<T>): Promise<T> {
    if (this.contexto.getStore()) return trabalho();
    return this.enfileirar(async () => {
      await this.execRaw('BEGIN');
      try {
        const resultado = await this.contexto.run(this.executorAtual(), trabalho);
        await this.execRaw('COMMIT');
        return resultado;
      } catch (erro) {
        try {
          await this.execRaw('ROLLBACK');
        } catch {
          // a conexão pode já ter revertido a transação
        }
        throw erro;
      }
    });
  }

  fechar(): Promise<void> {
    return this.enfileirar(() => this.fecharRaw());
  }
}
