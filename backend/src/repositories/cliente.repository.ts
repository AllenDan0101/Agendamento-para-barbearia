import { randomUUID } from 'crypto';
import type { Cliente } from '../domain/tipos';
import type { DbClient } from '../db/cliente-banco';

type ClienteLinha = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  ativo: number | boolean;
  criado_em: string;
};

function ativoDe(valor: number | boolean): boolean {
  return valor === true || valor === 1;
}

function mapear(linha: ClienteLinha): Cliente {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    email: linha.email,
    ativo: ativoDe(linha.ativo),
    criadoEm: linha.criado_em,
  };
}

export class ClienteRepository {
  constructor(private readonly db: DbClient) {}

  async listar(): Promise<Cliente[]> {
    const linhas = await this.db.all<ClienteLinha>(
      `SELECT id, nome, telefone, email, ativo, criado_em
       FROM clientes
       ORDER BY nome`,
    );
    return linhas.map(mapear);
  }

  async buscarPorId(id: string): Promise<Cliente | undefined> {
    const linha = await this.db.get<ClienteLinha>(
      `SELECT id, nome, telefone, email, ativo, criado_em FROM clientes WHERE id = ?`,
      [id],
    );
    return linha ? mapear(linha) : undefined;
  }

  async buscarPorTelefone(telefone: string): Promise<Cliente | undefined> {
    const linha = await this.db.get<ClienteLinha>(
      `SELECT id, nome, telefone, email, ativo, criado_em FROM clientes WHERE telefone = ?`,
      [telefone],
    );
    return linha ? mapear(linha) : undefined;
  }

  async buscarPorEmail(email: string): Promise<Cliente | undefined> {
    const linha = await this.db.get<ClienteLinha>(
      `SELECT id, nome, telefone, email, ativo, criado_em FROM clientes WHERE email = ?`,
      [email],
    );
    return linha ? mapear(linha) : undefined;
  }

  async inserir(dados: {
    nome: string;
    telefone: string;
    email: string | null;
    ativo?: boolean;
  }): Promise<Cliente> {
    const id = randomUUID();
    const criadoEm = new Date().toISOString();
    await this.db.run(
      `INSERT INTO clientes (id, nome, telefone, email, ativo, criado_em)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, dados.nome, dados.telefone, dados.email, dados.ativo === false ? 0 : 1, criadoEm],
    );
    const criado = await this.buscarPorId(id);
    if (!criado) throw new Error('Falha ao gravar cliente');
    return criado;
  }

  async atualizar(cliente: Cliente): Promise<void> {
    await this.db.run(
      `UPDATE clientes SET nome = ?, telefone = ?, email = ?, ativo = ? WHERE id = ?`,
      [cliente.nome, cliente.telefone, cliente.email, cliente.ativo ? 1 : 0, cliente.id],
    );
  }
}
