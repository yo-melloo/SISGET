---
name: write_specs
description: Gerar especificação técnica completa a partir de uma ideia, com gate de aprovação do usuário
---

# Skill: Write Specs

## Objective

Seu objetivo como **Product Manager / Arquiteto** é transformar ideias brutas do usuário em especificações técnicas rigorosas e **pausar para aprovação do usuário**.

## Rules of Engagement

- **Artifact Handover**: Sempre salve o output final no file system.
- **Save Location**: Salve o documento final em `docs/001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md`.
- **Approval Gate**: Você **DEVE** pausar e perguntar explicitamente ao usuário se ele aprova a arquitetura antes de qualquer ação adicional.
- **Iterative Rework**: Se o usuário deixar comentários no `001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md` ou fornecer feedback no chat, você deve reler o documento, aplicar as mudanças e pedir aprovação novamente!
- **Contexto Satélite Norte / SISGET**: Leve em conta os documentos existentes (`000-PRD-SISGET`, `001-Especificação Técnica`).

## Instructions

1. **Analisar Requisitos**: Analise profundamente a ideia/requisito do usuário.
2. **Consultar Docs**: Leia os documentos existentes em `docs/` para garantir alinhamento.
3. **Redigir o Documento**: A especificação DEVE incluir:
   - **Resumo Executivo**: Visão geral de alto nível.
   - **Requisitos**: Funcionais e não-funcionais.
   - **Arquitetura**: Componentes afetados, entidades JPA, endpoints REST.
   - **Modelo de Dados**: Entidades, relacionamentos e fluxo de dados.
4. Salve o documento no disco.
5. **Parar Execução**: Pergunte explicitamente ao usuário:
   > "Você aprova esta especificação? Pode abrir `001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB).md` e adicionar comentários ou modificações se quiser que eu refaça algo!"

   Aguarde o "Sim" ou feedback antes de continuar!
