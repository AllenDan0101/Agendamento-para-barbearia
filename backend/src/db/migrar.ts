import type { DbClient } from './cliente-banco';

const TABELAS = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('ADMIN', 'ATENDENTE')),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS servicos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    duracao_min INTEGER NOT NULL CHECK (duracao_min > 0),
    preco_centavos INTEGER NOT NULL CHECK (preco_centavos >= 0),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS agendamentos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL REFERENCES clientes(id),
    servico_id TEXT NOT NULL REFERENCES servicos(id),
    usuario_id TEXT NOT NULL REFERENCES usuarios(id),
    inicio TEXT NOT NULL,
    fim TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('AGENDADO', 'CONCLUIDO', 'CANCELADO')),
    observacao TEXT,
    criado_em TEXT NOT NULL,
    CHECK (fim > inicio)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_usuario_inicio ON agendamentos (usuario_id, inicio)`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos (cliente_id)`,
  `CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON agendamentos (servico_id)`,
];

export async function migrar(banco: DbClient): Promise<void> {
  for (const tabela of TABELAS) {
    await banco.exec(tabela);
  }
}
