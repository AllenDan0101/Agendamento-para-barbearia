import { assinarToken } from '../auth/token';
import { normalizarEmail } from '../domain/texto';
import type { UsuarioPublico } from '../domain/tipos';
import { semSenha } from '../domain/tipos';
import { AppError } from '../errors/app-error';
import type { UsuarioRepository } from '../repositories/usuario.repository';
import { compararSenha } from '../utils/senha';

export class AuthService {
  constructor(private readonly usuarios: UsuarioRepository) {}

  async entrar(email: string, senha: string): Promise<{ token: string; usuario: UsuarioPublico }> {
    const normalizado = normalizarEmail(email);
    const usuario = normalizado ? await this.usuarios.buscarPorEmail(normalizado) : undefined;
    const senhaConfere = usuario ? await compararSenha(senha, usuario.senhaHash) : false;
    if (!usuario || !senhaConfere) {
      throw new AppError(401, 'E-mail ou senha inválidos');
    }
    if (!usuario.ativo) {
      throw new AppError(403, 'Usuário inativo');
    }
    const token = assinarToken({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    });
    return { token, usuario: semSenha(usuario) };
  }

  async eu(id: string): Promise<UsuarioPublico> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario || !usuario.ativo) throw new AppError(401, 'Sessão inválida');
    return semSenha(usuario);
  }
}
