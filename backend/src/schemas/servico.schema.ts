import { z } from 'zod';
import { idParamSchema } from './usuario.schema';

const preco = z
  .number({ required_error: 'Informe o preço', invalid_type_error: 'Preço inválido' })
  .min(0, 'Preço não pode ser negativo')
  .max(10000, 'Preço acima do limite')
  .refine(
    (valor) => Number.isFinite(valor) && Math.abs(valor * 100 - Math.round(valor * 100)) < 0.001,
    'Use no máximo 2 casas decimais',
  );

const corpo = z.object({
  nome: z
    .string({ required_error: 'Informe o nome' })
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  duracaoMin: z
    .number({ required_error: 'Informe a duração', invalid_type_error: 'Duração inválida' })
    .int('Duração deve ser um número inteiro de minutos')
    .positive('Duração deve ser maior que zero')
    .max(480, 'Duração máxima é de 8 horas'),
  preco,
});

export const listarServicosSchema = z.object({
  query: z.object({
    ativo: z.enum(['true', 'false']).optional(),
  }),
});

export const criarServicoSchema = z.object({ body: corpo });

export const atualizarServicoSchema = idParamSchema.extend({ body: corpo });
