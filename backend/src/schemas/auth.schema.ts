import { z } from 'zod';

const email = z
  .string({ required_error: 'Informe o e-mail' })
  .trim()
  .toLowerCase()
  .email('E-mail inválido')
  .max(160, 'E-mail muito longo');

const senhaCadastro = z
  .string({ required_error: 'Informe a senha' })
  .min(6, 'Senha deve ter ao menos 6 caracteres')
  .max(72, 'Senha deve ter no máximo 72 caracteres');

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Informe o e-mail' })
      .trim()
      .toLowerCase()
      .email('E-mail inválido'),
    senha: z.string({ required_error: 'Informe a senha' }).min(1, 'Informe a senha'),
  }),
});

export const cadastroSchema = z.object({
  body: z
    .object({
      nome: z
        .string({ required_error: 'Informe o nome' })
        .trim()
        .min(2, 'Nome deve ter ao menos 2 caracteres')
        .max(120, 'Nome deve ter no máximo 120 caracteres'),
      email,
      senha: senhaCadastro,
      confirmacaoSenha: z.string({ required_error: 'Confirme a senha' }).min(1, 'Confirme a senha'),
    })
    .refine((dados) => dados.senha === dados.confirmacaoSenha, {
      message: 'A confirmação de senha não confere',
      path: ['confirmacaoSenha'],
    }),
});
