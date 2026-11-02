import { describe, expect, it } from 'vitest';
import { instanteNoFuso, limitesDoDia } from '../../src/domain/fuso';
import { intervalosConflitam, somarMinutos } from '../../src/domain/horario';
import { normalizarEmail, normalizarTelefone } from '../../src/domain/texto';

describe('horários', () => {
  it('não trata horários encostados como conflito', () => {
    expect(intervalosConflitam(
      '2030-06-15T15:00:00.000Z',
      '2030-06-15T15:30:00.000Z',
      '2030-06-15T15:30:00.000Z',
      '2030-06-15T16:00:00.000Z',
    )).toBe(false);
  });

  it('detecta sobreposição parcial', () => {
    expect(intervalosConflitam(
      '2030-06-15T15:00:00.000Z',
      '2030-06-15T15:30:00.000Z',
      '2030-06-15T15:15:00.000Z',
      '2030-06-15T15:45:00.000Z',
    )).toBe(true);
  });

  it('soma minutos em UTC', () => {
    expect(somarMinutos('2030-06-15T15:00:00.000Z', 30)).toBe('2030-06-15T15:30:00.000Z');
  });
});

describe('fuso de Brasília', () => {
  it('converte 15h locais para 18h UTC', () => {
    expect(instanteNoFuso('2026-11-02', '15:00').toISOString()).toBe('2026-11-02T18:00:00.000Z');
  });

  it('delimita o dia civil em America/Sao_Paulo', () => {
    const limites = limitesDoDia('2026-11-02');
    expect(limites.inicio).toBe('2026-11-02T03:00:00.000Z');
    expect(new Date(limites.fim).getTime()).toBe(new Date('2026-11-03T02:59:59.999Z').getTime());
  });
});

describe('texto', () => {
  it('normaliza telefone e e-mail', () => {
    expect(normalizarTelefone('(11) 98888-1111')).toBe('11988881111');
    expect(normalizarEmail('  Ana@Email.com ')).toBe('ana@email.com');
    expect(normalizarEmail('   ')).toBeNull();
  });

  it('rejeita telefone sem DDD', () => {
    expect(() => normalizarTelefone('988881111')).toThrow(/10 ou 11/);
  });
});
