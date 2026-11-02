import type { Response } from 'express';
import { revogarToken } from '../auth/revogacao';
import { asyncHandler } from '../middlewares/async-handler';
import type { cadastroSchema, loginSchema } from '../schemas/auth.schema';
import type { AuthService } from '../services/auth.service';
import type { UsuarioService } from '../services/usuario.service';
import type { z } from 'zod';

type Login = z.infer<typeof loginSchema>;
type Cadastro = z.infer<typeof cadastroSchema>;

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usuarios: UsuarioService,
  ) {}

  login = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as Login;
    const sessao = await this.auth.entrar(body.email, body.senha);
    res.status(200).json(sessao);
  });

  cadastrar = asyncHandler(async (req, res: Response) => {
    const { body } = req.dados as Cadastro;
    await this.usuarios.cadastrarPublico({
      nome: body.nome,
      email: body.email,
      senha: body.senha,
    });
    const sessao = await this.auth.entrar(body.email, body.senha);
    res.status(201).json(sessao);
  });

  eu = asyncHandler(async (req, res: Response) => {
    const usuario = await this.auth.eu(req.usuario!.id);
    res.json(usuario);
  });

  logout = asyncHandler(async (req, res: Response) => {
    if (req.token) revogarToken(req.token.jti, req.token.exp);
    res.status(204).send();
  });
}
