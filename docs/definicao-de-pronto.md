# Definição de Pronto (DoD) — PIT II

Um item do backlog só é **Pronto** quando **todos** os critérios abaixo forem verdadeiros.

## Critérios obrigatórios

1. **Código versionado no repositório**  
   Implementação no Git, entregue por pull request para a branch principal. O merge fica com quem revisa a entrega. Arquivo só na máquina local não conta.

2. **Compila e sobe**  
   `npm install` e os scripts de build (API e front) concluem sem passo manual escondido. O README descreve como subir os dois processos.

3. **Aceite da história atendido**  
   Cada critério Dado/Quando/Então da história passa em teste automatizado ou no fluxo da interface.

4. **Validação na borda**  
   Entradas de escrita passam por Zod. Erro de validação é 400 com `erro` e `detalhes`.

5. **Regras de negócio cobertas**  
   Conflito de horário, entidades inativas e papéis são respeitados nos fluxos do item.

6. **Testes quando o item for de API crítica**  
   Auth, CRUD tocado e agendamento/conflito têm teste Vitest + Supertest verde, além dos testes diretos dos services.

7. **Sem segredos no repositório**  
   `.env` está no `.gitignore`. O modelo é `.env.example`. O segredo do Compose é explícito de demonstração e deve ser trocado fora da aula.

8. **Documentação mínima atualizada**  
   README e `docs/` descrevem como rodar, as variáveis e o seed que de fato existem.

9. **Demo reproduzível**  
   Com o seed, o fluxo cabe numa demonstração curta, sem ajuste manual no banco.

## Pronto da sprint

A sprint está **Pronta** quando:

- todos os itens comprometidos estão Pronto (ou foram removidos do compromisso com registro no backlog);
- o objetivo da sprint é demonstrável de ponta a ponta;
- não há regressão óbvia nos fluxos anteriores (login e CRUD já entregues).

Nesta entrega as três sprints e a reserva estão marcadas como entregues no [backlog](backlog.md). A verificação automatizada está no [laudo de testes](laudo-de-testes.md).

## Pronto da entrega (PIT II)

O projeto está **Pronto para entregar** quando:

- as 3 sprints cumprem seus objetivos, ou o corte está em “fora de escopo”;
- o repositório está acessível à banca, com histórico legível;
- a documentação de planejamento em `docs/` descreve o código entregue;
- os testes principais passam localmente, com o resultado colado no laudo;
- o roteiro do vídeo lista telas e falas, com tempo por seção.

## O que não conta como Pronto

- “Funciona na minha máquina” sem README
- Feature só no front, sem persistir na API
- Aceite parcial (“cria, mas não valida conflito”)
- Teste escrito que não roda ou está comentado
- Número de teste inventado no laudo
- Commit único final sem nenhuma separação entre API, interface e documentação

## Leitura dos critérios nesta entrega

| Critério | Evidência neste repositório |
|----------|-----------------------------|
| 1 | Pull request para `main` com o código do Navalha |
| 2 | `npm run build` gera `backend/dist` e `frontend/dist` |
| 3 | Histórias US01–US06 cobertas por testes de service/API e pelas telas |
| 4 | `backend/src/middlewares/validar.ts` nas rotas de `backend/src/routes/index.ts` |
| 5 | `AgendamentoService`, `UsuarioService`, `ServicoService`, `ClienteService` |
| 6 | `backend/tests/unit` e `backend/tests/api` |
| 7 | `.gitignore` e `.env.example` |
| 8 | `README.md` e esta pasta `docs/` |
| 9 | Seed ao subir a API com banco vazio; contas no README |
