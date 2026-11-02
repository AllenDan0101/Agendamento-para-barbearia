import type { Config } from '../config';
import type { DbClient } from './cliente-banco';
import { PostgresBanco } from './postgres';
import { SqliteBanco } from './sqlite';

export async function criarBanco(config: Config): Promise<DbClient> {
  if (config.driver === 'postgres') {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL é obrigatória quando DATABASE_DRIVER=postgres');
    }
    return PostgresBanco.abrir(config.databaseUrl);
  }
  return SqliteBanco.abrir(config.sqlitePath);
}
