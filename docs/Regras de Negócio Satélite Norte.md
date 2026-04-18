---
autor: Gustavo Mello
type: Documentação Técnica / SRD
status: concluído (base para implementação)
projeto: SISGET
modulo: Core / Operacional / Tráfego
data_atualizacao: 2026-04-18
tags:
  - regras-de-negocio
  - sdd
  - requisitos
  - logistica-transporte
  - workflow-completo
---

# 📑 Especificação de Requisitos e Processos: SISGET

Este documento é a base técnica final para o desenvolvimento das funcionalidades do SISGET. Ele traduz a rotina operacional da garagem Satélite Norte em lógica de software, visando substituir o Excel e mitigar o desgaste psicológico e a falha humana.

---

## 1. 🏗️ Arquitetura Operacional

### 1.1 Governança e Acesso
*   **Transparência Total:** Apesar da hierarquia operacional, o SISGET provê **acesso compartilhado e irrestrito** a todos os módulos para todos os colaboradores.
*   **Níveis de Responsabilidade:** 
    *   **Assistentes (N1):** Foco no input de dados brutos.
    *   **Torre de Controle (N2):** Monitoramento tático.
    *   **Coordenação (N3):** Responsável final pela validação e "arquivamento" de processos (ex: RAV).

### 1.2 Ecossistema de Infraestrutura
O sistema tratará locais como:
*   **Garagem Administrativa (HUB):** Sede do SISGET.
*   **Bases de Apoio (Belém/São Luís):** Monitoradas via Geofencing (Cercas Virtuais).
*   **Garagens de Apoio:** Nodos exclusivos de manutenção.

---

## 2. 🛡️ Definições de Processos Críticos

### 2.1 Módulo de Combustível (Diesel): Gestão de Estoque e Auditoria
**Contexto:** Unificação de dados em uma única tabela operacional, com duas ações distintas:
1.  **Medição Diária:** Conversão cm ➡️ Litros via Tabela de Equivalência.
2.  **Auditoria de Recebimento:** Comparação entre medição pré-descarregamento, volume da NF e medição pós-descarregamento.

### 2.2 Gestão de Frota e Geofencing
*   **Detecção Automática:** Utilização de Cercas Virtuais (**Leaflet**) para bases como Belém e São Luís, mitigando falhas de hardware do rastreador.
*   **Status de Garagem:** Dashboard em tempo real indicando veículos em "Reserva", "Operação" ou "Trânsito".

### 2.3 Operação de SOS e Ocorrências
*   **Snapshot de Plantão:** O sistema identifica instantaneamente o motorista plantonista ativo e veículos reserva aptos para despacho imediato via Torre de Controle.

### 2.4 Documentação e Bafômetro
*   **Alimentação de Dados (BAB):** O SISGET alimenta o banco de dados para a folha de bafômetro (BAB) baseada na escala do dia, eliminando o preenchimento manual de 12+ veículos diários.

---

## 3. ✍️ Fluxos Operacionais Detalhados

### 3.1 Módulo de Combustível (Diesel)
*   **Controle de Estoque:** Entrada manual de Nível (cm) ➡️ Conversão via Tabela de Equivalência ➡️ Relatório para Goiânia.
*   **Auditoria de Recebimento:** Comparação entre Medição Inicial, Volume em Nota Fiscal e Medição Final. O SISGET deve calcular a variação real.

### 3.2 Gestão de Frota e Geofencing
*   **Posicionamento:** Dashboard integrado com **Leaflet.js**. Implementar cercas virtuais nas bases de Belém e São Luís para automatizar o status de "Em Trânsito" vs. "Na Base".

### 3.3 Gestão de Pessoas e Prazos
*   **Controle de Refeições:** Sistema de alertas para o fechamento quinzenal de custos em alojamentos.
*   **Triagem de Demandas (Outlook):** Painel **Kanban** integrado para organizar solicitações de passes, sinistros e extras vindos do e-mail.
*   **BAB (Bafômetro):** Alimentação do banco para impressão pré-preenchida dos testes de saída.

---
    

### 3.4 Logística e Documentação
*   **CDI e Materiais:** Registro e controle de despacho de documentos/encomendas entre bases via ônibus da frota.
*   **Gestão de Passes:** Autorização digital para deslocamento de motoristas como passageiros para cobrir escalas extras.

---

## 4. 👨‍✈️ Módulo de Escalas e Motoristas (N=68)

### 4.1 Inteligência de Escala (PON-01)
O SISGET deve validar automaticamente as regras da CLT e legislação de transporte:
*   **Intervalo Interjornada:** Bloqueio de escalação se o motorista não completou 11h de descanso.
*   **Controle de Folgas:** Monitoramento do ciclo de 6 dias trabalhados para alerta obrigatório de folga no 7º dia.
*   **Auditoria de Dobras:** Registro automático de horas extras (100%) para motoristas escalados em dias de folga, gerando relatório mensal preciso para o RH.

### 4.2 Interoperabilidade Life Web (PHP)
*   **Fase 1:** Geração de visão "Copy-Paste Friendly" para preenchimento de escala no sistema legado.
*   **Fase 2 (Bot):** Automação via Playwright para input direto dos dados da escala SISGET no LifeWeb.

---

## 5. 📂 Módulo de Incidentes e RAV (SDD First)

### 5.1 Ciclo de Vida do Dossiê RAV
Visando imutabilidade e prova jurídica, o RAV no SISGET é um dossiê composto por:
1.  **Veículo:** CRLV, Checklist e Guia de Tráfego.
2.  **Viagem:** Registro do Disco de Tacógrafo.
3.  **Motorista:** PPI e CNH + **Depoimento Manuscrito Digitalizado**.

### 5.2 Gestão de Emergência (SOS)
*   **Snapshot de Plantão:** Exibição imediata do `Motorista de Plantão` e `Veículo Reserva Apto` para despacho.
*   **Sucesso:** Registro do momento exato de saída da garagem.

---

## 🚀 Backlog de Candidatos a Feature (Brainstorming)

1. **Bot de Lançamento LifeWeb:** Automação via Playwright para sincronização de escala.
2. **Geofencing Leaflet:** Monitoramento autônomo de chegada/saída em bases críticas.
3. **Auditoria de Descarregamento:** Módulo para comparar Litros da NF vs. Diferença de Régua (Antes/Depois).

---
> [!IMPORTANT]
> **Nota do @mentor:** Este documento encerra o levantamento de requisitos. A partir de agora, toda mudança estrutural deve ser acompanhada por um **ADR (Architectural Decision Record)**.