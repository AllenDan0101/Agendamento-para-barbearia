export function ehViolacaoUnica(erro: unknown): boolean {
  if (!erro || typeof erro !== 'object') return false;
  const candidato = erro as { code?: string; message?: string };
  if (candidato.code === '23505') return true;
  return candidato.message?.includes('UNIQUE') ?? false;
}

export function comoNumero(valor: unknown): number {
  return Number(valor ?? 0);
}
