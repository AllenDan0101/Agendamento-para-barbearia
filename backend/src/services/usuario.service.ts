import type { DbClient } from '../db/cliente-banco';
import { normalizarEmail, normalizarTexto } from '../domain/texto';
import type { Ator, Papel, Usuario, UsuarioPublico } from '../domain/tipos';
import { semSenha } from '../domain/tipos';
import { AppError } from '../errors/app-error';
import type { AgendamentoRepository } from '../repositories/agendamento.repository';
import type { UsuarioRepository } from '../repositories/usuario.repository';
import { ehViolacaoUnica } from '../utils/sql';
import { gerarHash } from '../utils/senha';

export type DadosUsuario = {
  nome: string;
  email: string;
  senha?: string;
  papel: Papel;
};

export class UsuarioService {
  constructor(
    private readonly banco: DbClient,
    private readonly usuarios: UsuarioRepository,
    private readonly agendamentos: AgendamentoRepository,
  ) {}

  async listar(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarios.listar();
    return usuarios.map(semSenha);
  }

  async buscar(id: string): Promise<UsuarioPublico> {
    const usuario = await this.exigir(id);
    return semSenha(usuario);
  }

  async criar(dados: DadosUsuario & { senha: string }): Promise<UsuarioPublico> {
    const email = normalizarEmail(dados.email);
    if (!email) throw new AppError(422, 'Informe o e-mail');
    const senhaHash = await gerarHash(dados.senha);
    try {
      const criado = await this.banco.transaction(async () => {
        const existente = await this.usuarios.buscarPorEmail(email);
        if (existente) throw new AppError(409, 'Já existe um usuário com este e-mail');
        return this.usuarios.inserir({
          nome: normalizarTexto(dados.nome),
          email,
          senhaHash,
          papel: dados.papel,
          ativo: true,
        });
      });
      return semSenha(criado);
    } catch (erro) {
      if (ehViolacaoUnica(erro)) throw new AppError(409, 'Já existe um usuário com este e-mail');
      throw erro;
    }
  }

  async atualizar(id: string, dados: DadosUsuario): Promise<UsuarioPublico> {
    const email = normalizarEmail(dados.email);
    if (!email) throw new AppError(422, 'Informe o e-mail');
    const senhaHash = dados.senha ? await gerarHash(dados.senha) : undefined;
    try {
      const atualizado = await this.banco.transaction(async () => {
        const atual = await this.exigir(id);
        const outro = await this.usuarios.buscarPorEmail(email);
        if (outro && outro.id !== id) throw new AppError(409, 'Já existe um usuário com este e-mail');
        const proximo: Usuario = {
          ...atual,
          nome: normalizarTexto(dados.nome),
          email,
          papel: dados.papel,
          senhaHash: senhaHash ?? atual.senhaHash,
        };
        await this.garantirUltimoAdmin(atual, proximo);
        await this.usuarios.atualizar(proximo);
        return proximo;
      });
      return semSenha(atualizado);
    } catch (erro) {
      if (ehViolacaoUnica(erro)) throw new AppError(409, 'Já existe um usuário com este e-mail');
      throw erro;
    }
  }

  async definirAtivo(id: string, ativo: boolean, ator: Ator): Promise<UsuarioPublico> {
    const atualizado = await this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      if (!ativo && atual.id === ator.id) {
        throw new AppError(422, 'Você não pode inativar o próprio usuário');
      }
      if (!ativo) {
        const futuros = await this.agendamentos.contarAgendadosAPartirDe(
          { usuarioId: id },
          new Date().toISOString(),
        );
        if (futuros > 0) {
          throw new AppError(422, 'Cancele os agendamentos futuros deste usuário antes de inativá-lo');
        }
      }
      const proximo: Usuario = { ...atual, ativo };
      await this.garantirUltimoAdmin(atual, proximo);
      await this.usuarios.atualizar(proximo);
      return proximo;
    });
    return semSenha(atualizado);
  }

  private async exigir(id: string): Promise<Usuario> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new AppError(404, 'Usuário não encontrado');
    return usuario;
  }

  private async garantirUltimoAdmin(atual: Usuario, proximo: Usuario): Promise<void> {
    const eraAdminAtivo = atual.papel === 'ADMIN' && atual.ativo;
    const continua = proximo.papel === 'ADMIN' && proximo.ativo;
    if (!eraAdminAtivo || continua) return;
    const demais = (await this.usuarios.listar()).filter(
      (usuario) => usuario.id !== atual.id && usuario.papel === 'ADMIN' && usuario.ativo,
    );
    if (demais.length === 0) {
      throw new AppError(422, 'Não é possível remover o último administrador ativo');
    }
  }
}
