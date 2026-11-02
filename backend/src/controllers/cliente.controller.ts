import type { Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import type {
  atualizarClienteSchema,
  criarClienteSchema,
  listarClientesSchema,
} from '../schemas/cliente.schema';
import type { ativoSchema } from '../schemas/usuario.schema';
import type { ClienteService } from '../services/cliente.service';
import type { z } from 'zod';

export class ClienteController {
  constructor(private readonly clientes: ClienteService) {}

  listar = asyncHandler(async (req, res: Response) => {
    const { query } = req.dados as z.infer<typeof listarClientesSchema>;
    const lista = await this.clientes.listar(query.busca, query.ativo === 'true');
    res.json(lista);
  });

  buscar = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.clientes.buscar(params.id));
  });

  criar = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as z.infer<typeof criarClienteSchema>;
    res.status(201).json(await this.clientes.criar(body));
  });

  atualizar = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof atualizarClienteSchema>;
    res.json(await this.clientes.atualizar(params.id, body));
  });

  definirAtivo = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof ativoSchema>;
    res.json(await this.clientes.definirAtivo(params.id, body.ativo));
  });
}
