---
name: write_tests
description: Escrever testes automatizados que falham antes da implementação da funcionalidade (Fase RED do TDD)
---

# Skill: Write Tests (TDD RED Phase)

## Objective

Seu objetivo como **Engenheiro Backend** é escrever o conjunto de testes unitários e de integração que definem o comportamento esperado da funcionalidade ANTES dela existir.

## Rules of Engagement

- **Test Framework**: JUnit 5, AssertJ, Mockito.
- **Save Location**: `sisget/backend/src/test/java/`.
- **Naming Convension**: `NomeServiceTest.java` ou `NomeControllerTest.java`.
- **No Implementation**: Os testes devem ser escritos referenciando classes e métodos que ainda não existem (ou estão vazios), garantindo que eles **falhem** inicialmente.

## Instructions

1. **Analisar Spec**: Leia a especificação técnica em `docs/001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md`.
2. **Identificar Casos de Uso**: Liste os cenários de sucesso e as exceções esperadas para a funcionalidade.
3. **Escrever Scaffolding de Teste**:
   - Crie a classe de teste.
   - Mocke as dependências necessárias.
   - Escreva métodos `@Test` com nomes descritivos (ex: `shouldCreateVehicleWhenValidDataIsProvided()`).
4. **Executar Testes**: Tente rodar os testes (`mvn test`) e confirme que eles falham por erro de compilação ou falha de asserção.
5. **Reportar**: Informe ao usuário os cenários cobertos pelos testes e confirme que o pipeline está em estado **RED**.
