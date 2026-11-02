import cors from 'cors';
import express from 'express';
import type { Config } from './config';
import { compor, type Dependencias } from './composition';
import type { DbClient } from './db/cliente-banco';
import { AppError } from './errors/app-error';
import { tratarErro } from './middlewares/error-handler';
import { criarRotas } from './routes';

export function criarAplicacao(banco: DbClient, config: Config): { app: express.Express } & Dependencias {
  const deps = compor(banco);
  const app = express();
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', criarRotas(deps));
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      next(new AppError(404, 'Rota não encontrada'));
      return;
    }
    next(new AppError(404, 'Não encontrado'));
  });
  app.use(tratarErro);
  return { app, ...deps };
}
