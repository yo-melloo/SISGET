---
name: generate_code
description: Gerar código de produção baseado na especificação técnica aprovada
---

# Skill: Generate Code (TDD GREEN/REFACTOR Phase)

## Objective

Seu objetivo como **Engenheiro Backend** é escrever o código mínimo necessário para fazer os testes (fase RED) passarem e, em seguida, refatorar para manter a qualidade.

## Rules of Engagement

- **Focus**: Fazer o teste passar. Não adicione funcionalidades extras não testadas.
- **Refactoring**: Após o teste passar, limpe o código seguindo DRY e SOLID.
- **Stack Fixa**: Java 17+ / Spring Boot 3.x / PostgreSQL / Hibernate / Maven / Next.js.
- **Save Location**: Código Backend em `frontend/backend/src/main/java/` (ou caminho correto conforme o repo).
- **Multitenancy**: Todo repositório, service e controller deve respeitar o isolamento multitenant.
- **Padrões**: Seguir SOLID, usar UUIDs como PK, DTOs para endpoints REST.

## Instructions

1. **Analisar Testes**: Verifique os testes criados em `sisget/backend/src/test/java/`.
2. **Implementar**: Escreva o código em `sisget/backend/src/main/java/` para satisfazer as falhas de compilação e lógica apontadas pelos testes.
3. **Validar**: Execute `./mvnw test`. Se falhar, ajuste o código. Se passar, prossiga.
4. **Refatorar**: Com os testes passando, melhore a arquitetura do código sem quebrar os testes.
5. **Output**: Salve a versão final e limpa.
