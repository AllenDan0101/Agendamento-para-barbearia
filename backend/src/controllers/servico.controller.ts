import type { Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import type {
  atualizarServicoSchema,
  criarServicoSchema,
  listarServicosSchema,
} from '../schemas/servico.schema';
import type { ativoSchema } from '../schemas/usuario.schema';
import type { ServicoService } from '../services/servico.service';
import type { z } from 'zod';

export class ServicoController {
  constructor(private readonly servicos: ServicoService) {}

  listar = asyncHandler(async (req, res: Response) => {
    const { query } = req.dados as z.infer<typeof listarServicosSchema>;
    res.json(await this.servicos.listar(query.ativo === 'true'));
  });

  buscar = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.servicos.buscar(params.id));
  });

  criar = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as z.infer<typeof criarServicoSchema>;
    res.status(201).json(await this.servicos.criar(body));
  });

  atualizar = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof atualizarServicoSchema>;
    res.json(await this.servicos.atualizar(params.id, body));
  });

  definirAtivo = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof ativoSchema>;
    res.json(await this.servicos.definirAtivo(params.id, body.ativo));
  });

  excluir = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    await this.servicos.excluir(params.id);
    res.status(204).send();
  });
}
