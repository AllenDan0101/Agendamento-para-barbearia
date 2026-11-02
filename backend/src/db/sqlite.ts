import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import type { DatabaseSync as DatabaseSyncTipo, SQLInputValue } from 'node:sqlite';
import { BancoComFila } from './banco-com-fila';

const requerir = createRequire(__filename);
const { DatabaseSync } = requerir('node:' + 'sqlite') as {
  DatabaseSync: typeof DatabaseSyncTipo;
};

type ConexaoSqlite = InstanceType<typeof DatabaseSync>;

function comoEntrada(params: unknown[]): SQLInputValue[] {
  return params.map((valor) => {
    if (valor === undefined || valor === null) return null;
    if (typeof valor === 'boolean') return valor ? 1 : 0;
    if (typeof valor === 'number' || typeof valor === 'string' || typeof valor === 'bigint') {
      return valor;
    }
    throw new Error('Parâmetro SQL não suportado');
  });
}

export class SqliteBanco extends BancoComFila {
  private constructor(private readonly database: ConexaoSqlite) {
    super();
  }

  static async abrir(caminho: string): Promise<SqliteBanco> {
    if (caminho !== ':memory:') {
      fs.mkdirSync(path.dirname(caminho), { recursive: true });
    }
    const database = new DatabaseSync(caminho);
    const banco = new SqliteBanco(database);
    await banco.execRaw('PRAGMA foreign_keys = ON');
    await banco.execRaw('PRAGMA busy_timeout = 3000');
    if (caminho !== ':memory:') {
      await banco.execRaw('PRAGMA journal_mode = WAL');
    }
    return banco;
  }

  protected allRaw<T>(sql: string, params: unknown[]): Promise<T[]> {
    const linhas = this.database.prepare(sql).all(...comoEntrada(params));
    return Promise.resolve(linhas as T[]);
  }

  protected getRaw<T>(sql: string, params: unknown[]): Promise<T | undefined> {
    const linha = this.database.prepare(sql).get(...comoEntrada(params));
    return Promise.resolve(linha as T | undefined);
  }

  protected runRaw(sql: string, params: unknown[]): Promise<{ changes: number }> {
    const resultado = this.database.prepare(sql).run(...comoEntrada(params));
    return Promise.resolve({ changes: Number(resultado.changes) });
  }

  protected execRaw(sql: string): Promise<void> {
    this.database.exec(sql);
    return Promise.resolve();
  }

  protected fecharRaw(): Promise<void> {
    this.database.close();
    return Promise.resolve();
  }
}
