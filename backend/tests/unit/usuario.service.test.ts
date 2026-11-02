import { afterEach, describe, expect, it } from 'vitest';
import { ambienteDeServico } from '../helpers';

describe('UsuarioService', () => {
  let ambiente: Awaited<ReturnType<typeof ambienteDeServico>>;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  it('não remove o último administrador ativo nem o próprio usuário', async () => {
    ambiente = await ambienteDeServico();
    const admin = await ambiente.usuarioService.criar({
      nome: 'Helena',
      email: 'admin@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    const atendente = await ambiente.usuarioService.criar({
      nome: 'Caio',
      email: 'caio@teste.local',
      senha: 'atendente123',
      papel: 'ATENDENTE',
    });
    await expect(
      ambiente.usuarioService.definirAtivo(admin.id, false, {
        id: atendente.id,
        nome: atendente.nome,
        email: atendente.email,
        papel: atendente.papel,
      }),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      ambiente.usuarioService.definirAtivo(admin.id, false, {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        papel: admin.papel,
      }),
    ).rejects.toMatchObject({ status: 422 });

    const outro = await ambiente.usuarioService.criar({
      nome: 'Bruno',
      email: 'bruno@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    await ambiente.usuarioService.definirAtivo(admin.id, false, {
      id: outro.id,
      nome: outro.nome,
      email: outro.email,
      papel: outro.papel,
    });
    const listagem = await ambiente.usuarioService.listar();
    expect(listagem.find((usuario) => usuario.id === admin.id)?.ativo).toBe(false);
    expect(listagem.every((usuario) => !('senhaHash' in usuario))).toBe(true);
  });
});
