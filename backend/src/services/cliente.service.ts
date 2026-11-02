import type { DbClient } from '../db/cliente-banco';
import { normalizarEmail, normalizarTelefone, normalizarTexto, somenteDigitos } from '../domain/texto';
import type { Cliente } from '../domain/tipos';
import { AppError } from '../errors/app-error';
import type { AgendamentoRepository } from '../repositories/agendamento.repository';
import type { ClienteRepository } from '../repositories/cliente.repository';
import { ehViolacaoUnica } from '../utils/sql';

function combinaBusca(cliente: Cliente, termo: string): boolean {
  const nome = cliente.nome.toLocaleLowerCase('pt-BR');
  const email = (cliente.email ?? '').toLocaleLowerCase('pt-BR');
  const texto = termo.toLocaleLowerCase('pt-BR');
  const digitos = somenteDigitos(termo);
  return (
    nome.includes(texto) ||
    email.includes(texto) ||
    (digitos.length > 0 && cliente.telefone.includes(digitos))
  );
}

export class ClienteService {
  constructor(
    private readonly banco: DbClient,
    private readonly clientes: ClienteRepository,
    private readonly agendamentos: AgendamentoRepository,
  ) {}

  async listar(busca?: string, somenteAtivos = false): Promise<Cliente[]> {
    const todos = await this.clientes.listar();
    const filtrados = busca?.trim() ? todos.filter((cliente) => combinaBusca(cliente, busca.trim())) : todos;
    return somenteAtivos ? filtrados.filter((cliente) => cliente.ativo) : filtrados;
  }

  async buscar(id: string): Promise<Cliente> {
    return this.exigir(id);
  }

  async criar(dados: { nome: string; telefone: string; email?: string | null }): Promise<Cliente> {
    const telefone = normalizarTelefone(dados.telefone);
    const email = normalizarEmail(dados.email);
    try {
      return await this.banco.transaction(async () => {
        await this.garantirContatosLivres(telefone, email, null);
        return this.clientes.inserir({
          nome: normalizarTexto(dados.nome),
          telefone,
          email,
          ativo: true,
        });
      });
    } catch (erro) {
      this.traduzirUnicidade(erro);
      throw erro;
    }
  }

  async atualizar(
    id: string,
    dados: { nome: string; telefone: string; email?: string | null },
  ): Promise<Cliente> {
    const telefone = normalizarTelefone(dados.telefone);
    const email = normalizarEmail(dados.email);
    try {
      return await this.banco.transaction(async () => {
        const atual = await this.exigir(id);
        await this.garantirContatosLivres(telefone, email, id);
        const proximo: Cliente = {
          ...atual,
          nome: normalizarTexto(dados.nome),
          telefone,
          email,
        };
        await this.clientes.atualizar(proximo);
        return proximo;
      });
    } catch (erro) {
      this.traduzirUnicidade(erro);
      throw erro;
    }
  }

  async definirAtivo(id: string, ativo: boolean): Promise<Cliente> {
    return this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      if (!ativo) {
        const futuros = await this.agendamentos.contarAgendadosAPartirDe(
          { clienteId: id },
          new Date().toISOString(),
        );
        if (futuros > 0) {
          throw new AppError(422, 'Cancele os agendamentos futuros deste cliente antes de inativá-lo');
        }
      }
      const proximo: Cliente = { ...atual, ativo };
      await this.clientes.atualizar(proximo);
      return proximo;
    });
  }

  private async exigir(id: string): Promise<Cliente> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) throw new AppError(404, 'Cliente não encontrado');
    return cliente;
  }

  private async garantirContatosLivres(
    telefone: string,
    email: string | null,
    ignorarId: string | null,
  ): Promise<void> {
    const porTelefone = await this.clientes.buscarPorTelefone(telefone);
    if (porTelefone && porTelefone.id !== ignorarId) {
      throw new AppError(409, 'Já existe um cliente com este telefone');
    }
    if (email) {
      const porEmail = await this.clientes.buscarPorEmail(email);
      if (porEmail && porEmail.id !== ignorarId) {
        throw new AppError(409, 'Já existe um cliente com este e-mail');
      }
    }
  }

  private traduzirUnicidade(erro: unknown): void {
    if (ehViolacaoUnica(erro)) {
      throw new AppError(409, 'Já existe um cliente com este telefone ou e-mail');
    }
  }
}
