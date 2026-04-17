# Especificação Técnica — SISGET WEB (Sistema de Gerenciamento de Tráfego)

> **Versão:** 1.1  
> **Atualizado em:** 15/04/2026  
> **Referência:** `000-PRD-SISGET.md`  

Este documento formaliza os requisitos técnicos e funcionais para o desenvolvimento do sistema de gerenciamento de tráfego (SISGET WEB), padronizando a linguagem para fins de documentação e orientação de desenvolvimento.

---

## 1. Arquitetura e Metodologia

* **Stack Tecnológica:** Backend em Java (Spring Boot), Frontend em Next.js e banco de dados SQLite (dev) → PostgreSQL (produção).
* **Metodologias:** Orientação estrita a **TDD** (Test-Driven Development) e **SDD** (Spec-Driven Development).
* **Integração de Dados:**
    * Consumo da **Escala do Fluxo** via SharePoint Excel Online (planilha diária compartilhada).
    * Bot em Python (Selenium) para coleta automática de dados de rastreamento (backlog).
    * Processamento híbrido: automação de dados com interface aberta para correções manuais.
* **Seeds:** Dados iniciais extraídos da planilha SISGET original disponíveis em `/seeds/` (604 motoristas, 170 veículos, 85 RAVs, 5 itens de reserva).

## 2. Dashboard Geral

* **Cabeçalho:** Saudação dinâmica ao usuário e exibição de previsão do tempo (via mock).
* **Interface de Feedback:** Uso de componentes "Bell" para notificações e "Skeleton/Progress" para sinalizar o carregamento de dados.
* **Módulos acessíveis via cards** na tela inicial.

## 3. Módulo: Controle de Garagem

### 3.1 Reservas / Oficina (Cards 1x1)

Os componentes seguem o layout de uma linha por uma coluna. Caso não existam dados, exibir "Não informado". Cada card possui um botão para abertura de modal de inserção/edição.

| Campo | Descrição |
|-------|-----------|
| CÓD | Código do ativo (ex: 19001 para carro, SN 10001 para pneu) |
| TIPO | Carro ou Pneu |
| STATUS | Disponível / Indisponível |
| DESCRIÇÃO | Detalhamento livre (ex: "Carro pronto", "Pneu recapado", "Em manutenção, falta teste") |

* **Carros Reserva:** Lista dos veículos com código e status.
* **Pneus Reserva:** Lista dos pneus com código e status.
* **Timestamp:** Cada atualização deve registrar data/hora e autor (ex: "atualizado em: 13/04/26 – 07:38 (GUSTAVO)").

### 3.2 Gestão de Combustível

* **Monitoramento de Tanques:** Visualização de volume atual versus capacidade total (Ex: 3780/15.000 L) — 2 tanques de 15.000 litros.
* **Botão "Atualizar Medição":** Abre calculadora de volumetria embutida para conversão de medida linear (cm) para volume (litros), baseada em tabela técnica de medição.
* **Contexto operacional:** Todas as manhãs a central solicita a informação de combustível — essa é uma das primeiras tarefas do auxiliar ao iniciar um plantão.

## 4. Módulo: Controle de Frota

### 4.1 Posicionamento de Frota

Exibição de três tabelas alinhadas horizontalmente representando as bases: **Imperatriz, São Luís e Belém**.

* **Colunas da Tabela:** DATA, FROTA (ou status CANCELADO), HORÁRIO, ORIGEM e DESTINO.
* **Estilização de Alerta:** Linhas com status "CANCELADO" devem utilizar fundo e texto em vermelho.
* **Rodapé Informativo (por base):** Resumo por categoria com cores de destaque:
    * **CARRO RESERVA:** Verde.
    * **GRADE FUTURA:** Amarelo.
    * **INDISPONÍVEL:** Vermelho.

### 4.2 Operação de Frota (Diurna e Noturna)

Duas tabelas separadas por turno (estrutura idêntica), para controle operacional:

