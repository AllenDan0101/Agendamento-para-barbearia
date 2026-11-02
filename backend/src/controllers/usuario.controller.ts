import type { Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import type { ativoSchema, atualizarUsuarioSchema, criarUsuarioSchema } from '../schemas/usuario.schema';
import type { UsuarioService } from '../services/usuario.service';
import type { z } from 'zod';

export class UsuarioController {
  constructor(private readonly usuarios: UsuarioService) {}

  listar = asyncHandler(async (_req, res: Response) => {
    res.json(await this.usuarios.listar());
  });

  buscar = asyncHandler(async (req, res: Response) => {
    const { params } = req.dados as { params: { id: string } };
    res.json(await this.usuarios.buscar(params.id));
  });

  criar = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as z.infer<typeof criarUsuarioSchema>;
    const criado = await this.usuarios.criar(body);
    res.status(201).json(criado);
  });

  atualizar = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof atualizarUsuarioSchema>;
    const senha = body.senha ? body.senha : undefined;
    const atualizado = await this.usuarios.atualizar(params.id, { ...body, senha });
    res.json(atualizado);
  });

  definirAtivo = asyncHandler(async (req, res: Response) => {
    const { params, body } = req.dados as z.infer<typeof ativoSchema>;
    const atualizado = await this.usuarios.definirAtivo(params.id, body.ativo, req.usuario!);
    res.json(atualizado);
  });
}
