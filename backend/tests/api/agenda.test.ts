import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarUsuario, FUTURO, FUTURO_QUINZE, subir, tokenDe, type Ambiente } from '../helpers';

describe('API de serviços e agendamentos', () => {
  let ambiente: Ambiente;
  let adminToken: string;
  let atendenteToken: string;
  let atendenteId: string;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  async function autenticar() {
    ambiente = await subir();
    await criarUsuario(ambiente, {
      nome: 'Helena',
      email: 'admin@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    const atendente = await criarUsuario(ambiente, {
      nome: 'Caio',
      email: 'caio@teste.local',
      senha: 'atendente123',
      papel: 'ATENDENTE',
    });
    atendenteId = atendente.id;
    adminToken = await tokenDe(ambiente.app, 'admin@teste.local', 'admin123');
    atendenteToken = await tokenDe(ambiente.app, 'caio@teste.local', 'atendente123');
  }

  async function clienteEServico() {
    const cliente = await request(ambiente.app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'João Ferreira', telefone: '11988881111', email: 'joao@email.com' });
    const servico = await request(ambiente.app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Corte masculino', duracaoMin: 30, preco: 45 });
    return { clienteId: cliente.body.id as string, servicoId: servico.body.id as string };
  }

  it('impede o atendente de alterar o catálogo e permite a leitura', async () => {
    await autenticar();
    const negado = await request(ambiente.app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ nome: 'Barba', duracaoMin: 20, preco: 30 });
    expect(negado.status).toBe(403);

    const criado = await request(ambiente.app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Barba', duracaoMin: 20, preco: 30 });
    expect(criado.status).toBe(201);

    const lista = await request(ambiente.app)
      .get('/api/servicos')
      .set('Authorization', `Bearer ${atendenteToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body[0].nome).toBe('Barba');

    const exclusaoNegada = await request(ambiente.app)
      .delete(`/api/servicos/${criado.body.id}`)
      .set('Authorization', `Bearer ${atendenteToken}`);
    expect(exclusaoNegada.status).toBe(403);

    const exclusao = await request(ambiente.app)
      .delete(`/api/servicos/${criado.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(exclusao.status).toBe(204);
  });

  it('cria agendamento, rejeita conflito e libera o horário ao cancelar', async () => {
    await autenticar();
    const { clienteId, servicoId } = await clienteEServico();

    const criado = await request(ambiente.app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ clienteId, servicoId, inicio: FUTURO, observacao: 'Tesoura' });
    expect(criado.status).toBe(201);
    expect(criado.body.status).toBe('AGENDADO');
    expect(criado.body.fim).toBe('2030-06-15T15:30:00.000Z');
    expect(criado.body.usuarioId).toBe(atendenteId);

    const conflito = await request(ambiente.app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ clienteId, servicoId, inicio: FUTURO_QUINZE });
    expect(conflito.status).toBe(409);

    const noPassado = await request(ambiente.app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ clienteId, servicoId, inicio: '2020-01-15T15:00:00.000Z' });
    expect(noPassado.status).toBe(422);

    const cancelado = await request(ambiente.app)
      .patch(`/api/agendamentos/${criado.body.id}/cancelar`)
      .set('Authorization', `Bearer ${atendenteToken}`);
    expect(cancelado.status).toBe(200);
    expect(cancelado.body.status).toBe('CANCELADO');

    const relancado = await request(ambiente.app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ clienteId, servicoId, inicio: FUTURO });
    expect(relancado.status).toBe(201);

    const doDia = await request(ambiente.app)
      .get('/api/agendamentos')
      .query({ data: '2030-06-15', clienteId })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(doDia.status).toBe(200);
    expect(doDia.body).toHaveLength(2);

    const concluido = await request(ambiente.app)
      .patch(`/api/agendamentos/${relancado.body.id}/concluir`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(concluido.status).toBe(200);
    expect(concluido.body.status).toBe('CONCLUIDO');
  });

  it('responde 404 para rota inexistente', async () => {
    ambiente = await subir();
    const resposta = await request(ambiente.app).get('/api/nao-existe');
    expect(resposta.status).toBe(404);
  });
});
