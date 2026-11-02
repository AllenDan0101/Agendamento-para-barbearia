import { z } from 'zod';

const papel = z.enum(['ADMIN', 'ATENDENTE'], {
  errorMap: () => ({ message: 'Papel deve ser ADMIN ou ATENDENTE' }),
});

const nome = z
  .string({ required_error: 'Informe o nome' })
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(120, 'Nome deve ter no máximo 120 caracteres');

const email = z
  .string({ required_error: 'Informe o e-mail' })
  .trim()
  .toLowerCase()
  .email('E-mail inválido')
  .max(160, 'E-mail muito longo');

const senha = z
  .string({ required_error: 'Informe a senha' })
  .min(6, 'Senha deve ter ao menos 6 caracteres')
  .max(72, 'Senha deve ter no máximo 72 caracteres');

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Identificador inválido'),
  }),
});

export const criarUsuarioSchema = z.object({
  body: z.object({
    nome,
    email,
    senha,
    papel,
  }),
});

export const atualizarUsuarioSchema = idParamSchema.extend({
  body: z.object({
    nome,
    email,
    papel,
    senha: z.union([senha, z.literal('')]).optional(),
  }),
});

export const ativoSchema = idParamSchema.extend({
  body: z.object({
    ativo: z.boolean({ required_error: 'Informe se o registro fica ativo', invalid_type_error: 'Ativo deve ser verdadeiro ou falso' }),
  }),
});
