# PRD — SISGET WEB (Sistema de Gerenciamento de Tráfego)

> **Versão:** 1.0  
> **Autor:** Auxiliar de Tráfego / Desenvolvedor (Gustavo Mello)  
> **Data:** 15/04/2026  
> **Status:** Aprovado  

---

## 1. Objetivo e Contexto

Automatizar os processos de trabalho (workflow) e rotinas administrativas dos auxiliares de tráfego da filial Satélite Norte — Imperatriz/MA, substituindo a planilha SISGET (Excel) por uma aplicação web moderna, unificada e acessível.

**Motivações:**
- A planilha atual possui 12+ abas interdependentes com fórmulas frágeis (`#REF!`, `#N/A`) e dados ocultos que dificultam manutenção.
- Não há proteção contra erros — qualquer fórmula apagada acidentalmente deve ser restaurada manualmente, e os demais auxiliares não possuem domínio de Excel suficiente para isso.
- Não há controle de acesso, histórico de alterações, nem sincronização entre plantões.
- A comunicação extra-plantão depende de preenchimento manual e repasse verbal.

**Premissa do Desenvolvedor:** O desenvolvedor é também colaborador na área de tráfego, com domínio das regras de negócio e capacidade de projetar as automações. O sistema será construído seguindo princípios de Código Limpo, SOLID, e desenvolvimento orientado a especificação (SDD) e testes (TDD).

---

## 2. Persona e Usuário-Alvo

**Quem:** Auxiliares de Tráfego da Satélite Norte (Imperatriz/MA).

**Perfil Técnico:** Usuários com conhecimento mínimo de informática. O sistema deve ser projetado prevendo baixa familiaridade tecnológica — priorizando interfaces intuitivas, labels descritivas e fluxos guiados. Mesmo que o nível atual não seja tão básico assim, é melhor projetar para auxiliares futuros assumindo fraqueza em informática.

**Necessidade Central:** Consultar e registrar informações operacionais do plantão de forma rápida, segura e sem depender de fórmulas Excel.

> **Nota sobre Manutenção:** A aplicação terá regras de negócio personalizadas para a Satélite Norte. Caso o desenvolvedor se desligue da empresa, recomenda-se formalizar um contrato de manutenção para garantir a continuidade do serviço.

---

## 3. User Stories

| ID | Como... | Eu quero... | Para que... |
|----|---------|-------------|-------------|
| US-01 | Auxiliar de tráfego | Fazer login com minha matrícula e senha | Acessar o sistema de forma segura |
| US-02 | Auxiliar de tráfego | Visualizar o dashboard com os módulos do dia | Ter uma visão geral rápida do plantão |
| US-03 | Auxiliar de tráfego | Consultar e registrar o posicionamento da frota por base | Saber quais carros saíram, para onde, e em que horário |
| US-04 | Auxiliar de tráfego | Registrar a operação da frota diurna e noturna | Controlar saídas, tripulação e linhas de cada turno |
| US-05 | Auxiliar de tráfego | Gerenciar carros e pneus reserva com status (Oficina) | Saber o que está disponível na garagem |
| US-06 | Auxiliar de tráfego | Consultar motorista por nome/matrícula e veículo por frota/placa | Localizar dados rapidamente sem navegar por abas ou planilhas |
| US-07 | Auxiliar de tráfego | Registrar a medição de combustível dos tanques (cm → litros) | Informar o volume atual à central todas as manhãs e repassar entre plantões |
| US-08 | Auxiliar de tráfego | Visualizar a escala do fluxo diária integrada | Operar o controle de garagem com base nos dados da escala do SharePoint |
| US-09 | (Removido) | - | - |

> **Senha padrão:** A senha inicial de cada usuário será sua matrícula. O usuário poderá alterá-la posteriormente.

---

## 4. Módulos e Funcionalidades

### 4.1 Autenticação e Dashboard
- Login por matrícula + senha.
- Dashboard com saudação dinâmica, previsão do tempo (mock), e notificações (Bell).
- Cards de acesso aos módulos principais.
- Indicadores de carregamento (Skeleton/Progress).

### 4.2 Módulo: Controle de Garagem

#### 4.2.1 Reservas (Oficina)
Gestão de ativos em reserva com status de disponibilidade.

