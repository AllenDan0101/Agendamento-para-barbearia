/** Intervalo [inicio, fim) em ISO-8601. Fronteiras iguais não conflitam. */
export function intervalosConflitam(
  inicioA: string,
  fimA: string,
  inicioB: string,
  fimB: string,
): boolean {
  return inicioA < fimB && fimA > inicioB;
}

export function somarMinutos(iso: string, minutos: number): string {
  const instante = new Date(iso);
  if (Number.isNaN(instante.getTime())) {
    throw new Error('Data inválida');
  }
  return new Date(instante.getTime() + minutos * 60_000).toISOString();
}
