# Tasks — SISGET WEB

> **Referência:** `000-PRD-SISGET.md` (PRD v1.0)  
> **Sprint:** Beta 1 (15/04/2026 → 15/05/2026)  
> **Legenda:** 🔴 Bloqueante | 🟡 Alta | 🟢 Normal | ⚪ Baixa

---

## Fase 0 — Setup e Infraestrutura

### TASK-001: Inicializar projeto back-end (Spring Boot)
- **Prioridade:** 🔴
- **Módulo:** Infraestrutura
- **Descrição:** Criar projeto Spring Boot com estrutura de pastas (controller, service, repository, model, config). Configurar SQLite como banco de dados, `.env` para variáveis sensíveis, `.gitignore` atualizado.
- **Critérios de aceite:**
  - [ ] Projeto compila e roda sem erros
  - [ ] SQLite configurado e criando arquivo de banco
  - [ ] `.env` com variáveis de exemplo e `.env.example` no repo
  - [ ] `.gitignore` inclui `.env`, `*.db`, `node_modules/`, etc.
- **Dependências:** Nenhuma

### TASK-002: Inicializar projeto front-end (Next.js)
- **Prioridade:** 🔴
- **Módulo:** Infraestrutura
- **Descrição:** Criar projeto Next.js com estrutura de pastas por feature/módulo. Configurar design system base (CSS Vanilla) com tokens (cores, tipografia, espaçamentos).
- **Critérios de aceite:**
  - [x] Projeto roda com `npm run dev`
  - [x] Design system base com tema dark implementado
  - [x] Estrutura de pastas por módulo
  - [x] Layout base com sidebar/header (Dashboard básico implementado)
- **Status:** ✅ Concluído na branch `feature/frontend-prototype`
- **Dependências:** Nenhuma

### TASK-003: Modelagem do banco de dados e seeds
- **Prioridade:** 🔴
- **Módulo:** Dados
- **Descrição:** Definir entidades JPA (Motorista, Veículo, Reserva, Tanque, Usuário) e criar script de seeding a partir dos JSONs em `/seeds/`.
- **Critérios de aceite:**
  - [ ] Entidades JPA mapeadas e tabelas criadas automaticamente
  - [ ] Script de seed importa `motoristas.json` (604), `frota.json` (170), `reservas.json` (5)
  - [ ] Consulta básica via repository funcional
- **Dependências:** TASK-001
- **Seeds:** `/seeds/motoristas.json`, `/seeds/frota.json`, `/seeds/reservas.json`

---

## Fase 1 — Autenticação e Dashboard

### TASK-004: Autenticação por matrícula
- **Prioridade:** 🔴
- **Módulo:** Auth
- **Descrição:** Implementar login por matrícula + senha com JWT. Senha padrão = matrícula. Endpoint de troca de senha.
- **Critérios de aceite:**
  - [ ] POST `/api/auth/login` retorna JWT
  - [ ] Middleware de autenticação protege rotas
  - [ ] Senha padrão = matrícula na seed
  - [ ] Endpoint `/api/auth/change-password` funcional
- **Dependências:** TASK-003
- **RF:** RF-01

### TASK-005: Tela de login (front-end)
- **Prioridade:** 🔴
- **Módulo:** Auth / UI
- **Descrição:** Tela de login dark/glassmorphism com campos matrícula e senha. Feedback de erro. Redirect para dashboard.
- **Critérios de aceite:**
  - [ ] Tela de login responsiva e estilizada
  - [ ] Integração com API de auth
  - [ ] Toast de erro em credenciais inválidas
  - [ ] Redirect para `/dashboard` após sucesso
- **Dependências:** TASK-002, TASK-004

### TASK-006: Dashboard principal
- **Prioridade:** 🟡
- **Módulo:** Dashboard / UI
- **Descrição:** Tela principal com saudação dinâmica, cards dos módulos, ícone de notificação (Bell), e previsão do tempo (mock).
- **Critérios de aceite:**
  - [ ] Saudação "Bom dia/tarde/noite, [Nome]"
  - [ ] Cards clicáveis para cada módulo ativo
  - [ ] Componente Skeleton durante carregamento
  - [ ] Layout responsivo
