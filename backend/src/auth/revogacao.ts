const revogados = new Map<string, number>();

function varrer(agora = Date.now()): void {
  for (const [jti, expira] of revogados) {
    if (expira <= agora) revogados.delete(jti);
  }
}

export function revogarToken(jti: string, expiraEmSegundos: number): void {
  varrer();
  revogados.set(jti, expiraEmSegundos * 1000);
}

export function tokenFoiRevogado(jti: string): boolean {
  varrer();
  return revogados.has(jti);
}

export function limparRevogacoes(): void {
  revogados.clear();
}
