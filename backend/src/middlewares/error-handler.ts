import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export function tratarErro(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (erro instanceof AppError) {
    res.status(erro.status).json({
      erro: erro.message,
      ...(erro.detalhes !== undefined ? { detalhes: erro.detalhes } : {}),
    });
    return;
  }

  if (erro instanceof SyntaxError) {
    res.status(400).json({ erro: 'JSON inválido' });
    return;
  }

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}
