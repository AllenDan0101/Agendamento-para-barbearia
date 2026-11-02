export class AppError extends Error {
  readonly status: number;
  readonly detalhes?: unknown;

  constructor(status: number, message: string, detalhes?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}
