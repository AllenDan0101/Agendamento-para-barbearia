export type Papel = 'ADMIN' | 'ATENDENTE';

export type StatusAgendamento = 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: string;
};

export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

export type Ator = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
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

export function semSenha(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
  };
}
