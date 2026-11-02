# Avaliação por pares — Navalha

Este arquivo organiza a rodada com a turma. Ele não registra opinião de colegas: a tabela no final fica vazia até alguém de fato comentar.

## O que mostrar (cerca de 8 minutos)

Subir a API e o front como no README. Entrar com as duas contas de demonstração.

1. **Problema.** Agenda de barbearia no papel ou no WhatsApp perde horário e não mostra o dia inteiro.
2. **Login da Helena** (`admin@barbearia.local` / `admin123`). Mostrar o início com os próximos horários e a agenda do dia, já semeada.
3. **Cliente.** Cadastrar um cliente novo com telefone repetido e mostrar a mensagem de duplicata. Buscar pelo nome.
4. **Serviço.** Como admin, mostrar duração e preço. Apontar o Platinado inativo.
5. **Agenda.** Marcar um horário de amanhã para o Caio. Tentar outro que comece no meio da duração e mostrar o erro de conflito. Cancelar o primeiro e marcar de novo no mesmo horário.
6. **Papel.** Sair e entrar como Caio (`atendente@barbearia.local` / `atendente123`). O menu não tem Usuários. Em Serviços, a lista aparece sem botões de edição.
7. **Código, se a banca pedir.** Uma rota em `backend/src/routes/index.ts`, o `AgendamentoService` e um teste de conflito em `backend/tests/api/agenda.test.ts`.

Pedir para os colegas anotarem durante a demo, não depois de uma explicação longa.

## Formulário de feedback

Responder em texto curto. Não precisa de nota numérica.

1. Em que momento da demonstração ficou claro o que o sistema faz? Em que momento ficou confuso?
2. O erro de horário ocupado foi compreensível sem alguém explicar a regra?
3. A diferença entre administrador e atendente apareceu na tela, ou só faria sentido olhando o código?
4. Alguma mensagem de erro (duplicata, passado, permissão, validação) ficou genérica demais?
5. O que faltou para uma barbearia real usar isso na recepção amanhã?
6. Qual melhoria você faria primeiro, e por quê?
7. A organização em telas (início, agenda, clientes, serviços, usuários) ajudou a achar as funções?

## Registro das sugestões

Preencher só com retorno recebido de colegas. Não inventar linha para “completar” a tabela. Decisão: aceita, adiada ou recusada. A última coluna descreve a mudança feita no sistema, ou fica em branco se nada foi alterado.

| Sugestão recebida | Quem sugeriu | Decisão | O que mudou no sistema |
|-------------------|--------------|---------|------------------------|
| | | | |
