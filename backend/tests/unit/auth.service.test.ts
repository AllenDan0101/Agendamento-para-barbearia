import { afterEach, describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors/app-error';
import { ambienteDeServico, type Ambiente } from '../helpers';

describe('AuthService', () => {
  let ambiente: Awaited<ReturnType<typeof ambienteDeServico>>;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  async function preparar() {
    ambiente = await ambienteDeServico();
    await ambiente.usuarioService.criar({
      nome: 'Helena',
      email: 'helena@teste.local',
      senha: 'segura1',
      papel: 'ADMIN',
    });
    return ambiente;
  }

  it('emite token para credenciais válidas e não devolve o hash', async () => {
    const ctx = await preparar();
    const sessao = await ctx.authService.entrar('Helena@teste.local', 'segura1');
    expect(sessao.token).toEqual(expect.any(String));
    expect(sessao.usuario.email).toBe('helena@teste.local');
    expect(sessao.usuario).not.toHaveProperty('senhaHash');
  });

  it('rejeita senha incorreta', async () => {
    const ctx = await preparar();
    await expect(ctx.authService.entrar('helena@teste.local', 'errada')).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<AppError>);
  });

  it('nega acesso de usuário inativo mesmo com a senha correta', async () => {
    const ctx = await preparar();
    const [admin] = await ctx.usuarioService.listar();
    await ctx.usuarioService.criar({
      nome: 'Inativo',
      email: 'inativo@teste.local',
      senha: 'segura1',
      papel: 'ATENDENTE',
    });
    const usuarios = await ctx.repositorios.usuarios.listar();
    const inativo = usuarios.find((usuario) => usuario.email === 'inativo@teste.local');
    if (!inativo || !admin) throw new Error('fixtures ausentes');
    await ctx.usuarioService.definirAtivo(inativo.id, false, {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      papel: admin.papel,
    });
    await expect(ctx.authService.entrar('inativo@teste.local', 'segura1')).rejects.toMatchObject({
      status: 403,
    });
  });
});
