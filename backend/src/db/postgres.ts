import { Client } from 'pg';
import { BancoComFila } from './banco-com-fila';

function paraPostgres(sql: string): string {
  let indice = 0;
  return sql.replace(/\?/g, () => {
    indice += 1;
    return `$${indice}`;
  });
}

function valores(params: unknown[]): unknown[] {
  return params.map((valor) => (valor === undefined ? null : valor));
}

export class PostgresBanco extends BancoComFila {
  private constructor(private readonly client: Client) {
    super();
  }

  static async abrir(connectionString: string): Promise<PostgresBanco> {
    const client = new Client({ connectionString });
    await client.connect();
    return new PostgresBanco(client);
  }

  protected async allRaw<T>(sql: string, params: unknown[]): Promise<T[]> {
    const resultado = await this.client.query(paraPostgres(sql), valores(params));
    return resultado.rows as T[];
  }

  protected async getRaw<T>(sql: string, params: unknown[]): Promise<T | undefined> {
    const linhas = await this.allRaw<T>(sql, params);
    return linhas[0];
  }

  protected async runRaw(sql: string, params: unknown[]): Promise<{ changes: number }> {
    const resultado = await this.client.query(paraPostgres(sql), valores(params));
    return { changes: resultado.rowCount ?? 0 };
  }

  protected async execRaw(sql: string): Promise<void> {
    const trechos = sql
      .split(';')
      .map((trecho) => trecho.trim())
      .filter((trecho) => trecho.length > 0);
    for (const trecho of trechos) {
      await this.client.query(trecho);
    }
  }

  protected async fecharRaw(): Promise<void> {
    await this.client.end();
  }
}
