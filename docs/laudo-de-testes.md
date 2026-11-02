# Laudo de testes — Navalha

Registro da execução feita neste ambiente, em 2 de novembro de 2026. Os números abaixo saíram do terminal; não foram estimados.

## Ambiente

| Item | Valor |
|------|--------|
| Data e hora (UTC) | 2026-11-02T01:46:43+00:00 |
| Diretório | `/workspace` (raiz do repositório) |
| Node.js | v22.23.4 |
| npm | 10.9.9 |
| Vitest | 2.1.9 |
| Cobertura | `@vitest/coverage-v8` |
| Sistema | Linux |

O Node imprime `ExperimentalWarning: SQLite is an experimental feature` porque a API usa `node:sqlite`. O aviso apareceu uma vez por processo de teste e não é falha. O Vitest também avisou que a build CJS da API do Vite está depreciada. Os testes seguiram e passaram.

## Comandos

Na raiz do repositório, nesta ordem:

```bash
npm test
npm run test:coverage
npm run build
```

`npm test` executa `vitest run` no workspace `backend`. `npm run test:coverage` executa `vitest run --coverage` no mesmo workspace. A cobertura medida inclui `src/services`, `src/domain` e `src/repositories`.

## Resultado de `npm test`

**9 arquivos de teste, 28 testes, 28 aprovados, 0 falhos.** Início 01:46:43, duração 2,55 s.

Arquivos, na ordem impressa pelo Vitest:

| Arquivo | Testes |
|---------|--------|
| `tests/unit/agendamento.service.test.ts` | 4 |
| `tests/api/agenda.test.ts` | 3 |
| `tests/api/cadastros.test.ts` | 2 |
| `tests/api/auth.test.ts` | 4 |
| `tests/unit/auth.service.test.ts` | 3 |
| `tests/unit/servico.service.test.ts` | 2 |
| `tests/unit/usuario.service.test.ts` | 1 |
| `tests/unit/dominio.test.ts` | 7 |
| `tests/unit/cliente.service.test.ts` | 2 |

Trecho final da saída:

```text
 Test Files  9 passed (9)
      Tests  28 passed (28)
   Start at  01:46:43
   Duration  2.55s (transform 179ms, setup 52ms, collect 1.04s, tests 394ms, environment 1ms, prepare 313ms)
```

O que a suíte cobre, entre outros casos: login válido, senha errada, usuário inativo, logout que invalida o token, validação Zod 400, telefone duplicado, atendente recebendo 403 ao criar usuário ou serviço, conflito de horário, horário encostado aceito, data no passado, serviço inativo, cancelamento que libera o horário, conclusão e proteção do último administrador.

## Resultado de `npm run test:coverage`

A mesma suíte, de novo verde: **9 arquivos, 28 testes, 0 falhos.** Início 01:46:46, duração 3,01 s.

```text
 Test Files  9 passed (9)
      Tests  28 passed (28)
   Start at  01:46:46
   Duration  3.01s (transform 160ms, setup 54ms, collect 1.08s, tests 399ms, environment 1ms, prepare 395ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   90.26 |    77.31 |    93.1 |   90.26 |
 domain            |   88.17 |    83.33 |    90.9 |   88.17 |
  fuso.ts          |   81.63 |    66.66 |      75 |   81.63 | 4-10,20-21
  horario.ts       |   86.66 |    66.66 |     100 |   86.66 | 14-15
  texto.ts         |     100 |      100 |     100 |     100 |
  tipos.ts         |     100 |      100 |     100 |     100 |
 repositories      |     100 |    79.36 |     100 |     100 |
  ...repository.ts |     100 |    83.33 |     100 |     100 | 93,103,151
  ...repository.ts |     100 |    83.33 |     100 |     100 | 46,76-79
  ...repository.ts |     100 |    76.92 |     100 |     100 | 66-71,84
  ...repository.ts |     100 |    71.42 |     100 |     100 | 49,73-76,90
 services          |   83.52 |    75.19 |    87.8 |   83.52 |
  ...to.service.ts |    91.3 |    72.72 |    90.9 |    91.3 | ...,98-99,129-130
  auth.service.ts  |     100 |       70 |     100 |     100 | 14-15,33
  ...te.service.ts |   90.09 |    70.96 |      90 |   90.09 | ...,91-92,125-126
  ...co.service.ts |   77.63 |    83.33 |   88.88 |   77.63 | 41-53,64-65,93-94
  ...io.service.ts |   67.64 |    80.76 |      75 |   67.64 | ...55,59-83,97-98
-------------------|---------|----------|---------|---------|-------------------
```

