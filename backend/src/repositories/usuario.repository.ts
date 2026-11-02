import { randomUUID } from 'crypto';
import type { Papel, Usuario } from '../domain/tipos';
import type { DbClient } from '../db/cliente-banco';

type UsuarioLinha = {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  papel: Papel;
  ativo: number | boolean;
  criado_em: string;
};

function ativoDe(valor: number | boolean): boolean {
  return valor === true || valor === 1;
}

function mapear(linha: UsuarioLinha): Usuario {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    senhaHash: linha.senha_hash,
    papel: linha.papel,
    ativo: ativoDe(linha.ativo),
    criadoEm: linha.criado_em,
  };
}

export class UsuarioRepository {
  constructor(private readonly db: DbClient) {}

  async listar(): Promise<Usuario[]> {
    const linhas = await this.db.all<UsuarioLinha>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM usuarios
       ORDER BY nome`,
    );
    return linhas.map(mapear);
  }

  async buscarPorId(id: string): Promise<Usuario | undefined> {
    const linha = await this.db.get<UsuarioLinha>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM usuarios WHERE id = ?`,
      [id],
    );
    return linha ? mapear(linha) : undefined;
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    const linha = await this.db.get<UsuarioLinha>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM usuarios WHERE email = ?`,
      [email],
    );
    return linha ? mapear(linha) : undefined;
  }

  async inserir(dados: {
    nome: string;
    email: string;
    senhaHash: string;
    papel: Papel;
    ativo?: boolean;
  }): Promise<Usuario> {
    const id = randomUUID();
    const criadoEm = new Date().toISOString();
    await this.db.run(
      `INSERT INTO usuarios (id, nome, email, senha_hash, papel, ativo, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, dados.nome, dados.email, dados.senhaHash, dados.papel, dados.ativo === false ? 0 : 1, criadoEm],
    );
    const criado = await this.buscarPorId(id);
    if (!criado) throw new Error('Falha ao gravar usuário');
    return criado;
  }

  async atualizar(usuario: Usuario): Promise<void> {
    await this.db.run(
      `UPDATE usuarios
       SET nome = ?, email = ?, senha_hash = ?, papel = ?, ativo = ?
       WHERE id = ?`,
      [
        usuario.nome,
        usuario.email,
        usuario.senhaHash,
        usuario.papel,
        usuario.ativo ? 1 : 0,
        usuario.id,
      ],
    );
  }
}
