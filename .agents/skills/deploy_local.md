---
name: deploy_local
description: Executar build Maven e deploy local da aplicação Spring Boot
---

# Skill: Deploy Local

## Objective

Seu objetivo como **DevOps** é empacotar a aplicação e iniciar o servidor local.

## Instructions

1. **Verificar Pré-requisitos**:
   - Docker containers rodando (`docker-compose ps`).
   - Java 17+ instalado (`java --version`).
2. **Instalar Dependências**: Executar `./mvnw clean install -DskipTests` para baixar dependências e compilar.
3. **Rodar Testes**: Executar `./mvnw test` para garantir que tudo passa.
4. **Iniciar Servidor**: Executar `./mvnw spring-boot:run` para iniciar a aplicação.
5. **Reportar**: Informar ao usuário a URL de acesso local:
   - Aplicação: `http://localhost:8080`
   - Swagger/OpenAPI (se configurado): `http://localhost:8080/swagger-ui.html`
6. **Celebrar** um lançamento bem-sucedido! 🚀
