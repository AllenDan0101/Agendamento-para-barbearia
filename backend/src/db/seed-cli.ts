import { carregarConfig } from '../config';
import { criarBanco } from './criar-banco';
import { migrar } from './migrar';
import { semearSeVazio } from './seed';

async function main(): Promise<void> {
  const config = carregarConfig();
  const banco = await criarBanco(config);
  await migrar(banco);
  const resultado = await semearSeVazio(banco);
  if (resultado.semeado) {
    console.log('Dados de demonstração inseridos.');
    console.log('Admin: admin@barbearia.local / admin123');
    console.log('Atendente: atendente@barbearia.local / atendente123');
  } else {
    console.log('O banco já possui usuários. Seed ignorado.');
  }
  await banco.fechar();
}

main().catch((erro: unknown) => {
  console.error(erro);
  process.exit(1);
});
