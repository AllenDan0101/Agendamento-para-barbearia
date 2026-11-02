import { z } from 'zod';
import { idParamSchema } from './usuario.schema';

const inicio = z.string({ required_error: 'Informe a data e a hora' }).datetime({
  message: 'Data/hora inválida. Envie um instante ISO, por exemplo 2030-06-15T18:00:00.000Z',
});

const observacao = z.string().trim().max(500, 'Observação deve ter no máximo 500 caracteres').nullable().optional();

export const listarAgendamentosSchema = z.object({
  query: z.object({
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
      .optional(),
    clienteId: z.string().uuid('Cliente inválido').optional(),
  }),
});

export const criarAgendamentoSchema = z.object({
  body: z.object({
    clienteId: z.string().uuid('Cliente inválido'),
    servicoId: z.string().uuid('Serviço inválido'),
    usuarioId: z.string().uuid('Atendente inválido').optional(),
    inicio,
    observacao,
  }),
});

export const remarcarAgendamentoSchema = idParamSchema.extend({
  body: z.object({
    inicio,
    servicoId: z.string().uuid('Serviço inválido').optional(),
    observacao,
  }),
});
