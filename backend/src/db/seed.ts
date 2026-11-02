import { dataHojeLocal, instanteNoFuso } from '../domain/fuso';
import { somarMinutos } from '../domain/horario';
import type { DbClient } from './cliente-banco';
import { compor } from '../composition';

function isoNoDia(data: string, hora: string): string {
  return instanteNoFuso(data, hora).toISOString();
}

function diaSeguinte(data: string): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  const utc = new Date(Date.UTC(ano, mes - 1, dia));
  utc.setUTCDate(utc.getUTCDate() + 1);
  return utc.toISOString().slice(0, 10);
}

export async function semearSeVazio(banco: DbClient): Promise<{ semeado: boolean }> {
  const deps = compor(banco);
  const existentes = await deps.usuarioService.listar();
  if (existentes.length > 0) return { semeado: false };

  const helena = await deps.usuarioService.criar({
    nome: 'Helena Prado',
    email: 'admin@barbearia.local',
    senha: 'admin123',
    papel: 'ADMIN',
  });
  const caio = await deps.usuarioService.criar({
    nome: 'Caio Nunes',
    email: 'atendente@barbearia.local',
    senha: 'atendente123',
    papel: 'ATENDENTE',
  });

  const joao = await deps.clienteService.criar({
    nome: 'João Ferreira',
    telefone: '11988881111',
    email: 'joao.ferreira@email.com',
  });
  const carlos = await deps.clienteService.criar({
    nome: 'Carlos Mendes',
    telefone: '11977772222',
    email: 'carlos.mendes@email.com',
  });
  const ricardo = await deps.clienteService.criar({
    nome: 'Ricardo Souza',
    telefone: '11966663333',
    email: null,
  });
  const ana = await deps.clienteService.criar({
    nome: 'Ana Paula Dias',
    telefone: '11955554444',
    email: 'ana.dias@email.com',
  });
  await deps.clienteService.criar({
    nome: 'Paulo Ribeiro',
    telefone: '11944445555',
    email: 'paulo.ribeiro@email.com',
  });

  const corte = await deps.servicoService.criar({ nome: 'Corte masculino', duracaoMin: 30, preco: 45 });
  const barba = await deps.servicoService.criar({ nome: 'Barba', duracaoMin: 20, preco: 30 });
  const combo = await deps.servicoService.criar({ nome: 'Corte e barba', duracaoMin: 50, preco: 70 });
  const sobrancelha = await deps.servicoService.criar({ nome: 'Sobrancelha', duracaoMin: 15, preco: 20 });
  const platinado = await deps.servicoService.criar({ nome: 'Platinado', duracaoMin: 90, preco: 150 });
  await deps.servicoService.definirAtivo(platinado.id, false);

  const hoje = dataHojeLocal();
  const amanha = diaSeguinte(hoje);

  const marcar = async (
    clienteId: string,
    servicoId: string,
    usuarioId: string,
    data: string,
    hora: string,
    duracao: number,
    observacao: string | null,
    status: 'AGENDADO' | 'CANCELADO' = 'AGENDADO',
  ) => {
    const inicio = isoNoDia(data, hora);
    await deps.repositorios.agendamentos.inserir({
      clienteId,
      servicoId,
      usuarioId,
      inicio,
      fim: somarMinutos(inicio, duracao),
      observacao,
      status,
    });
  };

  await marcar(joao.id, corte.id, caio.id, hoje, '09:00', 30, 'Prefere tesoura.');
  await marcar(carlos.id, barba.id, caio.id, hoje, '10:00', 20, null);
  await marcar(ricardo.id, combo.id, helena.id, hoje, '14:00', 50, null);
  await marcar(ana.id, sobrancelha.id, caio.id, hoje, '16:00', 15, 'Cliente desmarcou por telefone.', 'CANCELADO');
  await marcar(ana.id, sobrancelha.id, caio.id, amanha, '11:00', 15, null);

  return { semeado: true };
}
