import type { DbClient } from './db/cliente-banco';
import { AgendamentoRepository } from './repositories/agendamento.repository';
import { ClienteRepository } from './repositories/cliente.repository';
import { ServicoRepository } from './repositories/servico.repository';
import { UsuarioRepository } from './repositories/usuario.repository';
import { AgendamentoService } from './services/agendamento.service';
import { AuthService } from './services/auth.service';
import { ClienteService } from './services/cliente.service';
import { ServicoService } from './services/servico.service';
import { UsuarioService } from './services/usuario.service';

export function compor(banco: DbClient) {
  const usuarios = new UsuarioRepository(banco);
  const clientes = new ClienteRepository(banco);
  const servicos = new ServicoRepository(banco);
  const agendamentos = new AgendamentoRepository(banco);

  const usuarioService = new UsuarioService(banco, usuarios, agendamentos);
  const authService = new AuthService(usuarios);
  const clienteService = new ClienteService(banco, clientes, agendamentos);
  const servicoService = new ServicoService(banco, servicos, agendamentos);
  const agendamentoService = new AgendamentoService(banco, agendamentos, clientes, servicos, usuarios);

  return {
    repositorios: { usuarios, clientes, servicos, agendamentos },
    usuarioService,
    authService,
    clienteService,
    servicoService,
    agendamentoService,
  };
}

export type Dependencias = ReturnType<typeof compor>;
