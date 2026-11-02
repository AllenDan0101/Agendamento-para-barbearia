import { afterEach, describe, expect, it } from 'vitest';
import { ambienteDeServico } from '../helpers';

describe('ClienteService', () => {
  let ambiente: Awaited<ReturnType<typeof ambienteDeServico>>;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  it('cadastra, busca por nome e impede telefone duplicado', async () => {
    ambiente = await ambienteDeServico();
    const criado = await ambiente.clienteService.criar({
      nome: 'João Ferreira',
      telefone: '(11) 98888-1111',
      email: 'Joao@email.com',
    });
    expect(criado.telefone).toBe('11988881111');
    expect(criado.email).toBe('joao@email.com');

    const busca = await ambiente.clienteService.listar('ferreira');
    expect(busca).toHaveLength(1);

    await expect(
      ambiente.clienteService.criar({
        nome: 'Outro João',
        telefone: '11988881111',
        email: 'outro@email.com',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('impede e-mail duplicado e permite e-mail vazio', async () => {
    ambiente = await ambienteDeServico();
    await ambiente.clienteService.criar({
      nome: 'Ana',
      telefone: '11955554444',
      email: '',
    });
    await ambiente.clienteService.criar({
      nome: 'Bia',
      telefone: '11955554445',
      email: 'bia@email.com',
    });
    await expect(
      ambiente.clienteService.criar({
        nome: 'Cia',
        telefone: '11955554446',
        email: 'bia@email.com',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