| # | Coluna | Descrição |
|---|--------|-----------|
| 1 | DATA | Data da operação |
| 2 | SAÍDA | Horário de saída |
| 3 | SERVIÇO | Código do serviço |
| 4 | FROTA | Prefixo do veículo |
| 5 | PLACA | Placa do veículo |
| 6 | MOTORISTA | Nome + Matrícula do condutor (apenas um — operação solo) |
| 7 | LINHA | Trecho e horário (Ex: IMP X SLZ 19:30) |
| 8 | LOC. ATUAL | Ponto geográfico em tempo real via rastreamento (futuro) |
| 9 | PREVISÃO | Horário estimado de chegada ou status (Ex: GARAGEM) |

* **Seção lateral por turno:** CARROS RESERVA, PNEUS RESERVA, OCORRÊNCIAS, OUTROS.

### 4.3 Escala do Fluxo (Diária)

Fonte primária de dados operacionais. Os dados vêm de uma **planilha Excel Online hospedada no SharePoint**, compartilhada entre filiais. O sistema deve consumir essa planilha e segregar os dados da mesma maneira que a planilha SISGET atual faz.

| Coluna | Descrição |
|--------|-----------|
| DIA DA SEMANA | Segunda, Terça... |
| DATA | Date |
| GARAGEM | Base de saída (Imperatriz, São Luís, etc.) |
| CARRO | Prefixo do veículo |
| HR. GARAGEM | Horário de saída da garagem |
| HR. SAÍDA | Horário de saída na rodovia |
| ORIGEM | Cidade de partida |
| DESTINO | Cidade de chegada |
| MOTORISTA | Nome + Matrícula |
| LINHA | Descrição completa do trecho |
| SERVIÇO | Código do serviço |

## 5. Módulo: Consulta Rápida (Pesquisa)

Interface dedicada e busca global rápida (Ctrl+K / Spotlight) para localizar dados avulsos sem navegar entre módulos.

* **Busca por Placa** → retorna Frota (prefixo).
* **Busca por Frota** → retorna Placa.
* **Busca por Nome ou Matrícula** → retorna dados do motorista.

> **Nota:** Este módulo deve ser detalhado na especificação de prototipagem (002).


## 6. (Reservado)

## 7. Banco de Dados e Seeds

### 7.1 Entidades Principais

| Entidade | Campos Core |
|----------|-------------|
| **Usuário** | Matrícula (login), Senha (hash), Nome |
| **Motorista** | Nome, Matrícula |
| **Veículo** | Prefixo (Frota), Placa |
| **Reserva** | Código, Tipo (Carro/Pneu), Status, Descrição |
| **Tanque** | Identificação, Medição (cm), Volume (L), Timestamp, Autor |
| **Posicionamento** | Data, Base, Frota, Horário, Origem, Destino |
| **Operação Frota** | Data, Turno, Saída, Serviço, Frota, Placa, Motorista, Linha |
| **RAV** (futuro) | Chamado, Carro, Envolvido, Escopo, Documentação, Status |

### 7.2 Seeds (Dados Iniciais)

Disponíveis em `/seeds/`:
* `motoristas.json` — 604 registros
* `frota.json` — 170 registros
* `ravs.json` — 85 registros (backlog — módulo futuro)
* `reservas.json` — 5 registros

## 8. Módulos Futuros (Backlog — não incluir no Beta 1)

* **Gestão de RAVs:** Centralização e automação da busca e abertura dos diretórios de Relatórios de Avarias e Sinistros. Seeds prontas em `/seeds/ravs.json`.
* **Gestão de Pessoal:** Controle de registros de "Dobras" e monitoramento de horários de "Refeição".
* **Pontos de Apoio (PAs):** Monitoramento centralizado das unidades operacionais de **Grajaú, Araguaína e Santa Inês**.
* **Bot de Rastreamento:** Automação Selenium para coleta de localização em tempo real (integração com sistema VITAE).