- **Dependências:** TASK-005
- **RF:** RF-02

---

## Fase 2 — Controle de Garagem

### TASK-007: API de Reservas (Oficina) — CRUD
- **Prioridade:** 🟡
- **Módulo:** Garagem / API
- **Descrição:** Endpoints REST para CRUD de reservas (carros e pneus). Campos: CÓD, TIPO, STATUS, DESCRIÇÃO. Registrar timestamp e autor em cada alteração.
- **Critérios de aceite:**
  - [ ] GET/POST/PUT/DELETE `/api/reservas`
  - [ ] Filtro por tipo (Carro/Pneu) e status
  - [ ] Timestamp + autor registrado automaticamente
  - [ ] Testes unitários ≥ 70%
- **Dependências:** TASK-003
- **RF:** RF-03, RF-10

### TASK-008: UI de Reservas (Oficina)
- **Prioridade:** 🟡
- **Módulo:** Garagem / UI
- **Descrição:** Cards 1x1 para Carros Reserva e Pneus Reserva. Modal de adição/edição. Exibição de timestamp de última atualização.
- **Critérios de aceite:**
  - [ ] Cards com tabela de itens
  - [ ] Modal funcional para criar/editar
  - [ ] Exibe "atualizado em: [data] – [hora] ([autor])"
  - [ ] Estado vazio mostra "Não informado"
- **Status:** ✅ Concluído (Layout refinado e integração de ativos)
- **Dependências:** TASK-006, TASK-007

### TASK-009: API de Combustível (Tanques)
- **Prioridade:** 🟡
- **Módulo:** Garagem / API
- **Descrição:** Endpoints para consultar e atualizar medição dos 2 tanques. Calculadora cm → litros no backend usando tabela técnica.
- **Critérios de aceite:**
  - [ ] GET `/api/tanques` retorna estado atual dos 2 tanques
  - [ ] PUT `/api/tanques/{id}` atualiza medição (cm) e calcula litros
  - [ ] Timestamp + autor em cada atualização
  - [ ] Tabela de conversão carregada corretamente
- **Dependências:** TASK-003
- **RF:** RF-05, RF-10

### TASK-010: UI de Combustível
- **Prioridade:** 🟡
- **Módulo:** Garagem / UI
- **Descrição:** Visualização dos tanques (barra de progresso) + botão "Atualizar Medição" com calculadora embutida.
- **Critérios de aceite:**
  - [ ] Barras de progresso para cada tanque (volume/15000L)
  - [ ] Botão "Atualizar Medição" abre modal com input cm
  - [ ] Conversão cm → litros exibida em tempo real
  - [ ] Timestamp de última atualização visível
- **Status:** ✅ Concluído (Tanques, Cores Reativas e Análise de Fluxo)
- **Dependências:** TASK-006, TASK-009

---

## Fase 3 — Controle de Frota

### TASK-011: API de Posicionamento de Frota
- **Prioridade:** 🟡
- **Módulo:** Frota / API
- **Descrição:** CRUD de posicionamento segregado por base (Imperatriz, São Luís, Belém). Campos: DATA, FROTA, HORÁRIO, ORIGEM, DESTINO.
- **Critérios de aceite:**
  - [ ] GET `/api/posicionamento?base=IMP` filtra por base
  - [ ] POST para registrar novo posicionamento
  - [ ] Campo FROTA aceita "CANCELADO" como valor
  - [ ] Testes unitários ≥ 70%
- **Dependências:** TASK-003
- **RF:** RF-04, RF-09

### TASK-012: UI de Posicionamento de Frota
- **Prioridade:** 🟡
- **Módulo:** Frota / UI
- **Descrição:** Três tabelas lado a lado (Imperatriz, São Luís, Belém). Linhas canceladas em vermelho. Rodapé com resumo colorido.
- **Critérios de aceite:**
  - [ ] 3 colunas de tabelas lado a lado
  - [ ] Linhas "CANCELADO" com fundo vermelho
  - [ ] Rodapé: Carro Reserva (verde), Grade Futura (amarelo), Indisponível (vermelho)
  - [ ] Responsivo (stack vertical em telas pequenas)
