import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { carregarConfig } from '../config';
import type { Papel } from '../domain/tipos';

export type TokenConteudo = {
  sub: string;
  nome: string;
  email: string;
  papel: Papel;
  jti: string;
  exp: number;
};

export function assinarToken(dados: {
  sub: string;
  nome: string;
  email: string;
  papel: Papel;
}): string {
  const config = carregarConfig();
  const opcoes: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    jwtid: randomUUID(),
  };
  return jwt.sign(
    { nome: dados.nome, email: dados.email, papel: dados.papel },
    config.jwtSecret,
    { ...opcoes, subject: dados.sub },
  );
}

export function verificarToken(token: string): TokenConteudo {
  const config = carregarConfig();
  const decodificado = jwt.verify(token, config.jwtSecret);
  if (typeof decodificado === 'string') {
    throw new Error('Token inválido');
  }
  const sub = decodificado.sub;
  const nome = decodificado.nome;
  const email = decodificado.email;
  const papel = decodificado.papel;
  const jti = decodificado.jti;
  const exp = decodificado.exp;
  if (
    typeof sub !== 'string' ||
    typeof nome !== 'string' ||
    typeof email !== 'string' ||
    (papel !== 'ADMIN' && papel !== 'ATENDENTE') ||
    typeof jti !== 'string' ||
    typeof exp !== 'number'
  ) {
    throw new Error('Token inválido');
  }
  return { sub, nome, email, papel, jti, exp };
}
