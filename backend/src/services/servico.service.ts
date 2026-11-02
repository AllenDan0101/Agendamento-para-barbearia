import type { DbClient } from '../db/cliente-banco';
import { normalizarTexto } from '../domain/texto';
import type { Servico } from '../domain/tipos';
import { AppError } from '../errors/app-error';
import type { AgendamentoRepository } from '../repositories/agendamento.repository';
import type { ServicoRepository } from '../repositories/servico.repository';

export type DadosServico = {
  nome: string;
  duracaoMin: number;
  preco: number;
};

export class ServicoService {
  constructor(
    private readonly banco: DbClient,
    private readonly servicos: ServicoRepository,
    private readonly agendamentos: AgendamentoRepository,
  ) {}

  async listar(somenteAtivos = false): Promise<Servico[]> {
    const todos = await this.servicos.listar();
    return somenteAtivos ? todos.filter((servico) => servico.ativo) : todos;
  }

  async buscar(id: string): Promise<Servico> {
    return this.exigir(id);
  }

  async criar(dados: DadosServico): Promise<Servico> {
    this.validar(dados);
    return this.servicos.inserir({
      nome: normalizarTexto(dados.nome),
      duracaoMin: dados.duracaoMin,
      preco: dados.preco,
      ativo: true,
    });
  }

  async atualizar(id: string, dados: DadosServico): Promise<Servico> {
    this.validar(dados);
    return this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      const proximo: Servico = {
        ...atual,
        nome: normalizarTexto(dados.nome),
        duracaoMin: dados.duracaoMin,
        preco: dados.preco,
      };
      await this.servicos.atualizar(proximo);
      return proximo;
    });
  }

  async definirAtivo(id: string, ativo: boolean): Promise<Servico> {
    return this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      if (!ativo) {
        const futuros = await this.agendamentos.contarAgendadosAPartirDe(
          { servicoId: id },
          new Date().toISOString(),
        );
        if (futuros > 0) {
          throw new AppError(422, 'Cancele os agendamentos futuros deste serviço antes de inativá-lo');
        }
      }
      const proximo: Servico = { ...atual, ativo };
      await this.servicos.atualizar(proximo);
      return proximo;
    });
  }

  async excluir(id: string): Promise<void> {
    await this.exigir(id);
    const usos = await this.agendamentos.contarPorServico(id);
    if (usos > 0) {
      throw new AppError(409, 'Serviço já utilizado em agendamentos. Inative-o em vez de excluir.');
    }
    await this.servicos.excluir(id);
  }

  private async exigir(id: string): Promise<Servico> {
    const servico = await this.servicos.buscarPorId(id);
    if (!servico) throw new AppError(404, 'Serviço não encontrado');
    return servico;
  }

  private validar(dados: DadosServico): void {
    if (!Number.isInteger(dados.duracaoMin) || dados.duracaoMin <= 0) {
      throw new AppError(422, 'A duração deve ser um número inteiro de minutos maior que zero');
    }
    if (!Number.isFinite(dados.preco) || dados.preco < 0) {
      throw new AppError(422, 'O preço não pode ser negativo');
    }
  }
}