- **Status:** ✅ Concluído (Tabelas lado a lado e resumo colorido)
- **Dependências:** TASK-006, TASK-011

### TASK-013: API de Operação de Frota (Diurna/Noturna)
- **Prioridade:** 🟡
- **Módulo:** Frota / API
- **Descrição:** CRUD para operação de frota com turno. Campos: DATA, SAÍDA, SERVIÇO, FROTA, PLACA, MOTORISTA (nome+mat), LINHA. Seção lateral: carros reserva, pneus, ocorrências, outros.
- **Critérios de aceite:**
  - [ ] GET `/api/operacao?turno=DIURNO` filtra por turno
  - [ ] POST para registrar operação
  - [ ] Autocomplete de motorista por matrícula/nome
  - [ ] Autocomplete de veículo por frota/placa
- **Dependências:** TASK-003
- **RF:** RF-07

### TASK-014: UI de Operação de Frota
- **Prioridade:** 🟡
- **Módulo:** Frota / UI
- **Descrição:** Duas tabelas (abas Diurna/Noturna) com seção lateral de resumo. Autocomplete de motorista e veículo nos formulários.
- **Critérios de aceite:**
  - [ ] Tabs para alternar Diurna/Noturna
  - [ ] Tabela com todas as colunas da spec
  - [ ] Seção lateral com Carros Reserva, Pneus, Ocorrências, Outros
  - [ ] Autocomplete funcional
- **Status:** ✅ Concluído (Abas Turno, Seleção Lateral e Colunas Extras)
- **Dependências:** TASK-006, TASK-013

---

## Fase 4 — Escala e Consulta

### TASK-015: Integração Escala do Fluxo (SharePoint)
- **Prioridade:** 🟡
- **Módulo:** Escala / API
- **Descrição:** Desenvolver serviço de consumo da planilha Excel Online (SharePoint) da Escala do Fluxo. Parse e segregação dos dados por base/turno.
- **Critérios de aceite:**
  - [ ] Serviço lê a planilha SharePoint (via API ou download)
  - [ ] Dados parseados e mapeados para as entidades do sistema
  - [ ] Segregação correta por base e turno
  - [ ] Fallback: inserção manual caso integração falhe
- **Dependências:** TASK-003
- **RF:** RF-08

### TASK-016: UI da Escala do Fluxo
- **Prioridade:** 🟡
- **Módulo:** Escala / UI
- **Descrição:** Tabela de visualização da escala diária com todos os campos operacionais. Indicador de última sincronização.
- **Critérios de aceite:**
  - [ ] Tabela com todas as colunas da spec (4.4)
  - [ ] Indicador "Última Sync: [timestamp]"
  - [ ] Botão de sync manual
- **Status:** ✅ Concluído (Visualização completa e Fallback Local)
- **Dependências:** TASK-006, TASK-015

### TASK-017: Módulo de Consulta Rápida (Pesquisa)
- **Prioridade:** 🟢
- **Módulo:** Pesquisa / Full-stack
- **Descrição:** API de busca unificada + UI com Spotlight (Ctrl+K). Busca por Placa → Frota, Frota → Placa, Nome/Matrícula → Motorista.
- **Critérios de aceite:**
  - [ ] GET `/api/pesquisa?q=...` busca em todas as entidades
  - [ ] UI Spotlight com Ctrl+K acessível de qualquer tela
  - [ ] Resultados agrupados por tipo (Motorista, Veículo)
  - [ ] Resposta < 500ms
- **Dependências:** TASK-003
- **RF:** RF-06


### TASK-018: (Task Removida)

---

## Fase Bônus — Automação (Concluída Antecipadamente)

