import { afterEach, describe, expect, it } from 'vitest';
import { ambienteDeServico } from '../helpers';

describe('ServicoService', () => {
  let ambiente: Awaited<ReturnType<typeof ambienteDeServico>>;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  it('cria serviço com preço em reais e rejeita duração inválida', async () => {
    ambiente = await ambienteDeServico();
    const corte = await ambiente.servicoService.criar({
      nome: 'Corte masculino',
      duracaoMin: 30,
      preco: 45,
    });
    expect(corte.preco).toBe(45);
    expect(corte.ativo).toBe(true);

    await expect(
      ambiente.servicoService.criar({ nome: 'Inválido', duracaoMin: 0, preco: 10 }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('impede exclusão definitiva quando o serviço já foi usado', async () => {
    ambiente = await ambienteDeServico();
    const admin = await ambiente.usuarioService.criar({
      nome: 'Admin',
      email: 'admin@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    const cliente = await ambiente.clienteService.criar({
      nome: 'Carlos',
      telefone: '11977772222',
    });
    const servico = await ambiente.servicoService.criar({
      nome: 'Barba',
      duracaoMin: 20,
      preco: 30,
    });
    await ambiente.agendamentoService.criar(
      {
        clienteId: cliente.id,
        servicoId: servico.id,
        inicio: '2030-06-15T15:00:00.000Z',
      },
      { id: admin.id, nome: admin.nome, email: admin.email, papel: admin.papel },
    );

    await expect(ambiente.servicoService.excluir(servico.id)).rejects.toMatchObject({ status: 409 });
    const livre = await ambiente.servicoService.criar({ nome: 'Hidratação', duracaoMin: 25, preco: 40 });
    await ambiente.servicoService.excluir(livre.id);
    await expect(ambiente.servicoService.buscar(livre.id)).rejects.toMatchObject({ status: 404 });
  });
});