| Coluna | Descrição |
|--------|-----------|
| CÓD | Código do ativo (ex: 19001, SN 10001) |
| TIPO | Classificação: Carro ou Pneu |
| STATUS | Disponível / Indisponível |
| DESCRIÇÃO | Detalhamento (ex: "Carro pronto", "Pneu recapado", "Em manutenção, falta teste") |

- Modal para adição e edição de registros.
- Exibição em cards 1x1 com botão de ação.

#### 4.2.2 Combustível
Monitoramento de 2 tanques de 15.000 litros cada.

| Campo | Descrição |
|-------|-----------|
| Tanque | Identificação (Tanque 1, Tanque 2) |
| Medição (cm) | Valor da medição linear |
| Volume (litros) | Resultado da conversão automática |
| Total | Soma dos volumes |

- **Botão "Atualizar Medição":** Abre a calculadora de volumetria embutida, que converte cm → litros com base na tabela técnica de medição.
- **Timestamp de atualização:** Exibir quem atualizou e quando (ex: "atualizado em: 13/04/26 – 07:38 (GUSTAVO)").

### 4.3 Módulo: Controle de Frota

#### 4.3.1 Posicionamento de Frota
Três tabelas lado a lado representando as bases: **Imperatriz**, **São Luís** e **Belém**.

| Coluna | Tipo |
|--------|------|
| DATA | Date |
| FROTA | Texto (ou "CANCELADO") |
| HORÁRIO | Time |
| ORIGEM | Cidade (UF) |
| DESTINO | Cidade (UF) |

- Linhas "CANCELADO" em destaque visual (fundo vermelho).
<<<<<<< HEAD:docs/000-PRD-SISGET.md
- **Rodapé resumo (por base):** CARRO RESERVA (verde), GRADE FUTURA (amarelo), INDISPONÍVEL (vermelho).
=======
- **Rodapé resumo (por base):** CARRO RESERVA (verde), GRADE FUTURA (amarelo), INDISPONÍVEL (vermelho), cada rótulo sendo editável para informar quais são os carros.
>>>>>>> 31b01da (feat: centralize Satélite Norte project and SISGET into root repository):Satélite Norte/docs/000-PRD-SISGET.md

#### 4.3.2 Operação de Frota (Diurna / Noturna)
Duas tabelas idênticas em estrutura, separadas por turno.

| Coluna | Descrição |
|--------|-----------|
| DATA | Data da operação |
| SAÍDA | Horário de saída |
| SERVIÇO | Código do serviço |
| FROTA | Prefixo do veículo |
| PLACA | Placa do veículo |
| MOTORISTA | Nome + Matrícula |
| LINHA | Trecho com horário (ex: BEL X GYN 07:12) |
| LOC. ATUAL | Localização em tempo real (futuro: integração rastreamento) |
| PREVISÃO | ETA ou status (GARAGEM) |

- Seção lateral: CARROS RESERVA, PNEUS RESERVA, OCORRÊNCIAS, OUTROS.

### 4.4 Módulo: Escala do Fluxo (Diária)
Visualização da escala de tráfego do dia. A fonte primária é uma **planilha online do SharePoint Excel** — o sistema deve saber consumir e segregar os dados da mesma maneira que a planilha atual faz.

| Coluna | Descrição |
|--------|-----------|
| DIA DA SEMANA | Segunda, Terça... |
| DATA | Date |
| GARAGEM | Base de saída (Imperatriz, etc.) |
| CARRO | Prefixo do veículo |
| HR. GARAGEM | Horário de saída da garagem |
| HR. SAÍDA | Horário de saída na rodovia |
| ORIGEM | Cidade de partida |
| DESTINO | Cidade de chegada |
| MOTORISTA | Nome + Matrícula |
| LINHA | Descrição completa do trecho |
| SERVIÇO | Código do serviço |

### 4.5 Módulo: Consulta Rápida (Pesquisa)
- **Busca por Placa** → retorna Frota (prefixo do carro).
- **Busca por Frota** → retorna Placa.
- **Busca por Nome/Matrícula** → retorna dados do motorista.
- Interface tipo "Spotlight" (Ctrl+K) para acesso rápido global.


### 4.6 (Reservado para uso futuro)

