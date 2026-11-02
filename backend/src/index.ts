import { criarAplicacao } from './app';
import { carregarConfig } from './config';
import { criarBanco } from './db/criar-banco';
import { migrar } from './db/migrar';
import { semearSeVazio } from './db/seed';

async function main(): Promise<void> {
  const config = carregarConfig();
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('Defina JWT_SECRET em produção');
  }
  if (config.jwtSecret === 'segredo-de-desenvolvimento') {
    console.warn('JWT_SECRET padrão de desenvolvimento. Troque antes de expor a API.');
  }

  const banco = await criarBanco(config);
  await migrar(banco);
  if (config.seed) {
    const resultado = await semearSeVazio(banco);
    if (resultado.semeado) {
      console.log('Banco vazio populado com dados de demonstração.');
      console.log('Admin: admin@barbearia.local / admin123');
      console.log('Atendente: atendente@barbearia.local / atendente123');
    }
  }

  const { app } = criarAplicacao(banco, config);
  app.listen(config.port, () => {
    console.log(`API Navalha ouvindo em http://localhost:${config.port}`);
    console.log(`Banco: ${config.driver === 'postgres' ? 'PostgreSQL' : config.sqlitePath}`);
  });
}

if (require.main === module) {
  main().catch((erro: unknown) => {
    console.error(erro);
    process.exit(1);
  });
}
