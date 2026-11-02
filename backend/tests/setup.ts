import { afterEach } from 'vitest';
import { limparRevogacoes } from '../src/auth/revogacao';

afterEach(() => {
  limparRevogacoes();
});
