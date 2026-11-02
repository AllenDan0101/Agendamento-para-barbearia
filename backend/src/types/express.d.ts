import type { Ator } from '../domain/tipos';

declare global {
  namespace Express {
    interface Request {
      usuario?: Ator;
      dados?: unknown;
      token?: { valor: string; jti: string; exp: number };
    }
  }
}

export {};
