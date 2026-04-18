# Documento de Prototipagem — SISGET WEB (Sistema de Gestão de Tráfego)

> **Versão:** 1.2 (Baseada no Protótipo Figma)  
> **Atualizado em:** 16/04/2026  
> **Referência:** `000-PRD-SISGET.md`, `001-Especificação Técnica`, `Figma Export v1.0`

Este documento formaliza o protótipo funcional do sistema, detalhando a integração de dados e a nova interface intuitiva baseada em módulos e indicadores de performance.

---

## 1. Arquitetura de Interface (UX/UI)

A nova interface adota um design de **Alta Fidelidade** com foco em usabilidade e redução de carga cognitiva para os auxiliares de tráfego.

- **Tema:** Dark Mode profundo com acentuações em Azul Satélite (#67bed9).
- **Design System:** Uso extensivo de **Glassmorphism**, gradientes sutis e micro-interações.
- **Indicadores Rápidos (Stats):** Localizados no topo do dashboard para visualização imediata de:
  - Carros em Trânsito (Contagem ativa).
  - Ocorrências Abertas (Status crítico).
  - Status do Plantão (Identificação do responsável atual).
- **Widget de Contexto:** Previsão do tempo local (Imperatriz) integrada para alertar sobre condições de tráfego.

---

## 2. Navegação por Módulos (Cards de Acesso)

O acesso às funcionalidades é feito via cards interativos com feedback visual (hover states) e ícones semânticos:

- **Controle de Garagem:** Gestão de reservas, pneus e medição de tanques.
- **Controle de Frota:** Posicionamento estratégico e operações turnadas.
- **Escala do Fluxo:** Visualização em tempo real (Sync SharePoint).
- **Consulta Rápida:** Spotlight global (Ctrl+K) para buscas cross-entidade.

---

## 3. Detalhamento de Funcionalidades Nucleares

### 3.1 Telemetria e Combustível (Garagem)

- **Interface:** Barras de progresso dinâmicas e modais de entrada para medição em centímetros.
- **Calculadora:** Conversão automática baseada na tabela técnica de 15.000L.

### 3.2 Operação de Frota

- **Modo Turno:** Alternância fluida entre visão Diurna e Noturna.
- **Feedback Visual:** Cores vinculadas ao status (Canceled = Red, In Transit = Blue, Pending = Amber).

---

## 4. Estrutura do Protótipo Visual (Dashboard v2)

```text
[ HEADER: Olá, Usuário! (Saudação Dinâmica) | Data | Widget Clima: 28°C Imperatriz ]

---------------------------------------------------------------------------------
| INDICADORES (STATS)                                                           |
| [ Carros em Trânsito: 24 ] | [ Ocorrências: 3 ] | [ Plantão: GUSTAVO MELLO ]  |
---------------------------------------------------------------------------------

---------------------------------------------------------------------------------
| MÓDULOS PRINCIPAIS                                                            |
|                                                                               |
| [ ⛽ GARAGEM ]        [ 🚌 FROTA ]          [ 📅 ESCALA ]        [ 🔍 PESQUISA ] |
| Reservas / Tanques  | Bases / Operação    | Sync SharePoint   | Busca Global    |
---------------------------------------------------------------------------------

[ FOOTER: Última Sincronização SharePoint: 07:38 | Copyright Satélite Norte ]
```

---

## 5. Próximos Passos (Sprint Beta 1)

- [x] Design de UX/UI no Figma (Implementado no protótipo v2).
- [ ] Integração do backend Spring Boot com a UI via Axios/Fetch.
- [ ] Implementação da Calculadora de Tanques no Dashboard de Garagem.
- [ ] Configuração do Middleware de Autenticação JWT.

---

## 6. Módulos Auxiliares Documentados

- **Gestão de Pessoal:** Integrada na visão de Frota (Motoristas).
- **Segurança:** Auditoria de acessos via logs de alteração em cada módulo.

---

## 7. Módulos Futuros (não incluir agora)

- **Gestão de RAVs:** Seeds com 85 registros prontos em `/seeds/ravs.json`.
- **Gestão de Pessoal:** Controle de Dobras e horários de Refeição.
- **Pontos de Apoio (PAs):** Monitoramento de Porangatu, Guaraí, Paragominas, Belém, São Luís e Santa Inês.
- **Bot de Rastreamento:** Automação Selenium (integração VITAE).
