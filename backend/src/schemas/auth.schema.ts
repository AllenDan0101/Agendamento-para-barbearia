import { z } from 'zod';

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
