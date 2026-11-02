import { randomUUID } from 'crypto';
import { intervalosConflitam } from '../domain/horario';
import type { Agendamento, StatusAgendamento } from '../domain/tipos';
import type { DbClient } from '../db/cliente-banco';
import { comoNumero } from '../utils/sql';

type AgendamentoLinha = {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  servico_id: string;
  servico_nome: string;
  duracao_min: number;
  preco_centavos: number;
  usuario_id: string;
  atendente_nome: string;
  inicio: string;
  fim: string;
  status: StatusAgendamento;
  observacao: string | null;
  criado_em: string;
};

type OcupacaoLinha = {
  id: string;
  inicio: string;
  fim: string;
};

const CONSULTA = `
  SELECT
    a.id,
    a.cliente_id,
    c.nome AS cliente_nome,
    a.servico_id,
    s.nome AS servico_nome,
    s.duracao_min,
    s.preco_centavos,
    a.usuario_id,
    u.nome AS atendente_nome,
    a.inicio,
    a.fim,
    a.status,
    a.observacao,
    a.criado_em
  FROM agendamentos a
  INNER JOIN clientes c ON c.id = a.cliente_id
  INNER JOIN servicos s ON s.id = a.servico_id
  INNER JOIN usuarios u ON u.id = a.usuario_id
`;

function mapear(linha: AgendamentoLinha): Agendamento {
  return {
    id: linha.id,
    clienteId: linha.cliente_id,
    clienteNome: linha.cliente_nome,
    servicoId: linha.servico_id,
    servicoNome: linha.servico_nome,
    duracaoMin: Number(linha.duracao_min),
    preco: Number(linha.preco_centavos) / 100,
    usuarioId: linha.usuario_id,
    atendenteNome: linha.atendente_nome,
    inicio: linha.inicio,
    fim: linha.fim,
    status: linha.status,
    observacao: linha.observacao,
    criadoEm: linha.criado_em,
  };
}

export class AgendamentoRepository {
  constructor(private readonly db: DbClient) {}

  async listar(filtro: {
    inicioDe?: string;
    inicioAte?: string;
    clienteId?: string;
  }): Promise<Agendamento[]> {
    const clausulas: string[] = [];
    const params: unknown[] = [];
    if (filtro.inicioDe) {
      clausulas.push('a.inicio >= ?');
      params.push(filtro.inicioDe);
    }
    if (filtro.inicioAte) {
      clausulas.push('a.inicio <= ?');
      params.push(filtro.inicioAte);
    }
    if (filtro.clienteId) {
      clausulas.push('a.cliente_id = ?');
      params.push(filtro.clienteId);
    }
    const where = clausulas.length > 0 ? `WHERE ${clausulas.join(' AND ')}` : '';
    const linhas = await this.db.all<AgendamentoLinha>(
      `${CONSULTA} ${where} ORDER BY a.inicio ASC`,
      params,
    );
    return linhas.map(mapear);
  }

  async buscarPorId(id: string): Promise<Agendamento | undefined> {
    const linha = await this.db.get<AgendamentoLinha>(`${CONSULTA} WHERE a.id = ?`, [id]);
    return linha ? mapear(linha) : undefined;
  }

  async existeConflito(
    usuarioId: string,
    inicio: string,
    fim: string,
    ignorarId?: string,
  ): Promise<boolean> {
    const linhas = await this.db.all<OcupacaoLinha>(
      `SELECT id, inicio, fim
       FROM agendamentos
       WHERE usuario_id = ? AND status != 'CANCELADO'`,
      [usuarioId],
    );
    return linhas.some(
      (linha) => linha.id !== ignorarId && intervalosConflitam(linha.inicio, linha.fim, inicio, fim),
    );
  }

  async inserir(dados: {
    clienteId: string;
    servicoId: string;
    usuarioId: string;
    inicio: string;
    fim: string;
    observacao: string | null;
    status?: StatusAgendamento;
  }): Promise<Agendamento> {
    const id = randomUUID();
    const criadoEm = new Date().toISOString();
    await this.db.run(
      `INSERT INTO agendamentos
        (id, cliente_id, servico_id, usuario_id, inicio, fim, status, observacao, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dados.clienteId,
        dados.servicoId,
        dados.usuarioId,
        dados.inicio,
        dados.fim,
        dados.status ?? 'AGENDADO',
        dados.observacao,
        criadoEm,
      ],
    );
    const criado = await this.buscarPorId(id);
    if (!criado) throw new Error('Falha ao gravar agendamento');
    return criado;
  }

  async atualizarHorario(
    id: string,
    dados: { servicoId: string; inicio: string; fim: string; observacao: string | null },
  ): Promise<void> {
    await this.db.run(
      `UPDATE agendamentos
       SET servico_id = ?, inicio = ?, fim = ?, observacao = ?
       WHERE id = ?`,
      [dados.servicoId, dados.inicio, dados.fim, dados.observacao, id],
    );
  }

  async atualizarStatus(id: string, status: StatusAgendamento): Promise<void> {
    await this.db.run(`UPDATE agendamentos SET status = ? WHERE id = ?`, [status, id]);
  }

  async contarPorServico(servicoId: string): Promise<number> {
    const linha = await this.db.get<{ total: number | string }>(
      `SELECT COUNT(*) AS total FROM agendamentos WHERE servico_id = ?`,
      [servicoId],
    );
    return comoNumero(linha?.total);
  }

  async contarAgendadosAPartirDe(
    filtro: { clienteId?: string; servicoId?: string; usuarioId?: string },
    instanteIso: string,
  ): Promise<number> {
    const clausulas = [`status = 'AGENDADO'`, 'inicio >= ?'];
    const params: unknown[] = [instanteIso];
    if (filtro.clienteId) {
      clausulas.push('cliente_id = ?');
      params.push(filtro.clienteId);
    }
    if (filtro.servicoId) {
      clausulas.push('servico_id = ?');
      params.push(filtro.servicoId);
    }
    if (filtro.usuarioId) {
      clausulas.push('usuario_id = ?');
      params.push(filtro.usuarioId);
    }
    const linha = await this.db.get<{ total: number | string }>(
      `SELECT COUNT(*) AS total FROM agendamentos WHERE ${clausulas.join(' AND ')}`,
      params,
    );
    return comoNumero(linha?.total);
  }
}
