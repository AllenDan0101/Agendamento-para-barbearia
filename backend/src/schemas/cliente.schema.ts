import { z } from 'zod';
import { idParamSchema } from './usuario.schema';

const nome = z
  .string({ required_error: 'Informe o nome' })
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(120, 'Nome deve ter no máximo 120 caracteres');

const telefone = z
  .string({ required_error: 'Informe o telefone' })
  .trim()
  .min(8, 'Telefone incompleto')
  .max(20, 'Telefone muito longo')
  .refine((valor) => {
    const digitos = valor.replace(/\D/g, '').length;
    return digitos >= 10 && digitos <= 11;
  }, 'Telefone deve ter DDD e número (10 ou 11 dígitos)');

const email = z.union([
  z.string().trim().toLowerCase().email('E-mail inválido').max(160),
  z.literal(''),
  z.null(),
]);

const corpo = z.object({
  nome,
  telefone,
  email: email.optional(),
});

export const listarClientesSchema = z.object({
  query: z.object({
    busca: z.string().trim().max(120).optional(),
    ativo: z.enum(['true', 'false']).optional(),
  }),
});

export const criarClienteSchema = z.object({ body: corpo });

export const atualizarClienteSchema = idParamSchema.extend({ body: corpo });
