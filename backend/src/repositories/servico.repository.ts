import { randomUUID } from 'crypto';
import type { Servico } from '../domain/tipos';
import type { DbClient } from '../db/cliente-banco';

type ServicoLinha = {
  id: string;
  nome: string;
  duracao_min: number;
  preco_centavos: number;
  ativo: number | boolean;
  criado_em: string;
};

function ativoDe(valor: number | boolean): boolean {
  return valor === true || valor === 1;
}

function mapear(linha: ServicoLinha): Servico {
  return {
    id: linha.id,
    nome: linha.nome,
    duracaoMin: Number(linha.duracao_min),
    preco: Number(linha.preco_centavos) / 100,
    ativo: ativoDe(linha.ativo),
    criadoEm: linha.criado_em,
  };
}

export class ServicoRepository {
  constructor(private readonly db: DbClient) {}

  async listar(): Promise<Servico[]> {
    const linhas = await this.db.all<ServicoLinha>(
      `SELECT id, nome, duracao_min, preco_centavos, ativo, criado_em
       FROM servicos
       ORDER BY nome`,
    );
    return linhas.map(mapear);
  }

  async buscarPorId(id: string): Promise<Servico | undefined> {
    const linha = await this.db.get<ServicoLinha>(
      `SELECT id, nome, duracao_min, preco_centavos, ativo, criado_em
       FROM servicos WHERE id = ?`,
      [id],
    );
    return linha ? mapear(linha) : undefined;
  }

  async inserir(dados: {
    nome: string;
    duracaoMin: number;
    preco: number;
    ativo?: boolean;
  }): Promise<Servico> {
    const id = randomUUID();
    const criadoEm = new Date().toISOString();
    await this.db.run(
      `INSERT INTO servicos (id, nome, duracao_min, preco_centavos, ativo, criado_em)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        dados.nome,
        dados.duracaoMin,
        Math.round(dados.preco * 100),
        dados.ativo === false ? 0 : 1,
        criadoEm,
      ],
    );
    const criado = await this.buscarPorId(id);
    if (!criado) throw new Error('Falha ao gravar serviço');
    return criado;
  }

  async atualizar(servico: Servico): Promise<void> {
    await this.db.run(
      `UPDATE servicos
       SET nome = ?, duracao_min = ?, preco_centavos = ?, ativo = ?
       WHERE id = ?`,
      [
        servico.nome,
        servico.duracaoMin,
        Math.round(servico.preco * 100),
        servico.ativo ? 1 : 0,
        servico.id,
      ],
    );
  }

  async excluir(id: string): Promise<void> {
    await this.db.run(`DELETE FROM servicos WHERE id = ?`, [id]);
  }
}
