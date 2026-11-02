import { AppError } from '../errors/app-error';

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function normalizarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor);
  if (digitos.length < 10 || digitos.length > 11) {
    throw new AppError(422, 'Telefone deve ter DDD e número (10 ou 11 dígitos)');
  }
  return digitos;
}

export function normalizarEmail(valor: string | null | undefined): string | null {
  if (valor == null) return null;
  const limpo = valor.trim().toLowerCase();
  return limpo.length === 0 ? null : limpo;
}

export function normalizarTexto(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}