### 4.7 Banco de Dados (Cadastros)
Base de dados inicial com 604 motoristas e 170 veículos (extraídos da aba oculta "BANCO DE DADOS" da planilha SISGET). Arquivos de seed disponíveis em `/seeds/`.

| Entidade | Campos |
|----------|--------|
| **Motorista** | Nome, Matrícula |
| **Veículo** | Prefixo (Frota), Placa |

---

## 5. Requisitos Funcionais (RF)

| ID | Requisito |
|----|-----------|
| RF-01 | O sistema deve autenticar usuários por matrícula e senha |
| RF-02 | O sistema deve exibir um dashboard com acesso a todos os módulos ativos |
| RF-03 | O sistema deve permitir CRUD de registros de garagem (carros reserva, pneus) |
| RF-04 | O sistema deve exibir o posicionamento de frota segregado por base (Imperatriz, São Luís, Belém) |
| RF-05 | O sistema deve calcular volume de combustível (cm → litros) com base na tabela técnica |
| RF-06 | O sistema deve permitir consulta bidirecional Placa ↔ Frota e busca de motoristas |
| RF-07 | O sistema deve registrar operação de frota diurna e noturna com dados de tripulação |
| RF-08 | O sistema deve consumir e exibir a escala diária do fluxo a partir do SharePoint Excel |
| RF-09 | O sistema deve destacar visualmente linhas com status "CANCELADO" |
| RF-10 | O sistema deve registrar timestamp e autor de cada atualização de dados |
| RF-11 | (Removido) |
| RF-12 | O sistema deve coletar e expor dados de rastreamento em tempo real via bot Playwright (Life Online) |

## 6. Requisitos Não Funcionais (RNF)

| ID | Requisito | Categoria |
|----|-----------|-----------|
| RNF-01 | Interface responsiva e intuitiva para usuários com baixo letramento digital | Usabilidade |
| RNF-02 | Código documentado, comentado e seguindo padrões SOLID/Clean Code | Manutenibilidade |
| RNF-03 | Proteção contra vulnerabilidades OWASP Top 10 | Segurança |
| RNF-04 | Variáveis sensíveis em `.env` fora do controle de versão | Segurança |
| RNF-05 | Tempo de resposta < 2s para qualquer operação de consulta | Performance |
| RNF-06 | Modularidade: adição/remoção de módulos sem impacto nos demais (Dados, Lógica, Front-end) | Arquitetura |
| RNF-07 | Fluxo Regra de Negócio → API → Front-end com sincronia completa | Arquitetura |
| RNF-08 | Sistema acessível via navegador web (Chrome/Edge); em avaliação o uso de Electron.js para portabilidade mobile | Acessibilidade |

---

## 7. Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Observação |
|--------|------------|------------|
| **Front-end** | Next.js | SPA com SSR quando necessário |
| **Back-end** | Java (Spring Boot) | API REST |
| **Banco de Dados** | SQLite → PostgreSQL | Início com SQLite (dev local), migração gradual para PostgreSQL |
| **Automação** | Python (Playwright) | Bot para coleta de dados de rastreamento (Life Online) |
| **Deploy** | Local → VPS/Nuvem | Implementação gradual na Beta 2 |
| **Seeds** | JSON (`/seeds/`) | Dados iniciais extraídos da planilha SISGET original |

> **Desenvolvimento gradual:** O sistema inicia com stack simplificada (SQLite, sem Docker) e evolui incrementalmente após validação funcional.

---

## 8. UX/UI

- **Diretrizes:** Interface dark/moderna com elementos de Glassmorphism.
- **Protótipo escrito:** Documentado em `002-Documento de Prototipagem - Sistema de Gestão de Tráfego (SISGET WEB).md`.
- **Wireframe:** `Prototipo 001 - Wireframe escrito.pdf`.
- **Figma:** Pendente — o desenvolvedor fornecerá link do design.
- **Princípios:**
  - Labels descritivas e textos de ajuda em cada campo.
  - Feedback visual para ações (toasts ao salvar, cores de status).
  - Navegação por módulos via dashboard (cards).
  - Busca global rápida (Ctrl+K / Spotlight).

---

## 9. Escopo

