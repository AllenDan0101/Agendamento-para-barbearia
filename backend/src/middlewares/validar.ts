import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/app-error';

export function validar<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!resultado.success) {
      next(
        new AppError(
          400,
          'Dados inválidos',
          resultado.error.issues.map((issue) => ({
            caminho: issue.path.join('.'),
            mensagem: issue.message,
          })),
        ),
      );
      return;
    }
    req.dados = resultado.data;
    next();
  };
}
