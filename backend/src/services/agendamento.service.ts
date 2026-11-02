import type { DbClient } from '../db/cliente-banco';
import { somarMinutos } from '../domain/horario';
import { limitesDoDia } from '../domain/fuso';
import type { Agendamento, Ator } from '../domain/tipos';
import { AppError } from '../errors/app-error';
import type { AgendamentoRepository } from '../repositories/agendamento.repository';
import type { ClienteRepository } from '../repositories/cliente.repository';
import type { ServicoRepository } from '../repositories/servico.repository';
import type { UsuarioRepository } from '../repositories/usuario.repository';

const TOLERANCIA_PASSADO_MS = 60_000;

export type NovoAgendamento = {
  clienteId: string;
  servicoId: string;
  usuarioId?: string;
  inicio: string;
  observacao?: string | null;
};

export type Remarcacao = {
  inicio: string;
  servicoId?: string;
  observacao?: string | null;
};

export class AgendamentoService {
  constructor(
    private readonly banco: DbClient,
    private readonly agendamentos: AgendamentoRepository,
    private readonly clientes: ClienteRepository,
    private readonly servicos: ServicoRepository,
    private readonly usuarios: UsuarioRepository,
  ) {}

  async listar(filtro: { data?: string; clienteId?: string }): Promise<Agendamento[]> {
    const intervalo = filtro.data ? limitesDoDia(filtro.data) : undefined;
    return this.agendamentos.listar({
      inicioDe: intervalo?.inicio,
      inicioAte: intervalo?.fim,
      clienteId: filtro.clienteId,
    });
  }

  async buscar(id: string): Promise<Agendamento> {
    return this.exigir(id);
  }

  async criar(dados: NovoAgendamento, ator: Ator): Promise<Agendamento> {
    return this.banco.transaction(async () => {
      const cliente = await this.clientes.buscarPorId(dados.clienteId);
      if (!cliente || !cliente.ativo) throw new AppError(422, 'Cliente inexistente ou inativo');

      const servico = await this.servicos.buscarPorId(dados.servicoId);
      if (!servico || !servico.ativo) throw new AppError(422, 'Serviço inexistente ou inativo');

      const usuarioId = dados.usuarioId ?? ator.id;
      if (ator.papel !== 'ADMIN' && usuarioId !== ator.id) {
        throw new AppError(403, 'Atendente só pode agendar na própria agenda');
      }
      const atendente = await this.usuarios.buscarPorId(usuarioId);
      if (!atendente || !atendente.ativo) throw new AppError(422, 'Atendente inexistente ou inativo');

      const inicio = this.exigirFuturo(dados.inicio);
      const fim = somarMinutos(inicio, servico.duracaoMin);
      if (await this.agendamentos.existeConflito(usuarioId, inicio, fim)) {
        throw new AppError(409, 'Horário em conflito com outro agendamento deste atendente');
      }

      return this.agendamentos.inserir({
        clienteId: cliente.id,
        servicoId: servico.id,
        usuarioId,
        inicio,
        fim,
        observacao: this.observacao(dados.observacao),
      });
    });
  }

  async remarcar(id: string, dados: Remarcacao, ator: Ator): Promise<Agendamento> {
    return this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      if (atual.status !== 'AGENDADO') {
        throw new AppError(422, 'Só é possível remarcar um agendamento em aberto');
      }
      if (ator.papel !== 'ADMIN' && atual.usuarioId !== ator.id) {
        throw new AppError(403, 'Atendente só pode remarcar a própria agenda');
      }

      const servicoId = dados.servicoId ?? atual.servicoId;
      const servico = await this.servicos.buscarPorId(servicoId);
      if (!servico || !servico.ativo) throw new AppError(422, 'Serviço inexistente ou inativo');

      const inicio = this.exigirFuturo(dados.inicio);
      const fim = somarMinutos(inicio, servico.duracaoMin);
      if (await this.agendamentos.existeConflito(atual.usuarioId, inicio, fim, atual.id)) {
        throw new AppError(409, 'Horário em conflito com outro agendamento deste atendente');
      }

      await this.agendamentos.atualizarHorario(atual.id, {
        servicoId: servico.id,
        inicio,
        fim,
        observacao: dados.observacao === undefined ? atual.observacao : this.observacao(dados.observacao),
      });
      return this.exigir(atual.id);
    });
  }

  async cancelar(id: string, ator: Ator): Promise<Agendamento> {
    return this.alterarStatus(id, 'CANCELADO', ator, 'Só é possível cancelar um agendamento em aberto');
  }

  async concluir(id: string, ator: Ator): Promise<Agendamento> {
    return this.alterarStatus(id, 'CONCLUIDO', ator, 'Só é possível concluir um agendamento em aberto');
  }

  private async alterarStatus(
    id: string,
    status: 'CANCELADO' | 'CONCLUIDO',
    ator: Ator,
    mensagemBloqueio: string,
  ): Promise<Agendamento> {
    return this.banco.transaction(async () => {
      const atual = await this.exigir(id);
      if (atual.status !== 'AGENDADO') throw new AppError(422, mensagemBloqueio);
      if (ator.papel !== 'ADMIN' && atual.usuarioId !== ator.id) {
        throw new AppError(403, 'Atendente só pode alterar a própria agenda');
      }
      await this.agendamentos.atualizarStatus(atual.id, status);
      return this.exigir(atual.id);
    });
  }

  private async exigir(id: string): Promise<Agendamento> {
    const agendamento = await this.agendamentos.buscarPorId(id);
    if (!agendamento) throw new AppError(404, 'Agendamento não encontrado');
    return agendamento;
  }

  private exigirFuturo(inicio: string): string {
    const instante = new Date(inicio);
    if (Number.isNaN(instante.getTime())) throw new AppError(400, 'Data/hora inválida');
    if (instante.getTime() < Date.now() - TOLERANCIA_PASSADO_MS) {
      throw new AppError(422, 'Não é possível agendar no passado');
    }
    return instante.toISOString();
  }

  private observacao(valor: string | null | undefined): string | null {
    if (valor == null) return null;
    const texto = valor.trim();
    return texto.length === 0 ? null : texto;
  }
}
