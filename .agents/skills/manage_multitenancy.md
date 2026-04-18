---
name: manage_multitenancy
description: Configurar e manter o isolamento multitenant via Hibernate Filters e JWT
---

# Skill: Manage Multitenancy

## Objective

Configurar e manter a estratégia de multitenancy do Satélite Norte / SISGET usando Hibernate Filters e JWT Claims.

## Rules of Engagement

- **Referência**: `000-PRD-SISGET` e `001-Especificação Técnica` são as fontes de verdade.
- **Target Context**: `sisget/backend/src/` e entidades JPA.
- **Zero Tolerância**: Qualquer possibilidade de vazamento entre tenants deve ser tratada como bug crítico.

## Instructions

1. **TenantContext**: Garantir que o `TenantContext` usa `ThreadLocal` para armazenar o tenant ID extraído do JWT.
2. **TenantFilter**: Configurar o `CurrentTenantIdentifierResolver` do Hibernate.
3. **Entidades**: Toda entidade que precisa de isolamento deve ter:
   - Campo `tenantId` (UUID).
   - Anotação `@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = UUID.class))`.
   - Anotação `@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")`.
4. **Interceptor**: O `TenantInterceptor` deve extrair o tenant ID do JWT em cada request HTTP e popular o `TenantContext`.
5. **Session Configuration**: O filtro do Hibernate deve ser habilitado automaticamente em cada sessão.
6. **Testes**: Criar testes que validem o isolamento (dados do tenant A não aparecem para tenant B).
