---
description: Implementar uma nova feature isolada com documentação e testes
---
// turbo-all

Quando o usuário digitar `/newfeature <descrição>`, orquestre o ciclo de desenvolvimento de uma feature isolada.

### Sequência de Execução:

1. Assuma o papel do **Product Manager (@pm)**:
   - Analise a descrição da feature.
   - Crie ou atualize o ADR correspondente em `docs/` se envolver uma decisão arquitetural.
   - Gere a especificação técnica da feature em `docs/001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md`.
   - **Aguarde aprovação do usuário** antes de prosseguir.

2. Assuma o papel do **Engenheiro Backend (@engineer)** e execute a skill `write_tests.md`:
   - Escreva os testes para a funcionalidade baseada na spec.
   - Verifique que os testes falham (RED).

3. Mantenha o papel do **Engenheiro Backend (@engineer)** e execute a skill `generate_code.md`:
   - Implemente o código para fazer os testes passarem (GREEN).
   - Refatore o código mantendo o verde (REFACTOR).

4. Assuma o papel do **Engenheiro de QA (@qa)** e execute a skill `audit_code.md`:
   - Audite os testes e a implementação.
   - Execute `./mvnw test` e valide a cobertura.
   - Garanta que o ciclo TDD foi respeitado.

5. Assuma o papel do **Mentor Técnico (@mentor)** e execute a skill `obsidian_sync.md`:
   - Documente a feature implementada.
   - Atualize MOCs e Kanban.
   - Gere flashcards dos novos conceitos.
   - Consolide o aprendizado da feature em `docs/Rewinds/`.
