import { Router } from 'express';
import { AgendamentoController } from '../controllers/agendamento.controller';
import { AuthController } from '../controllers/auth.controller';
import { ClienteController } from '../controllers/cliente.controller';
import { ServicoController } from '../controllers/servico.controller';
import { UsuarioController } from '../controllers/usuario.controller';
import { criarAutenticar, somenteAdmin } from '../middlewares/auth';
import { validar } from '../middlewares/validar';
import {
  criarAgendamentoSchema,
  listarAgendamentosSchema,
  remarcarAgendamentoSchema,
} from '../schemas/agendamento.schema';
import { cadastroSchema, loginSchema } from '../schemas/auth.schema';
import {
  atualizarClienteSchema,
  criarClienteSchema,
  listarClientesSchema,
} from '../schemas/cliente.schema';
import {
  atualizarServicoSchema,
  criarServicoSchema,
  listarServicosSchema,
} from '../schemas/servico.schema';
import {
  ativoSchema,
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  idParamSchema,
} from '../schemas/usuario.schema';
import type { Dependencias } from '../composition';

export function criarRotas(deps: Dependencias): Router {
  const router = Router();
  const exigir = criarAutenticar(deps.repositorios.usuarios);
  const auth = new AuthController(deps.authService, deps.usuarioService);
  const usuarios = new UsuarioController(deps.usuarioService);
  const clientes = new ClienteController(deps.clienteService);
  const servicos = new ServicoController(deps.servicoService);
  const agendamentos = new AgendamentoController(deps.agendamentoService);

  router.get('/saude', (_req, res) => {
    res.json({ status: 'ok', servico: 'navalha' });
  });

  router.post('/auth/login', validar(loginSchema), auth.login);
  router.post('/auth/cadastro', validar(cadastroSchema), auth.cadastrar);
  router.post('/auth/logout', exigir, auth.logout);
  router.get('/auth/me', exigir, auth.eu);

  router.get('/usuarios', exigir, somenteAdmin, usuarios.listar);
  router.post('/usuarios', exigir, somenteAdmin, validar(criarUsuarioSchema), usuarios.criar);
  router.get('/usuarios/:id', exigir, somenteAdmin, validar(idParamSchema), usuarios.buscar);
  router.put('/usuarios/:id', exigir, somenteAdmin, validar(atualizarUsuarioSchema), usuarios.atualizar);
  router.patch('/usuarios/:id/ativo', exigir, somenteAdmin, validar(ativoSchema), usuarios.definirAtivo);

  router.get('/clientes', exigir, validar(listarClientesSchema), clientes.listar);
  router.post('/clientes', exigir, validar(criarClienteSchema), clientes.criar);
  router.get('/clientes/:id', exigir, validar(idParamSchema), clientes.buscar);
  router.put('/clientes/:id', exigir, validar(atualizarClienteSchema), clientes.atualizar);
  router.patch('/clientes/:id/ativo', exigir, validar(ativoSchema), clientes.definirAtivo);

  router.get('/servicos', exigir, validar(listarServicosSchema), servicos.listar);
  router.post('/servicos', exigir, somenteAdmin, validar(criarServicoSchema), servicos.criar);
  router.get('/servicos/:id', exigir, validar(idParamSchema), servicos.buscar);
  router.put('/servicos/:id', exigir, somenteAdmin, validar(atualizarServicoSchema), servicos.atualizar);
  router.patch('/servicos/:id/ativo', exigir, somenteAdmin, validar(ativoSchema), servicos.definirAtivo);
  router.delete('/servicos/:id', exigir, somenteAdmin, validar(idParamSchema), servicos.excluir);

  router.get('/agendamentos', exigir, validar(listarAgendamentosSchema), agendamentos.listar);
  router.post('/agendamentos', exigir, validar(criarAgendamentoSchema), agendamentos.criar);
  router.get('/agendamentos/:id', exigir, validar(idParamSchema), agendamentos.buscar);
  router.put('/agendamentos/:id', exigir, validar(remarcarAgendamentoSchema), agendamentos.remarcar);
  router.patch('/agendamentos/:id/cancelar', exigir, validar(idParamSchema), agendamentos.cancelar);
  router.patch('/agendamentos/:id/concluir', exigir, validar(idParamSchema), agendamentos.concluir);

  return router;
}
