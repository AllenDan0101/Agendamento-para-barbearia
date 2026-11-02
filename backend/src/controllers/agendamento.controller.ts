import type { Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import type {
  criarAgendamentoSchema,
  listarAgendamentosSchema,
  remarcarAgendamentoSchema,
} from '../schemas/agendamento.schema';
import type { AgendamentoService } from '../services/agendamento.service';
import type { z } from 'zod';

export class AgendamentoController {
  constructor(private readonly agendamentos: AgendamentoService) {}

  listar = asyncHandler(async (req, res: Response) => {
    const { query } = req.dados as z.infer<typeof listarAgendamentosSchema>;
    res.json(await this.agendamentos.listar(query));
  });

  buscar = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.agendamentos.buscar(params.id));
  });

  criar = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as z.infer<typeof criarAgendamentoSchema>;
    const criado = await this.agendamentos.criar(body, req.usuario!);
    res.status(201).json(criado);
  });

  remarcar = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof remarcarAgendamentoSchema>;
    res.json(await this.agendamentos.remarcar(params.id, body, req.usuario!));
  });

  cancelar = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.agendamentos.cancelar(params.id, req.usuario!));
  });

  concluir = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.agendamentos.concluir(params.id, req.usuario!));
  });
}