### ✅ In (Beta 1 — até 15/05/2026)
- Autenticação por matrícula
- Dashboard com módulos
- Controle de Garagem (Reservas/Oficina + Combustível)
- Posicionamento de Frota (3 bases)
- Operação de Frota (Diurna / Noturna)
- Escala do Fluxo (Diária) com integração SharePoint
- Consulta Rápida (Placa ↔ Frota, Motorista)
- Cadastro de Motoristas e Veículos
- Seeds de dados iniciais da planilha SISGET

### ✅ Concluído Antecipado (Bot de Rastreamento)
- **Bot Playwright** para coleta de rastreamento (Life Online): ✅ 167 veículos capturados com GPS (`sisget/bot/scrape_bot.py`). Decisão de arquitetura em `ADRs/003-Bot-Scraping-Playwright-LifeOnline.md`.

### ❌ Out (Beta 1)
- Integração com sistema VITAE
- Deploy em nuvem/VPS (movido para Beta 2)
- Docker / containerização
- Gestão de Pessoal (Dobras, Refeição)
- Pontos de Apoio (Grajaú, Araguaína, Santa Inês)
- Gestão de RAVs (módulo futuro — seeds com 85 registros prontos em `/seeds/ravs.json`)

### 🔜 Beta 2 (até 30/05/2026)
- Deploy para VPS/Nuvem
- Migração SQLite → PostgreSQL
- Docker / CI/CD básico
- Validação em ambiente de produção

### 📋 Backlog (pós-Beta 2)
- Módulo de Gestão de RAVs
- Módulo de Gestão de Pessoal (Dobras / Refeição)
- Chat em Tempo Real (Lateral Direita)
- Pontos de Apoio (PAs)
- Integração VITAE
- Agendador Spring (@Scheduled) para execução periódica do bot de rastreamento
- Endpoint `GET /api/rastreamento` consumindo `fleet_status.json`
- Relatórios exportáveis (PDF/Excel)

---

## 10. Critérios de Sucesso e Métricas

| KPI | Meta | Prazo |
|-----|------|-------|
| **Funcionalidades Core operando** | 100% dos módulos In-Scope funcionais e testados | 15/05/2026 (Beta 1) |
| **Cobertura de testes** | ≥ 70% de cobertura nos módulos críticos (Frota, Garagem) | Beta 1 |
| **Zero segredos expostos** | Nenhum `.env`, senha ou token no Git | Contínuo |
| **Conformidade OWASP** | Top 5 vulnerabilidades mitigadas (Injection, Auth, SSRF, etc.) | Beta 1 |
| **Deploy funcional em nuvem** | Sistema acessível via URL pública/VPN | 30/05/2026 (Beta 2) |
| **Adoção pelo plantão** | ≥ 1 plantão completo utilizando o sistema ao invés do Excel | Beta 2 |

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Desenvolvedor único (bus factor = 1) | Alto | Documentação rigorosa, código comentado, contrato de manutenção |
| Resistência dos usuários ao novo sistema | Médio | Interface intuitiva, treinamento, período de uso paralelo (Excel + Web) |
| Prazo agressivo (1 mês para Beta 1) | Alto | Priorização rígida do escopo In, desenvolvimento gradual |
| Dados da planilha com inconsistências (`#REF!`, `#N/A`) | Médio | Validação e limpeza na migração inicial (seeds já extraídas e disponíveis) |
| Ausência de infraestrutura de deploy | Baixo | Início local, deploy apenas na Beta 2 |
| Dependência do SharePoint Excel (Escala do Fluxo) | Médio | Fallback manual de inserção de dados caso a integração falhe |

---

## 12. Referências

- `docs/001-Especificação Técnica...`
- `docs/ADRs/002-Layout-Design-Aesthetics.md`
- `docs/ADRs/003-Bot-Scraping-Playwright-LifeOnline.md`
- `docs/Prototipo 001 - Wireframe escrito.pdf`
- `SISGET - SISTEMA DE GERENCIAMENTO DE TRÁFEGO.xlsx` (planilha original, 12 abas)
- `seeds/` — Dados iniciais extraídos da planilha para seeding do banco de dados
- `BAB Base Automática para Bafômetros.doc` — Referência para módulo BAB (ignorar por enquanto)