### TASK-023: Bot de Rastreamento (Life Online)
- **Prioridade:** 🟡
- **Módulo:** Automação / Python
- **Descrição:** Implementar bot Playwright que autentica no sistema Life Online, navega até a seção de rastreamento online e coleta os dados de GPS e status de toda a frota. O resultado é persistido em `fleet_status.json` para consumo pelo back-end SISGET.
- **Critérios de aceite:**
  - [x] Bot autentica com sucesso no Life Online
  - [x] Bot navega para Acompanhamento → Rastreamento → Online
  - [x] Bot captura **167 veículos** (frota completa), incluindo dados GPS
  - [x] `fleet_status.json` gerado com 68 campos por veículo
  - [x] Decoder multi-camada para payload double-escaped de 314KB
  - [x] Credenciais exclusivamente no `.env` (fora do VCS)
  - [x] ADR documentado em `docs/ADRs/003-Bot-Scraping-Playwright-LifeOnline.md`
- **Status:** ✅ Conclulido em 16/04/2026
- **Dependências:** Nenhuma
- **RF:** RF-12
- **Nota:** Implementado antecipadamente. Próximo passo: endpoint `GET /api/rastreamento` no Spring Boot + `@Scheduled` para atualização periódica.

---


### TASK-019: Auditoria de segurança OWASP Top 5
- **Prioridade:** 🟡
- **Módulo:** Segurança
- **Descrição:** Revisar e mitigar as 5 principais vulnerabilidades OWASP no backend e frontend.
- **Critérios de aceite:**
  - [ ] Injection: inputs sanitizados, queries parametrizadas
  - [ ] Broken Auth: JWT seguro, expiração, refresh
  - [ ] Sensitive Data: `.env` protegido, HTTPS ready
  - [ ] SSRF: validação de URLs internas
  - [ ] Security Misconfiguration: headers, CORS
- **Dependências:** TASK-004
- **RNF:** RNF-03, RNF-04

### TASK-020: Testes e cobertura
- **Prioridade:** 🟡
- **Módulo:** Qualidade
- **Descrição:** Garantir ≥ 70% de cobertura de testes nos módulos críticos (Auth, Frota, Garagem).
- **Critérios de aceite:**
  - [ ] Testes unitários para Services e Controllers
  - [ ] Testes de integração para fluxos principais
  - [ ] Relatório de cobertura gerado
  - [ ] ≥ 70% nos módulos críticos
- **Dependências:** Todas as TASKs de API

### TASK-021: UX Review e Polish
- **Prioridade:** 🟢
- **Módulo:** UX/UI
- **Descrição:** Revisão final de UX: feedback visual, toasts, loading states, responsividade, acessibilidade básica.
- **Critérios de aceite:**
  - [ ] Toasts em todas as ações CRUD
  - [ ] Loading skeletons em todas as consultas
  - [ ] Layout responsivo validado em desktop e tablet
  - [ ] Cores de status consistentes em todos os módulos
- **Status:** 🟡 Em Progresso (Notificações, Centralização e Contraste concluídos)
- **Dependências:** Todas as TASKs de UI

---

## Resumo do Sprint

| Fase       | Tasks          | Descrição                         |
| ---------- | -------------- | --------------------------------- |
| **Fase 0** | TASK-001 a 003 | Setup, modelagem, seeds           |
| **Fase 1** | TASK-004 a 006 | Auth + Dashboard                  |
| **Fase 2** | TASK-007 a 010 | Garagem (Reservas + Combustível)  |
| **Fase 3** | TASK-011 a 014 | Frota (Posicionamento + Operação) |
| **Fase 4** | TASK-015 a 017 | Escala, Pesquisa                  |
| **Fase 5** | TASK-019 a 021 | Segurança, Testes, Polish         |
| **Bônus** | TASK-023 ✅    | Bot Rastreamento Life Online      |
| **Backlog**| TASK-022       | Chat em Tempo Real (Sidebar)      |

**Total:** 22 tasks (21 sprint + 1 bônus concluída)  
**Cadência sugerida:** ~5 tasks por semana
