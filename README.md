# Navalha

Sistema web de agendamento para barbearia, feito para o Projeto Integrador Transdisciplinar em Engenharia de Software II.

A equipe da barbearia entra com e-mail e senha. Administrador e atendente cadastram clientes, consultam o catálogo de serviços e montam a agenda do dia. O horário de um atendente não pode sobrepor outro atendimento ainda não cancelado. O cliente final não acessa o sistema.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Interface | React 18, Vite, TypeScript |
| API | Node.js 22, Express, TypeScript |
| Organização da API | Rotas, controllers, services e repositories |
| Validação | Zod nas rotas, antes do controller |
| Auth | bcrypt + JWT |
| Banco padrão | SQLite (`node:sqlite`), arquivo local |
| Banco opcional | PostgreSQL 16 no Docker Compose |
| Testes | Vitest e Supertest |
| Execução | npm local ou Docker Compose |

## Funcionalidades

- Login, consulta da sessão e logout
- Usuários (administrador): cadastro, edição, inativação, papéis admin e atendente
- Clientes: cadastro, edição, busca, inativação
- Serviços: nome, duração, preço, ativar/inativar, excluir se nunca foi usado
- Agenda: criar, listar por dia e por cliente, remarcar, cancelar, concluir
- Conflito de horário por atendente, considerando a duração do serviço
- Início com os próximos horários

## Contas de demonstração

O seed roda quando a API sobe com banco vazio (`SEED` diferente de `false`).

| Papel | Nome | E-mail | Senha |
|-------|------|--------|-------|
| Administrador | Helena Prado | `admin@barbearia.local` | `admin123` |
| Atendente | Caio Nunes | `atendente@barbearia.local` | `atendente123` |

Também entram clientes, serviços (o Platinado fica inativo) e horários de exemplo no dia corrente e no seguinte, no fuso de Brasília.

Para recomeçar do zero, pare a API e apague o arquivo SQLite (`backend/data/barbearia.db` quando se usa `npm run dev`).

## Pré-requisitos

- Node.js 22.5 ou superior (o projeto usa `node:sqlite`)
- npm 10
- Docker e Docker Compose, só se for usar os containers

## Rodar sem Docker

Na raiz do repositório:

```bash
cp .env.example .env
npm install
npm run dev
```

- Interface: http://localhost:5173
- API: http://localhost:3333
- Saúde: http://localhost:3333/api/saude

O Vite encaminha `/api` para a API. Os dois processos sobem juntos com `concurrently`. Também dá para separar:

```bash
npm run dev:api
npm run dev:web
```

Build de produção local:

```bash
npm run build
npm run start:api
npm run preview -w frontend
```

O preview do Vite fica em http://localhost:4173 e **não** inclui o proxy. Para essa combinação, sirva o front apontando `VITE_API_URL=http://localhost:3333` no build, ou use o Compose, em que o nginx já encaminha `/api`.

## Rodar com Docker

Na raiz, com o daemon Docker ativo:

```bash
docker compose up --build
```

- Interface: http://localhost:8080
- API direta: http://localhost:3333

A API usa SQLite no volume `api-data`. O primeiro boot semeia os dados de demonstração.

### PostgreSQL opcional

```bash
docker compose --profile postgres -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

Isso sobe o Postgres 16 (`barbearia` / `barbearia` / banco `barbearia` na porta 5432) e faz a API usar `DATABASE_DRIVER=postgres`. O schema é o mesmo do SQLite.

Fora do Compose, com um Postgres já existente:

```bash
export DATABASE_DRIVER=postgres
export DATABASE_URL=postgres://barbearia:barbearia@localhost:5432/barbearia
npm run dev:api
```

## Testes

Na raiz:

```bash
npm test
npm run test:coverage
```

Os testes usam SQLite em memória e não precisam do arquivo de desenvolvimento. O resultado da execução usada nesta entrega está em [docs/laudo-de-testes.md](docs/laudo-de-testes.md).

## Variáveis de ambiente

Modelo em `.env.example`.

| Variável | Padrão | Função |
|----------|--------|--------|
| `PORT` | `3333` | Porta da API |
| `JWT_SECRET` | segredo de desenvolvimento | Assinatura do token. Obrigatório quando `NODE_ENV=production` |
| `JWT_EXPIRES_IN` | `8h` | Validade do token |
| `BCRYPT_COST` | `10` | Custo do hash |
| `DATABASE_DRIVER` | `sqlite` | `sqlite` ou `postgres` |
| `SQLITE_PATH` | `./data/barbearia.db` | Arquivo SQLite, relativo ao diretório de trabalho da API |
| `DATABASE_URL` | — | Conexão PostgreSQL |
| `CORS_ORIGIN` | localhost 5173 e 8080 | Origens permitidas, separadas por vírgula |
| `SEED` | `true` | `false` para não popular banco vazio |

## Documentação

- [Planejamento](docs/planejamento.md) — visão, requisitos, histórias, casos de uso e classes
- [Backlog](docs/backlog.md) — sprints e o que foi entregue
- [Definição de pronto](docs/definicao-de-pronto.md)
- [Arquitetura](docs/arquitetura.md) — stack, pastas e padrões no código
- [Laudo de testes](docs/laudo-de-testes.md)
- [Avaliação por pares](docs/avaliacao-por-pares.md)
- [Roteiro do vídeo](docs/roteiro-video.md)
- [Changelog](CHANGELOG.md)

## API (resumo)

Todas as rotas, exceto `GET /api/saude` e `POST /api/auth/login`, exigem `Authorization: Bearer <token>`.

| Método | Caminho | Quem |
|--------|---------|------|
| POST | `/api/auth/login` | público |
| POST | `/api/auth/logout` | autenticado |
| GET | `/api/auth/me` | autenticado |
| GET, POST, PUT, PATCH | `/api/usuarios` | admin |
| GET, POST, PUT, PATCH | `/api/clientes` | autenticado |
| GET | `/api/servicos` | autenticado |
| POST, PUT, PATCH, DELETE | `/api/servicos` | admin |
| GET, POST, PUT, PATCH | `/api/agendamentos` | autenticado |

Erro de validação: HTTP 400, corpo `{ "erro": "Dados inválidos", "detalhes": [{ "caminho", "mensagem" }] }`. Conflito de horário ou duplicata: 409. Regra de negócio (passado, inativo, último admin): 422. Papel insuficiente: 403.
