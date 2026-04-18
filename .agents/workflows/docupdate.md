---
description: Atualizar documentação Obsidian para funcionalidades existentes
---
// turbo-all

Quando o usuário digitar `/docupdate <tópico>`, atualize a documentação do Obsidian Vault.

### Sequência de Execução:

1. Assuma o papel do **Mentor Técnico (@mentor)** e execute a skill `obsidian_sync.md`:
   - Analise o `<tópico>` solicitado pelo usuário.
   - Verifique o código existente em `src/` para entender a implementação atual.
   - Crie ou atualize as notas relevantes em `docs/`.
   - Se envolver decisão de arquitetura, crie/atualize o ADR em `docs/`.
   - Atualize o MOC (`000-PRD-SISGET.md`) com links para novos documentos.
   - Gere flashcards para termos técnicos novos em `Utilitários/Flashcards.md`.
   - Crie/atualize uma nota de revisão em `docs/Rewinds/` se relevante para o tópico.
   - Atualize o `Quadro-Kanban.md` se relevante.

2. **Reportar**: Informe ao usuário quais documentos foram criados ou atualizados, com links.
