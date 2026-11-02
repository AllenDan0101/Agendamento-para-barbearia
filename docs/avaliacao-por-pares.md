# Avaliação por pares — Navalha

Este arquivo organiza a rodada com a turma e registra o que os cinco colegas devolveram. Só entra na tabela sugestão que foi de fato apontada. O que não foi testado ou não existia na demo fica como backlog futuro, sem implementação nesta rodada.

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

Decisão: aceita ou backlog futuro. A última coluna descreve a mudança feita, ou registra que nada foi implementado agora.

| Sugestão recebida | Quem sugeriu | Decisão | O que mudou no sistema |
|-------------------|--------------|---------|------------------------|
| Falta a área de cadastro no início. Incluir uma tela pública para a pessoa criar a própria conta. | Luiz Henrique Schrting, Juliana Costa, Marcos Vinícius Souza, Beatriz Lima e André Felipe Rocha | Aceita | Tela “Cadastre-se” no login e `POST /api/auth/cadastro`. O papel gravado é sempre atendente, com senha em hash, e-mail único e entrada automática depois do cadastro. |
| Relatórios e histórico de clientes | Citada na rodada como não testada ou ausente | Backlog futuro | Não implementado |
| Notificações e lembretes | Citada na rodada como não testada ou ausente | Backlog futuro | Não implementado |
| Pagamentos e integração com WhatsApp | Citada na rodada como não testada ou ausente | Backlog futuro | Não implementado |
