# Laudo de testes — Navalha

Registro da execução feita neste ambiente, em 2 de novembro de 2026, depois do cadastro público de atendente. Os números abaixo saíram do terminal; não foram estimados.

## Ambiente

| Item | Valor |
|------|--------|
| Data e hora (UTC) | 2026-11-02T02:49:52+00:00 |
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

**9 arquivos de teste, 32 testes, 32 aprovados, 0 falhos.** Início 02:49:53, duração 2,58 s.

Arquivos, na ordem impressa pelo Vitest:

| Arquivo | Testes |
|---------|--------|
| `tests/api/auth.test.ts` | 7 |
| `tests/unit/agendamento.service.test.ts` | 4 |
| `tests/api/agenda.test.ts` | 3 |
| `tests/api/cadastros.test.ts` | 2 |
| `tests/unit/usuario.service.test.ts` | 2 |
| `tests/unit/auth.service.test.ts` | 3 |
| `tests/unit/servico.service.test.ts` | 2 |
| `tests/unit/dominio.test.ts` | 7 |
| `tests/unit/cliente.service.test.ts` | 2 |

Trecho final da saída:

```text
 Test Files  9 passed (9)
      Tests  32 passed (32)
   Start at  02:49:53
   Duration  2.58s (transform 191ms, setup 57ms, collect 1.04s, tests 418ms, environment 1ms, prepare 318ms)
```

Além dos casos anteriores (login, logout, conflito de horário, papéis), esta rodada inclui o cadastro público: sucesso com papel atendente mesmo se o corpo pede `ADMIN`, e-mail duplicado em 409, dados inválidos em 400 e senha gravada com hash bcrypt.

## Resultado de `npm run test:coverage`

A mesma suíte, de novo verde: **9 arquivos, 32 testes, 0 falhos.** Início 02:49:56, duração 3,14 s.

```text
 Test Files  9 passed (9)
      Tests  32 passed (32)
   Start at  02:49:56
   Duration  3.14s (transform 179ms, setup 57ms, collect 1.17s, tests 448ms, environment 1ms, prepare 400ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |    90.7 |    78.18 |   93.18 |    90.7 |
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
 services          |   84.51 |    76.69 |   88.09 |   84.51 |
  ...to.service.ts |    91.3 |    72.72 |    90.9 |    91.3 | ...,98-99,129-130
  auth.service.ts  |     100 |       70 |     100 |     100 | 14-15,33
  ...te.service.ts |   90.09 |    70.96 |      90 |   90.09 | ...,91-92,125-126
  ...co.service.ts |   77.63 |    83.33 |   88.88 |   77.63 | 41-53,64-65,93-94
  ...io.service.ts |   72.72 |    86.66 |   77.77 |   72.72 | ...,68-92,106-107
-------------------|---------|----------|---------|---------|-------------------
```

O texto do Vitest corta o nome do arquivo. O `coverage-summary.json` gerado pelo mesmo comando identifica os totais: 771 de 850 statements/linhas (90,7%), 82 de 88 funções (93,18%), 172 de 220 branches (78,18%). `UsuarioService` ficou em 72,72% das linhas depois do cadastro público. Não há teste ignorado (`skipped: 0`).

## Build

`npm run build` terminou com código 0. O `tsc` do backend e o `tsc --noEmit` do frontend passaram. O Vite emitiu o bundle:

```text
dist/index.html                   0.80 kB │ gzip:  0.45 kB
dist/assets/index-J0w6JcRv.css    6.28 kB │ gzip:  2.06 kB
dist/assets/index-C9r7PCpS.js   193.35 kB │ gzip: 61.26 kB
✓ built in 629ms
```

51 módulos transformados.

## Verificação manual

Na API compilada, `POST /api/auth/cadastro` com `papel: "ADMIN"` no corpo respondeu 201, papel `ATENDENTE`, sem `senhaHash`, e devolveu token.

No navegador, em http://localhost:5173/login, o link “Cadastre-se” abriu o formulário. Senhas diferentes mostraram “A confirmação de senha não confere”. Com senhas iguais, Paula Nunes entrou direto na agenda como atendente, sem o menu Usuários. Repetir o e-mail mostrou “Já existe um usuário com este e-mail”.

O daemon Docker continua ausente nesta máquina. Os containers não foram subidos nesta rodada.
