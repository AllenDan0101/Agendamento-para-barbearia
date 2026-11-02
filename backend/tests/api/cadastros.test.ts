import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarUsuario, subir, tokenDe, type Ambiente } from '../helpers';

describe('API de clientes e usuários', () => {
  let ambiente: Ambiente;
  let adminToken: string;
  let atendenteToken: string;

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
    await criarUsuario(ambiente, {
      nome: 'Caio',
      email: 'caio@teste.local',
      senha: 'atendente123',
      papel: 'ATENDENTE',
    });
    adminToken = await tokenDe(ambiente.app, 'admin@teste.local', 'admin123');
    atendenteToken = await tokenDe(ambiente.app, 'caio@teste.local', 'atendente123');
  }

  it('faz CRUD de cliente e rejeita telefone repetido', async () => {
    await autenticar();
    const criado = await request(ambiente.app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ nome: 'João Ferreira', telefone: '(11) 98888-1111', email: 'joao@email.com' });
    expect(criado.status).toBe(201);
    expect(criado.body.telefone).toBe('11988881111');

    const lista = await request(ambiente.app)
      .get('/api/clientes')
      .query({ busca: 'João' })
      .set('Authorization', `Bearer ${atendenteToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);

    const editado = await request(ambiente.app)
      .put(`/api/clientes/${criado.body.id}`)
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ nome: 'João F. Silva', telefone: '11988881111', email: 'joao@email.com' });
    expect(editado.status).toBe(200);
    expect(editado.body.nome).toBe('João F. Silva');

    const duplicado = await request(ambiente.app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Outro', telefone: '11988881111', email: 'outro@email.com' });
    expect(duplicado.status).toBe(409);

    const inativo = await request(ambiente.app)
      .patch(`/api/clientes/${criado.body.id}/ativo`)
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({ ativo: false });
    expect(inativo.status).toBe(200);
    expect(inativo.body.ativo).toBe(false);
  });

  it('restringe usuários ao admin e valida a borda', async () => {
    await autenticar();
    const proibido = await request(ambiente.app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({
        nome: 'Novo',
        email: 'novo@teste.local',
        senha: 'senha123',
        papel: 'ATENDENTE',
      });
    expect(proibido.status).toBe(403);

    const invalido = await request(ambiente.app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'A', telefone: '123' });
    expect(invalido.status).toBe(400);
    expect(invalido.body.erro).toBe('Dados inválidos');

    const criado = await request(ambiente.app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Diana',
        email: 'diana@teste.local',
        senha: 'senha123',
        papel: 'ATENDENTE',
      });
    expect(criado.status).toBe(201);
    expect(criado.body.senhaHash).toBeUndefined();

    const lista = await request(ambiente.app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThanOrEqual(3);
  });
});
