export type Papel = 'ADMIN' | 'ATENDENTE';
export type StatusAgendamento = 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  ativo: boolean;
  criadoEm: string;
};

export type Servico = {
  id: string;
  nome: string;
  duracaoMin: number;
  preco: number;
  ativo: boolean;
  criadoEm: string;
};

export type Agendamento = {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoId: string;
  servicoNome: string;
  duracaoMin: number;
  preco: number;
  usuarioId: string;
  atendenteNome: string;
  inicio: string;
  fim: string;
  status: StatusAgendamento;
  observacao: string | null;
  criadoEm: string;
};

export type DetalheErro = { caminho: string; mensagem: string };
