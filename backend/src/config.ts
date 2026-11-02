import dotenv from 'dotenv';
import path from 'path';

let ambienteCarregado = false;

export function garantirAmbiente(): void {
  if (ambienteCarregado) return;
  ambienteCarregado = true;
  if (process.env.NODE_ENV === 'test') return;

  const candidatos = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
  ];
  for (const caminho of candidatos) {
    dotenv.config({ path: caminho });
  }
}

export type Config = {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  driver: 'sqlite' | 'postgres';
  sqlitePath: string;
  databaseUrl: string;
  corsOrigin: string[];
  seed: boolean;
};

export function carregarConfig(): Config {
  garantirAmbiente();
  const driver = process.env.DATABASE_DRIVER === 'postgres' ? 'postgres' : 'sqlite';
  return {
    port: Number(process.env.PORT ?? 3333),
    jwtSecret: process.env.JWT_SECRET ?? 'segredo-de-desenvolvimento',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    driver,
    sqlitePath: process.env.SQLITE_PATH
      ? path.resolve(process.cwd(), process.env.SQLITE_PATH)
      : path.resolve(process.cwd(), 'data', 'barbearia.db'),
    databaseUrl: process.env.DATABASE_URL ?? '',
    corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:8080')
      .split(',')
      .map((origem) => origem.trim())
      .filter(Boolean),
    seed: process.env.SEED !== 'false',
  };
}
