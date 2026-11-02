import type { NextFunction, Request, Response } from 'express';
import { tokenFoiRevogado } from '../auth/revogacao';
import { verificarToken } from '../auth/token';
import { AppError } from '../errors/app-error';
import { asyncHandler } from './async-handler';
import type { UsuarioRepository } from '../repositories/usuario.repository';

export function criarAutenticar(usuarios: UsuarioRepository) {
  return asyncHandler(async (req, _res, next) => {
    const cabecalho = req.header('authorization');
    if (!cabecalho?.startsWith('Bearer ')) {
      throw new AppError(401, 'Não autenticado');
    }
    const token = cabecalho.slice('Bearer '.length).trim();
    let conteudo;
    try {
      conteudo = verificarToken(token);
    } catch {
      throw new AppError(401, 'Token inválido ou expirado');
    }
    if (tokenFoiRevogado(conteudo.jti)) {
      throw new AppError(401, 'Sessão encerrada');
    }
    const usuario = await usuarios.buscarPorId(conteudo.sub);
    if (!usuario || !usuario.ativo) {
      throw new AppError(401, 'Sessão inválida');
    }
    req.token = { valor: token, jti: conteudo.jti, exp: conteudo.exp };
    req.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };
    next();
  });
}

export function somenteAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.usuario?.papel !== 'ADMIN') {
    next(new AppError(403, 'Acesso restrito a administradores'));
    return;
  }
  next();
}
