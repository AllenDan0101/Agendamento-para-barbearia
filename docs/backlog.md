# Backlog — Navalha (PIT II)

Tema: sistema web de agendamento para barbearia (Usuario, Cliente, Servico, Agendamento).  
Estimativas em pontos (Fibonacci: 1, 2, 3, 5, 8). Prioridade: Alta → Média → Baixa.

O backlog foi organizado em três sprints de planejamento. A entrega deste repositório implementa o conjunto inteiro num incremento só, com a situação de cada item registrada abaixo. Não houve três ciclos calendário separados.

---

## Visão das sprints

| Sprint | Objetivo | Pontos | Situação |
|--------|----------|--------|----------|
| 1 | Base rodando: auth, usuários, clientes e esqueleto da API/front | 21 | Entregue |
| 2 | Serviços + agendamento com regra de conflito e telas principais | 23 | Entregue |
| 3 | Permissões, testes, Docker opcional, documentação | 18 | Entregue |
| Reserva | Concluir atendimento, busca e início com próximos horários | 7 | Entregue junto |

**Total estimado:** 69 pts (62 do plano original + 7 da reserva, incorporada porque cabe na demonstração).

---

## Sprint 1 — Fundação e cadastros básicos

**Objetivo:** ter API e front autenticáveis, com CRUD de Usuario e Cliente persistidos em SQLite.

| ID | História | Prioridade | Pts | Situação |
|----|----------|------------|-----|----------|
| BK01 | Setup do monorepo: Vite+React+TS, Express+TS, TypeScript estrito, scripts de dev, teste e build | Alta | 3 | Entregue |
| BK02 | Migração SQLite/PostgreSQL + repositórios de Usuario e Cliente | Alta | 5 | Entregue |
| BK03 | US01 — Login/logout com hash de senha, JWT e middleware de auth | Alta | 5 | Entregue |
| BK04 | RF03 — CRUD Usuario e admin de demonstração no seed | Alta | 3 | Entregue |
| BK05 | US02 — CRUD Cliente (API + tela de listagem/formulário) | Alta | 5 | Entregue |

**Pontos da sprint:** 21  
**DoD da sprint:** login funcional; admin lista e cria clientes; README explica como subir.

---

## Sprint 2 — Serviços e agenda

**Objetivo:** catálogo de serviços e fluxo de agendar, listar, remarcar e cancelar, com bloqueio de conflito.

| ID | História | Prioridade | Pts | Situação |
|----|----------|------------|-----|----------|
| BK06 | US03 — CRUD Servico (duração, preço, ativo/inativo, exclusão se nunca usado) | Alta | 5 | Entregue |
| BK07 | US04 — Criar Agendamento e calcular o fim pela duração | Alta | 5 | Entregue |
| BK08 | RF09 — Sobreposição de horário por atendente | Alta | 5 | Entregue |
| BK09 | US05 — Remarcar e cancelar | Alta | 3 | Entregue |
| BK10 | RF07 — Tela de agenda do dia + filtro por cliente | Média | 5 | Entregue |

**Pontos da sprint:** 23  
**DoD da sprint:** demo login → cliente → serviço → agendar → conflito rejeitado → cancelar.

---

## Sprint 3 — Segurança, qualidade e entrega

**Objetivo:** papéis, testes automatizados, opção PostgreSQL e material de entrega.

| ID | História | Prioridade | Pts | Situação |
|----|----------|------------|-----|----------|
| BK11 | US06 — Autorização admin × atendente | Alta | 5 | Entregue |
| BK12 | Testes de service e de API (Vitest + Supertest) | Alta | 5 | Entregue |
| BK13 | Docker Compose com SQLite por padrão e PostgreSQL opcional | Média | 3 | Entregue (arquivos; o daemon Docker não estava disponível na máquina que gerou o laudo) |
| BK14 | Zod em todas as rotas de escrita e erros 4xx com `erro` e `detalhes` | Média | 3 | Entregue |
| BK15 | README, seed de demonstração e roteiro de vídeo | Alta | 2 | Entregue |

**Pontos da sprint:** 18  
**DoD da sprint:** testes verdes localmente; docs alinhadas ao código; ambiente descrito para reproduzir.

---

## Itens de reserva (incorporados)

| ID | História | Prioridade | Pts | Situação |
|----|----------|------------|-----|----------|
| BK16 | Status CONCLUIDO | Baixa | 2 | Entregue |
| BK17 | Busca por nome, telefone ou e-mail na listagem de clientes | Baixa | 2 | Entregue |
| BK18 | Início autenticado com os próximos horários | Baixa | 3 | Entregue |

Nada do escopo comprometido foi cortado. O que permanece de fora está na seção de escopo do [planejamento](planejamento.md).

---

## Ordem em que o código foi organizado

O histórico Git desta entrega separa API, interface e documentação. A ordem sugerida no rascunho (vários pull requests por história) foi concentrada neste incremento para a banca avaliar o sistema inteiro.
