import type { Express } from 'express';
import request from 'supertest';
import { criarAplicacao } from '../src/app';
import { carregarConfig } from '../src/config';
import type { DbClient } from '../src/db/cliente-banco';
import { migrar } from '../src/db/migrar';
import { SqliteBanco } from '../src/db/sqlite';
import type { Papel } from '../src/domain/tipos';
import { compor, type Dependencias } from '../src/composition';

export type Ambiente = Dependencias & {
  app: Express;
  banco: DbClient;
  fechar: () => Promise<void>;
};

export async function subir(): Promise<Ambiente> {
  const banco = await SqliteBanco.abrir(':memory:');
  await migrar(banco);
  const aplicacao = criarAplicacao(banco, carregarConfig());
  return {
    ...aplicacao,
    banco,
    fechar: () => banco.fechar(),
  };
}

export async function ambienteDeServico(): Promise<Dependencias & { fechar: () => Promise<void> }> {
  const banco = await SqliteBanco.abrir(':memory:');
  await migrar(banco);
  return { ...compor(banco), fechar: () => banco.fechar() };
}

export async function criarUsuario(
  deps: Dependencias,
  dados: { nome: string; email: string; senha: string; papel: Papel },
) {
  return deps.usuarioService.criar(dados);
}

export async function tokenDe(app: Express, email: string, senha: string): Promise<string> {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });
  if (resposta.status !== 200) {
    throw new Error(`Falha no login de teste: ${resposta.status} ${JSON.stringify(resposta.body)}`);
  }
  return resposta.body.token as string;
}

export const FUTURO = '2030-06-15T15:00:00.000Z';
export const FUTURO_MEIA_HORA = '2030-06-15T15:30:00.000Z';
export const FUTURO_QUINZE = '2030-06-15T15:15:00.000Z';
export const PASSADO = '2020-01-15T15:00:00.000Z';
