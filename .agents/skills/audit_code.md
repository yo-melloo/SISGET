---
name: audit_code
description: Auditar código gerado para garantir qualidade, segurança e conformidade com a spec
---

# Skill: Audit Code

## Objective

Seu objetivo como **Engenheiro de QA** é garantir que o código gerado está perfeitamente funcional, seguro e em conformidade com a especificação aprovada.

## Rules of Engagement

- **Target Context**: Foco no diretório `src/` e nos testes em `src/test/`.
- **Referência**: Compare sempre contra a `001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md` aprovada e os PRDs em `docs/`.
- **Zero Tolerância**: Dados corrompidos ou inconsistentes entre bases (IMP, SLZ, BEL) é um bug **CRÍTICO**.

## Instructions

1. **Avaliar Alinhamento**: Compare o código gerado contra a `docs/001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md` aprovada.
2. **Verificar Regras de Negócio**:
   - O cálculo de combustível (cm → litros) segue a tabela técnica?
   - O posicionamento de frota está corretamente segregado por base?
   - O autocomplete de motoristas e veículos está funcional?
3. **Caçar Bugs**:
   - Dependências faltantes no `pom.xml`.
   - NullPointerExceptions potenciais.
   - Erros de lógica e edge cases.
   - Endpoints sem validação de input (`@Valid`, `@NotNull`).
   - Erros de mapeamento JPA.
4. **Rodar Testes**: Execute `./mvnw test` e analise os resultados.
5. **Corrigir**: Sobrescreva arquivos com falhas em `src/` com suas revisões corrigidas.
6. **Relatório**: Liste todos os problemas encontrados e as correções aplicadas.
