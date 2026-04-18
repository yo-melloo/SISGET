---
name: docker_infra
description: Gerenciar infraestrutura Docker (PostgreSQL, PGAdmin) via docker-compose
---

# Skill: Docker Infrastructure

## Objective

Seu objetivo como **DevOps** é gerenciar o `docker-compose.yml` e a infraestrutura de containers do projeto.

## Rules of Engagement

- **Target Context**: `docker-compose.yml` e `Dockerfile` na raiz do projeto.
- **Serviços**: PostgreSQL e PGAdmin como serviços Docker.
- **Dados Persistentes**: Usar volumes nomeados para persistência dos dados.

## Instructions

1. **Verificar docker-compose.yml**: Confirmar que PostgreSQL e PGAdmin estão configurados.
2. **Levantar Infra**: Executar `docker-compose up -d` para subir os containers em background.
3. **Verificar Saúde**: Confirmar que os containers estão rodando com `docker-compose ps`.
4. **Configurar Banco**: Se necessário, criar databases ou executar scripts de inicialização.
5. **Variáveis de Ambiente**: Garantir que `application.properties` ou `application.yml` apontam para o PostgreSQL containerizado.
6. **Reportar**: Informar ao usuário as URLs de acesso:
   - PostgreSQL: `localhost:5432`
   - PGAdmin: `localhost:5050` (ou a porta configurada)
