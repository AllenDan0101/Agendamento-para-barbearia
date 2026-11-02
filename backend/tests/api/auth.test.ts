import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarUsuario, subir, tokenDe, type Ambiente } from '../helpers';

describe('API de autenticação', () => {
  let ambiente: Ambiente;

  afterEach(async () => {
    await ambiente?.fechar();
  });

  it('faz login, consulta a sessão e invalida o token no logout', async () => {
    ambiente = await subir();
    await criarUsuario(ambiente, {
      nome: 'Helena Prado',
      email: 'admin@barbearia.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });

    const login = await request(ambiente.app)
      .post('/api/auth/login')
      .send({ email: 'admin@barbearia.local', senha: 'admin123' });
    expect(login.status).toBe(200);
    expect(login.body.usuario.papel).toBe('ADMIN');
    expect(login.body.usuario.senhaHash).toBeUndefined();

    const token = login.body.token as string;
    const eu = await request(ambiente.app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(eu.status).toBe(200);
    expect(eu.body.email).toBe('admin@barbearia.local');

    const logout = await request(ambiente.app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logout.status).toBe(204);

    const depois = await request(ambiente.app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(depois.status).toBe(401);
  });

  it('recusa credenciais inválidas e rota sem token', async () => {
    ambiente = await subir();
    await criarUsuario(ambiente, {
      nome: 'Helena',
      email: 'admin@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    const invalido = await request(ambiente.app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.local', senha: 'nao-e-essa' });
    expect(invalido.status).toBe(401);

    const semToken = await request(ambiente.app).get('/api/clientes');
    expect(semToken.status).toBe(401);

    const saude = await request(ambiente.app).get('/api/saude');
    expect(saude.status).toBe(200);
    expect(saude.body.status).toBe('ok');
  });

  it('responde 400 quando o corpo do login é inválido', async () => {
    ambiente = await subir();
    const resposta = await request(ambiente.app).post('/api/auth/login').send({ email: 'nao-e-email' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Dados inválidos');
    expect(resposta.body.detalhes.length).toBeGreaterThan(0);
  });

  it('permite obter token pelo helper de teste', async () => {
    ambiente = await subir();
    await criarUsuario(ambiente, {
      nome: 'Helena',
      email: 'admin@teste.local',
      senha: 'admin123',
      papel: 'ADMIN',
    });
    const token = await tokenDe(ambiente.app, 'admin@teste.local', 'admin123');
    expect(token.split('.')).toHaveLength(3);
  });
});
