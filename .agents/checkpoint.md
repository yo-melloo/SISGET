# Workflow Governance: /checkpoint

Este workflow define o padrão rigoroso para salvar o progresso do projeto SISGET, garantindo estabilidade, segurança e documentação impecável antes de iniciar novas tarefas.

## 📥 Comando: `/checkpoint`

**Objetivo**: Validar a estabilidade das mudanças e persistir o estado atual no versionamento.

### 📋 Passo a Passo

1.  **Revisão de Documentação**:
    *   Sincronizar ADRs (Arquitetura).
    *   Atualizar `walkthrough.md` com as novas funcionalidades.
    *   Garantir que as notas atômicas no Obsidian refletem a realidade do código.

2.  **Auditoria de Segurança (@redteam)**:
    *   Verificar o Staging Area para impedir o vazamento de arquivos `.env` ou chaves privadas reais.
    *   Checar se segredos internos (como `INTERNAL_API_KEY`) estão devidamente parametrizados.
    *   Remover screenshots ou logs temporários do versionamento.

3.  **Validação Técnica (@qa / @engineer)**:
    *   Executar build do Backend: `./mvnw clean compile`.
    *   Executar build do Frontend: `npm run build`.
    *   Garantir que o Bot de Rastreamento passa no check de sintaxe.

4.  **Versionamento**:
    *   Consolidar o staging (`git add`).
    *   Realizar o commit com mensagem semântica e descritiva.

---
*Assinado: @mentor - Guardião da Maestria Técnica*
