import type { NextFunction, Request, Response } from 'express';

export function asyncHandler(
  trabalho: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    trabalho(req, res, next).catch(next);
  };
}
