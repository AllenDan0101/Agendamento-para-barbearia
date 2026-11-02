import { afterEach, describe, expect, it } from 'vitest';
import type { Ator } from '../../src/domain/tipos';
import { ambienteDeServico, FUTURO, FUTURO_MEIA_HORA, FUTURO_QUINZE, PASSADO } from '../helpers';

describe('AgendamentoService', () => {
  let ambiente: Awaited<ReturnType<typeof ambienteDeServico>>;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  async function cenario() {
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
    const cliente = await ambiente.clienteService.criar({
      nome: 'João',
      telefone: '11988881111',
      email: 'joao@email.com',
    });
    const corte = await ambiente.servicoService.criar({ nome: 'Corte', duracaoMin: 30, preco: 45 });
    const barba = await ambiente.servicoService.criar({ nome: 'Barba', duracaoMin: 20, preco: 30 });
    const atorAdmin: Ator = { id: admin.id, nome: admin.nome, email: admin.email, papel: 'ADMIN' };
    const atorCaio: Ator = { id: atendente.id, nome: atendente.nome, email: atendente.email, papel: 'ATENDENTE' };
    return { admin, atendente, cliente, corte, barba, atorAdmin, atorCaio };
  }

  it('cria agendamento, bloqueia sobreposição e aceita horário encostado', async () => {
    const { cliente, corte, atorCaio } = await cenario();
    const primeiro = await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: FUTURO },
      atorCaio,
    );
    expect(primeiro.fim).toBe(FUTURO_MEIA_HORA);
    expect(primeiro.atendenteNome).toBe('Caio');

    await expect(
      ambiente.agendamentoService.criar(
        { clienteId: cliente.id, servicoId: corte.id, inicio: FUTURO_QUINZE },
        atorCaio,
      ),
    ).rejects.toMatchObject({ status: 409 });

    const encostado = await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: FUTURO_MEIA_HORA },
      atorCaio,
    );
    expect(encostado.id).not.toBe(primeiro.id);
  });

  it('rejeita passado, serviço inativo e atendente agendando para outro', async () => {
    const { cliente, corte, barba, atendente, atorAdmin, atorCaio } = await cenario();
    await expect(
      ambiente.agendamentoService.criar(
        { clienteId: cliente.id, servicoId: corte.id, inicio: PASSADO },
        atorAdmin,
      ),
    ).rejects.toMatchObject({ status: 422 });

    await ambiente.servicoService.definirAtivo(barba.id, false);
    await expect(
      ambiente.agendamentoService.criar(
        { clienteId: cliente.id, servicoId: barba.id, inicio: '2030-06-16T15:00:00.000Z' },
        atorAdmin,
      ),
    ).rejects.toMatchObject({ status: 422 });

    await expect(
      ambiente.agendamentoService.criar(
        {
          clienteId: cliente.id,
          servicoId: corte.id,
          usuarioId: atendente.id,
          inicio: '2030-06-16T15:00:00.000Z',
        },
        { ...atorCaio, id: atorAdmin.id, papel: 'ATENDENTE' },
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('cancelar libera o horário e remarcar persiste o novo início', async () => {
    const { cliente, corte, atorCaio } = await cenario();
    const marcado = await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: FUTURO },
      atorCaio,
    );
    const cancelado = await ambiente.agendamentoService.cancelar(marcado.id, atorCaio);
    expect(cancelado.status).toBe('CANCELADO');

    const deNovo = await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: FUTURO },
      atorCaio,
    );
    const remarcado = await ambiente.agendamentoService.remarcar(
      deNovo.id,
      { inicio: '2030-06-15T18:00:00.000Z' },
      atorCaio,
    );
    expect(remarcado.inicio).toBe('2030-06-15T18:00:00.000Z');
    expect(remarcado.fim).toBe('2030-06-15T18:30:00.000Z');

    const concluido = await ambiente.agendamentoService.concluir(remarcado.id, atorCaio);
    expect(concluido.status).toBe('CONCLUIDO');
    await expect(ambiente.agendamentoService.cancelar(concluido.id, atorCaio)).rejects.toMatchObject({
      status: 422,
    });
  });

  it('lista pelo dia de Brasília', async () => {
    const { cliente, corte, atorAdmin } = await cenario();
    await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: '2030-06-15T15:00:00.000Z' },
      atorAdmin,
    );
    await ambiente.agendamentoService.criar(
      { clienteId: cliente.id, servicoId: corte.id, inicio: '2030-06-16T15:00:00.000Z' },
      atorAdmin,
    );
    const dia = await ambiente.agendamentoService.listar({ data: '2030-06-15', clienteId: cliente.id });
    expect(dia).toHaveLength(1);
    expect(dia[0]?.inicio).toBe('2030-06-15T15:00:00.000Z');
  });
});
