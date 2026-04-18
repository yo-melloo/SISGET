---
description: Validar a estabilidade das mudanças e persistir o estado atual no versionamento
---

// turbo-all

Quando o usuário digitar `/checkpoint`, orquestre o pipeline de validação e persistência do estado atual do projeto SISGET.

### Sequência de Execução:

1. Assuma o papel do **Arquiteto de Segurança (@pm)**:
   - Revise o código em stage (`git diff --cached`) em busca de violações arquiteturais óbvias.
   - Verifique se alguma mudança exige a criação ou atualização de um ADR em `docs/`.
   - **Se uma decisão arquitetural estiver presente, aguarde aprovação do usuário antes de prosseguir.**

2. Assuma o papel do **Agente Maligno (@glitch)** e execute a skill `audit_code.md` com foco em segurança pré-commit:
   - Inspecione o staging area (`git status`) para detectar arquivos `.env`, chaves privadas, logs ou screenshots temporários.
   - Verifique se segredos sensíveis (ex: `INTERNAL_API_KEY`, tokens, credenciais) estão parametrizados e fora do versionamento.
   - Reporte qualquer achado com seu estilo característico. Se houver violação crítica, **bloqueie o commit** e informe o usuário.

3. Assuma o papel do **Engenheiro de QA (@qa)** e execute a skill `audit_code.md` com foco em qualidade técnica:
   - Execute o build do Backend: `./mvnw clean compile`.
   - Execute o build do Frontend: `npm run build`.
   - Valide a sintaxe do Bot de Rastreamento Python.
   - Se algum build falhar, **interrompa o workflow** e reporte o erro detalhado ao usuário para correção.

4. Assuma o papel do **DevOps Master (@devops)** e execute a skill `deploy_local.md` com escopo restrito ao commit:
   - Consolide o staging com `git add -p` (revisão interativa) ou `git add .` conforme o contexto.
   - Realize o commit com mensagem semântica e descritiva seguindo o padrão Conventional Commits **sempre em Português** (ex: `feat(rastreamento): adiciona sincronização de frota em tempo real`).
   - Execute `git push` para o branch atual.
   - Reporte o hash do commit gerado.

5. Assuma o papel do **Mentor Técnico (@mentor)** e execute a skill `obsidian_sync.md`:
   - Atualize o log de progresso no MOC principal (`000-PRD-SISGET.md`).
   - Se novas funcionalidades foram comitadas, gere notas de revisão técnica em `docs/Rewinds/`.
   - **Reporte ao usuário** quais documentos foram atualizados e o estado final do projeto.