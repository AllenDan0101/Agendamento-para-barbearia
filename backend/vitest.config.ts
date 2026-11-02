import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    setupFiles: ['./tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'segredo-de-teste-com-32-caracteres',
      BCRYPT_COST: '4',
      SEED: 'false',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/services/**/*.ts', 'src/domain/**/*.ts', 'src/repositories/**/*.ts'],
    },
  },
});
