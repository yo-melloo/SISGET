---
description: Iniciar o pipeline completo de desenvolvimento autônomo com uma nova ideia
---
// turbo-all

Quando o usuário digitar `/startcycle <ideia>`, orquestre o processo de desenvolvimento usando estritamente `.agents/agents.md` e `.agents/skills/`.

### Sequência de Execução:

1. Assuma o papel do **Product Manager (@pm)** e execute a skill `write_specs.md` usando a `<ideia>`.
   *(Aguarde o usuário aprovar explicitamente a spec. Se o usuário fornecer feedback ou adicionar comentários diretamente no arquivo Markdown, assuma o papel do PM novamente para reler e revisar o documento. Repita este passo até que ele aprove.)*

2. Mude o contexto, assuma o papel do **Engenheiro Backend (@engineer)** e execute a skill `write_tests.md` (Fase RED).

3. Mantenha o contexto, assuma o papel do **Engenheiro Backend (@engineer)** e execute a skill `generate_code.md` (Fase GREEN/REFACTOR).

4. Mude o contexto, assuma o papel do **Engenheiro de QA (@qa)** e execute a skill `audit_code.md`.

5. Mude o contexto, assuma o papel do **DevOps Master (@devops)** e execute a skill `deploy_local.md`.

6. Mude o contexto, assuma o papel do **Mentor Técnico (@mentor)** e execute a skill `obsidian_sync.md` para documentar tudo que foi feito.
