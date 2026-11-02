# Roteiro de vídeo — Navalha

Duração alvo: **7 minutos e 30 segundos**. Gravar a tela do navegador em `http://localhost:5173`, com a API já no ar e o seed carregado. Falar em português, devagar o bastante para ler uma mensagem de erro.

Contas na tela de login:

- Administradora Helena Prado — `admin@barbearia.local` / `admin123`
- Atendente Caio Nunes — `atendente@barbearia.local` / `atendente123`

Use **amanhã** nos horários novos. Horário da manhã de hoje pode cair na regra de “não agendar no passado”, e o vídeo precisa mostrar conflito, não essa outra mensagem.

---

## 1. Problema — 0:00 a 0:45

“Uma barbearia pequena marca horário no caderno ou no WhatsApp. Dois atendentes aceitam o mesmo cliente no mesmo intervalo, o histórico some e ninguém vê o dia inteiro. O Navalha é o sistema interno dessa recepção: a equipe entra com senha, e o cliente final não usa o site.”

Mostrar a tela de login, ainda sem entrar. Citar o nome do trabalho: Projeto Integrador Transdisciplinar em Engenharia de Software II.

## 2. Solução — 0:45 a 1:30

“São quatro cadastros: usuário, cliente, serviço e agendamento. O serviço tem duração e preço. O agendamento liga cliente, serviço e atendente, e o fim é calculado pela duração. Se o mesmo atendente já tem horário por cima, o sistema recusa. Administrador cuida da equipe e do catálogo. Atendente cuida de clientes e da própria agenda.”

Aponte as duas contas no quadro de demonstração.

## 3. Demonstração — 1:30 a 4:30

**0:00 desta seção (1:30 do vídeo).** Entrar como Helena. Mostrar o início: em aberto hoje, clientes ativos, serviços ativos e a lista dos próximos horários.

**2:00.** Abrir Agenda. O dia está em Brasília. Mostrar um horário já semeado (corte do João, barba do Carlos) e um cancelado, para o status aparecer.

**2:30.** Ir em Clientes. Buscar “João”. Abrir Novo cliente, salvar “Marina Costa”, telefone `(11) 98888-1111` (o mesmo do João) e mostrar a mensagem de telefone duplicado. Corrigir para `(11) 93333-4444` e salvar.

**3:10.** Abrir Serviços. Mostrar Corte masculino, 30 min, R$ 45, e o Platinado inativo. Não precisa criar outro se o tempo apertar; dizer que só o administrador edita esta tela.

**3:30.** Voltar à Agenda, Novo agendamento: Marina, Corte masculino, atendente Caio, amanhã às 15:00. Salvar. Mostrar o fim 15:30 na linha.

**4:00.** Novo agendamento de novo, mesmo atendente, amanhã às 15:10. Mostrar o alerta de conflito. Fechar.

**4:15.** Na linha das 15:00, Cancelar. Confirmar. Criar outra vez o mesmo horário das 15:00 e mostrar que agora passa, porque o cancelado não ocupa a cadeira.

## 4. Arquitetura — 4:30 a 5:40

Trocar para o editor, três arquivos apenas:

1. `backend/src/routes/index.ts` — a rota passa por autenticação e pelo Zod antes do controller.
2. `backend/src/services/agendamento.service.ts` — a regra de conflito, passado e papel está aqui, não no React.
3. `frontend/src/components/ui/DataTable.tsx` — a mesma tabela serve agenda, clientes e serviços.

Uma frase sobre o banco: “SQLite em arquivo por padrão; o Compose sobe a interface e a API, e um segundo arquivo liga o PostgreSQL se a banca quiser.”

## 5. Testes — 5:40 a 6:30

No terminal, na raiz do repositório:

```bash
npm test
```

Enquanto roda: “Vitest testa os services direto, com banco em memória. Supertest chama a API sem abrir porta: login inválido, telefone duplicado, atendente barrado em usuários e o conflito de horário.”

Se der tempo, abrir `backend/tests/api/agenda.test.ts` na asserção do status 409. Não ler o arquivo inteiro. O resultado numérico está em `docs/laudo-de-testes.md`, copiado da execução real.

## 6. Melhorias e fechamento — 6:30 a 7:30

“O que esta versão não faz: o cliente não marca sozinho, não há pagamento nem WhatsApp, e o logout só vale até a API reiniciar. A tabela de avaliação por pares está vazia de propósito, para anotar o que a turma disser e só então mudar o sistema.”

Voltar à agenda, ainda logado como Helena, e encerrar na tela do dia. “Navalha: a cadeira certa, na hora certa.”

---

## Checklist antes de gravar

- [ ] `npm run dev` com API e front sem erro no terminal
- [ ] Banco novo, ou arquivo SQLite apagado, para o seed aparecer
- [ ] Navegador em zoom 100% ou 110%, janela larga o bastante para a tabela
- [ ] Horários de exemplo marcados para **amanhã**, não para um horário que já passou
- [ ] Terminal com `npm test` pronto na outra aba, para não instalar dependência no meio do vídeo
