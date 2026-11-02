# Changelog

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [1.1.0] - 2026-11-02

### Adicionado

- Tela pública “Cadastre-se” a partir do login, com nome, e-mail, senha e confirmação de senha.
- `POST /api/auth/cadastro`, validado com Zod. O usuário nasce atendente, com senha em hash. E-mail repetido responde 409. Depois do cadastro a sessão já entra.
- Testes de service e de API do cadastro: sucesso, e-mail duplicado, dados inválidos e papel fixo em atendente.

### Não incluído

- Relatórios e histórico de clientes, notificações e lembretes, pagamentos e integração com WhatsApp permanecem no backlog futuro, a partir da avaliação por pares.

## [1.0.0] - 2026-11-02

### Adicionado

- API REST em Node.js, Express e TypeScript com camadas de rota, controller, service e repository.
- Autenticação por e-mail e senha (bcrypt), JWT e logout com revogação do token em memória.
- Papéis administrador e atendente, com bloqueio das rotas de usuários e da escrita de serviços.
- CRUD de clientes, com busca e inativação.
- CRUD de serviços, com duração, preço em centavos, inativação e exclusão apenas quando o serviço nunca foi agendado.
- Agendamentos com cálculo de fim pela duração, conflito por atendente, remarcação, cancelamento e conclusão.
- Interface React + Vite: login, início, agenda, clientes, serviços e usuários, com componentes reutilizáveis.
- SQLite por padrão e adaptador PostgreSQL acionado por `DATABASE_DRIVER=postgres`.
- Docker Compose da API e do front, com perfil opcional de PostgreSQL.
- Seed de demonstração (Helena e Caio, clientes, serviços e agenda).
- Testes Vitest dos services e testes Supertest da API.
- Documentação de planejamento, arquitetura, testes, avaliação por pares e roteiro de vídeo.