O texto do Vitest corta o nome do arquivo. O `coverage-summary.json` gerado pelo mesmo comando identifica cada linha. Totais: 760 de 842 statements/linhas (90,26%), 81 de 87 funções (93,1%), 167 de 216 branches (77,31%).

| Arquivo no JSON | Linhas |
|-----------------|--------|
| `repositories/agendamento.repository.ts` | 100% (branches 83,33%; linhas descobertas 93, 103, 151) |
| `repositories/cliente.repository.ts` | 100% (branches 83,33%; 46, 76–79) |
| `repositories/servico.repository.ts` | 100% (branches 76,92%; 66–71, 84) |
| `repositories/usuario.repository.ts` | 100% (branches 71,42%; 49, 73–76, 90) |
| `services/agendamento.service.ts` | 91,30% |
| `services/auth.service.ts` | 100% (branches 70%) |
| `services/cliente.service.ts` | 90,09% |
| `services/servico.service.ts` | 77,63% |
| `services/usuario.service.ts` | 67,64% |

A parte sem cobertura nos services está em caminhos de atualização e de erro de unicidade que a suíte não dispara. Não há teste comentado nem ignorado (`skipped: 0` no JSON).

## Build

`npm run build` terminou com código 0. O `tsc` do backend e o `tsc --noEmit` do frontend passaram. O Vite emitiu o bundle:

```text
dist/index.html                   0.80 kB │ gzip:  0.45 kB
dist/assets/index-DlUgsGMj.css    6.26 kB │ gzip:  2.06 kB
dist/assets/index-ChS_PlYA.js   191.19 kB │ gzip: 60.89 kB
✓ built in 685ms
```

## Verificação manual da API

Depois do build, a API compilada subiu com `SQLITE_PATH=/tmp/navalha-smoke.db`, `SEED=true` e porta 3333. O log confirmou o seed e as duas contas de demonstração. Chamadas reais com `curl`:

| Chamada | HTTP |
|---------|------|
| `POST /api/auth/login` com a conta admin | 200, com token e sem `senhaHash` |
| `GET /api/auth/me` | 200, papel ADMIN, nome Helena Prado |
| `POST /api/clientes` telefone novo | 201, telefone gravado só com dígitos |
| `POST /api/clientes` com o mesmo telefone | 409, “Já existe um cliente com este telefone” |
| `POST /api/agendamentos` corte de 30 min às 18:00 UTC de 2030-06-15 | 201, fim 18:30 UTC, status AGENDADO |
| Segundo agendamento do mesmo atendente às 18:10 UTC | 409, “Horário em conflito com outro agendamento deste atendente” |
| `GET /api/agendamentos?data=2030-06-15&clienteId=...` | 200, o agendamento criado |
| `POST /api/usuarios` com o token do atendente | 403, “Acesso restrito a administradores” |
| `PUT /api/clientes/:id` | 200 |
| `POST /api/auth/logout` e novo `GET /api/auth/me` com o mesmo token | 204 e depois 401 |

## Verificação manual da interface

Com a API na porta 3333 e o Vite em http://localhost:5173, o fluxo foi exercido no navegador: login da Helena, busca de João, erro de telefone duplicado (“Já existe um cliente com este telefone”), cadastro da Marina Costa, catálogo com Platinado inativo, usuários Helena e Caio, saída e entrada do Caio sem o menu Usuários e sem botões de edição em Serviços, cancelamento de um horário (status Cancelado) e tentativa de sobrepor o atendente Caio. Essa última mostrou “Horário em conflito com outro agendamento deste atendente” e não gravou a segunda linha. A largura de 390 px manteve o menu utilizável.

O dia “de hoje” do seed segue `America/Sao_Paulo`. Na hora dessa execução o relógio UTC já era 2 de novembro e em Brasília ainda era 1 de novembro, então a agenda semeada de “amanhã” apareceu em 2026-11-02, não em 2026-11-03.

## O que não foi executado aqui

O daemon Docker não estava disponível nesta máquina (`docker` ausente). Os arquivos `docker-compose.yml` e `docker-compose.postgres.yml` estão no repositório, mas esta rodada não subiu os containers. O banco exercitado nos testes e no smoke foi o SQLite.
