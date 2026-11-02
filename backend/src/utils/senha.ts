import bcrypt from 'bcryptjs';

export function custoBcrypt(): number {
  const valor = Number(process.env.BCRYPT_COST ?? 10);
  if (!Number.isInteger(valor) || valor < 4 || valor > 15) return 10;
  return valor;
}

export function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, custoBcrypt());
}

export function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
